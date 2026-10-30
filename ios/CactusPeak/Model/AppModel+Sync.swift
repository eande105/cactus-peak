import Foundation
import Supabase
import OSLog

private let syncLog = Logger(subsystem: "com.cactuspeak.member", category: "Sync")

/// Auth, loading and write-through. The database is the source of truth. Every write is optimistic:
/// the screen changes at once, the write runs, and a failed write puts the old values back and says why.
extension AppModel {
    /// The app refreshes on launch and on becoming active when the last refresh is older than this.
    static let staleAfter: TimeInterval = 5 * 60

    // MARK: Launch and auth

    /// Follows Supabase Auth and loads data. Called once at launch.
    func start() {
        guard let client = Backend.client else { return }
        Task { await refreshCatalog() }
        Task { [weak self] in
            for await (event, session) in client.auth.authStateChanges {
                guard let self else { return }
                switch event {
                case .initialSession, .signedIn, .tokenRefreshed, .userUpdated:
                    if let session { await self.didSignIn(session.user.id) } else if event == .initialSession { self.didSignOut() }
                case .signedOut, .userDeleted:
                    self.didSignOut()
                default:
                    break
                }
            }
        }
    }

    /// Becoming active: refresh what is older than five minutes.
    func refreshIfStale() {
        guard let last = lastSync, Date().timeIntervalSince(last) < Self.staleAfter else {
            Task { await refreshAll() }
            return
        }
        // The clock is cheap to read and another device may have moved it.
        Task { await refreshClock() }
    }

    func refreshAll() async {
        lastSync = Date()
        await refreshCatalog()
        await refreshCounts()
        await refreshHousehold()
    }

    func signIn(email: String, password: String) async throws {
        guard let client = Backend.client else { throw BackendError(kind: .notConfigured) }
        do {
            let session = try await client.auth.signIn(email: email.trimmingCharacters(in: .whitespaces).lowercased(), password: password)
            await didSignIn(session.user.id)
        } catch {
            throw BackendError(error)
        }
    }

    func signOut() async {
        try? await Backend.client?.auth.signOut()
        didSignOut()
    }

    /// DEBUG: sign in as a demo account with the demo password from Secrets.xcconfig.
    func signInDemo(_ account: DemoAccount) async throws {
        guard let pw = BackendConfig.current?.demoPassword else { throw BackendError(kind: .notConfigured) }
        if signedIn { await signOut() }
        try await signIn(email: account.email, password: pw)
    }

    func didSignIn(_ userID: UUID) async {
        if authUserID != userID {
            clearHousehold()
            authUserID = userID
            onboarded = UserDefaults.standard.bool(forKey: "cp.onboarded.\(userID.uuidString)")
            if let saved = cache.read(HouseholdRows.self, from: LocalCache.householdFile(userID)) {
                applyHousehold(saved.value, savedAt: saved.savedAt)
            }
        }
        signedIn = true
        await refreshCounts()
        await refreshHousehold()
    }

    func didSignOut() {
        guard signedIn || authUserID != nil else { return }
        signedIn = false
        authUserID = nil
        onboarded = false
        cache.removeHouseholds()
        clearHousehold()
        LiveActivityManager.shared.sync(model: self)
        publishSnapshot()
    }

    /// Forgets every household value, so the next member never sees the last one's data.
    func clearHousehold() {
        member = MemberProfile(first: "", last: "", plan: .ridge, homeClubID: clubs.first?.id ?? "gilbert-val-vista",
                               memberNumber: "", billingDay: 1, sinceText: "", email: "")
        memberRowID = ""; householdID = ""
        people = []; bookings = []; familyClassRows = []; visits = []; strikes = []; inbox = []; guestPasses = []; invoices = []
        pauseUntil = nil; freeze = nil; membershipCancelOn = nil; pendingDowngrade = nil; paymentFailedDay = 0
        guestUsedThisCycle = 0; checkedInAt = nil; hold = nil; spotDelta = [:]; others = [:]; inFlight = []
        bookingsKnown = false; householdLoaded = false; householdSavedAt = nil; toast = nil
    }

    // MARK: Loading

    func refreshCatalog() async {
        guard let api else { return }
        do {
            let rows = try await api.catalog()
            guard !rows.isEmpty else { return }
            let saved = Date()
            applyCatalog(rows, savedAt: saved)
            networkOffline = false
            try? cache.write(rows, to: LocalCache.catalogFile, savedAt: saved)
            publishSnapshot()
        } catch {
            noteFailure(error, "catalog")
        }
    }

    func refreshCounts() async {
        guard let api, let first = sessions.first, let last = sessions.last else { return }
        do {
            let rows = try await api.sessionCounts(from: first.start, to: last.end)
            // A write still running would be counted twice: keep the local change until it settles.
            guard pendingWrites == 0 else { return }
            applyCounts(rows)
            spotDelta = [:]
            networkOffline = false
        } catch {
            noteFailure(error, "counts")
        }
    }

    func refreshHousehold() async {
        guard let api, let user = authUserID else { return }
        if pendingWrites > 0 { refreshAfterWrites = true; return }
        // The clock first: the household mapping uses `now`.
        await refreshClock()
        do {
            let rows = try await api.household(userID: user)
            guard authUserID == user else { return } // signed out or switched while loading
            if pendingWrites > 0 { refreshAfterWrites = true; return }
            let saved = Date()
            applyHousehold(rows, savedAt: saved)
            networkOffline = false
            try? cache.write(rows, to: LocalCache.householdFile(user), savedAt: saved)
        } catch {
            noteFailure(error, "household")
            if case .notFound = BackendError(error).kind {
                showToast("This login has no membership. Sign in with a member account.")
            }
        }
    }

    func applyHousehold(_ rows: HouseholdRows, savedAt: Date) {
        let s = HouseholdMapper.map(rows, coaches: coaches, now: now) { [sessionIndex] in sessionIndex[$0]?.coachID }
        // A different member, or a home club changed elsewhere: the club on screen follows the new home club.
        let homeChanged = memberRowID != s.memberID || member.homeClubID != s.member.homeClubID
        householdID = s.householdID
        memberRowID = s.memberID
        member = s.member
        people = s.people
        bookings = s.bookings
        strikes = s.strikes
        pauseUntil = s.pauseUntil
        freeze = s.freeze
        membershipCancelOn = s.membershipCancelOn
        pendingDowngrade = s.pendingDowngrade
        paymentFailedDay = s.paymentFailedDay
        homeClubChangedThisCycle = s.homeClubChangedThisCycle
        inbox = s.inbox
        guestPasses = s.guestPasses
        guestUsedThisCycle = s.guestUsedThisCycle
        visits = s.visits
        weeklyGoal = s.weeklyGoal
        prefs.interests = s.interests
        prefs.reminderLead = [30, 60, 120].contains(s.reminderLead) ? s.reminderLead : 60
        ptSessionsLeft = s.ptSessionsLeft
        if let e = s.ptExpires { ptExpires = e }
        invoices = s.invoices
        familyClassRows = rows.bookings.filter { $0.kind == "class" && $0.memberId != s.memberID }
            .compactMap { r in r.sessionId.map { ($0, r.status) } }
        if s.onboarded && !onboarded { onboarded = true }
        if homeChanged || passClubID.isEmpty || clubIndex[passClubID] == nil { passClubID = member.homeClubID }
        if homeChanged { AppRouter.shared.viewingClubID = member.homeClubID }
        householdSavedAt = savedAt
        householdLoaded = true
        bookingsKnown = true
        settleFinishedBookings()
        visibleUpdate += 1
        publishSnapshot()
        LiveActivityManager.shared.sync(model: self)
    }

    private func noteFailure(_ error: any Error, _ what: String) {
        syncLog.error("Load failed (\(what, privacy: .public)): \(String(describing: error), privacy: .public)")
        if case .offline = BackendError(error).kind { networkOffline = true }
    }

    /// "5:12 a.m." for the offline banners: when the data on screen was saved.
    var savedDataText: String {
        guard let d = [catalogSavedAt, householdSavedAt].compactMap({ $0 }).min() else { return "No saved data yet." }
        let day = AZ.cal.isDateInToday(d) ? "" : "\(d.cpFormat("MMM d")), "
        return "Showing saved info from \(day)\(d.cpTime)"
    }

    // MARK: Write-through

    /// The values a failed write puts back.
    struct Rollback {
        var bookings: [Booking]
        var spotDelta: [SessionID: Int]
        var strikes: [Date]
        var pauseUntil: Date?
        var people: [Person]
        var inbox: [InboxItem]
        var guestPasses: [GuestPass]
        var guestUsedThisCycle: Int
        var freeze: FreezeState?
        var membershipCancelOn: Date?
        var pendingDowngrade: (PlanTier, Date)?
        var member: MemberProfile
        var passClubID: ClubID
        var homeClubChangedThisCycle: Bool
        var hold: ReserveHold?
    }

    func rollbackPoint() -> Rollback {
        Rollback(bookings: bookings, spotDelta: spotDelta, strikes: strikes, pauseUntil: pauseUntil, people: people, inbox: inbox,
                 guestPasses: guestPasses, guestUsedThisCycle: guestUsedThisCycle, freeze: freeze, membershipCancelOn: membershipCancelOn,
                 pendingDowngrade: pendingDowngrade, member: member, passClubID: passClubID,
                 homeClubChangedThisCycle: homeClubChangedThisCycle, hold: hold)
    }

    func restore(_ r: Rollback) {
        bookings = r.bookings; spotDelta = r.spotDelta; strikes = r.strikes; pauseUntil = r.pauseUntil; people = r.people
        inbox = r.inbox; guestPasses = r.guestPasses; guestUsedThisCycle = r.guestUsedThisCycle; freeze = r.freeze
        membershipCancelOn = r.membershipCancelOn; pendingDowngrade = r.pendingDowngrade; member = r.member
        passClubID = r.passClubID; homeClubChangedThisCycle = r.homeClubChangedThisCycle; hold = r.hold
        visibleUpdate += 1
        publishSnapshot()
        LiveActivityManager.shared.sync(model: self)
    }

    /// Runs `op` against the database after an optimistic change. On failure it restores `rollback`, shows
    /// `failure` plus the reason, and reloads the household so the screen matches the database again.
    /// With no backend (tests, previews) the local change stands.
    @discardableResult
    func writeThrough(_ failure: String, rollback: Rollback?, silent: Bool = false, guarding sessionID: SessionID? = nil,
                      _ op: @escaping @Sendable (BackendAPI) async throws -> Void) -> Task<Void, Never>? {
        guard let api, signedIn else {
            if let sessionID { inFlight.remove(sessionID) }
            return nil
        }
        pendingWrites += 1
        if let sessionID { inFlight.insert(sessionID) }
        let task = Task { [weak self] in
            var failed = false
            do {
                try await op(api)
            } catch {
                failed = true
                self?.failedWrites += 1
                syncLog.error("Write failed: \(String(describing: error), privacy: .public)")
                guard let self else { return }
                if let rollback { self.restore(rollback) }
                if !silent { self.showToast("\(failure) \(BackendError(error).localizedDescription)") }
                if case .offline = BackendError(error).kind { self.networkOffline = true }
            }
            guard let self else { return }
            if let sessionID { self.inFlight.remove(sessionID) }
            self.pendingWrites -= 1
            if self.pendingWrites == 0 {
                if failed || self.refreshAfterWrites {
                    self.refreshAfterWrites = false
                    await self.refreshHousehold()
                }
                await self.refreshCounts()
            }
        }
        writeTasks.append(task)
        writeTasks.removeAll { $0.isCancelled }
        return task
    }

    /// Waits for every running write. App Intents call this so Siri reports what the database accepted.
    func flushWrites() async {
        let tasks = writeTasks
        writeTasks = []
        for t in tasks { await t.value }
    }

    // MARK: Row helpers

    func insertRows(for b: Booking) -> [[String: AnyJSON]] {
        let clubName = club(b.clubID).fullName
        let coachSlug = b.coachID.map { coach($0).slug }
        if b.kind == .kids {
            let kids = people.filter { b.people.contains($0.first) }
            return zip(b.rowIDs, kids).map { rowID, kid in
                HouseholdMapper.insertRow(b, rowID: rowID, memberID: kid.id, ownerID: memberRowID, householdID: householdID,
                                          clubName: clubName, coachSlug: nil, now: now)
            }
        }
        return [HouseholdMapper.insertRow(b, rowID: b.id, memberID: memberRowID, ownerID: memberRowID, householdID: householdID,
                                          clubName: clubName, coachSlug: coachSlug, now: now)]
    }

    /// Books a new booking row (or rows) that is already in `bookings`.
    func writeInsert(_ b: Booking, failure: String, rollback: Rollback, guarding sessionID: SessionID? = nil) {
        let rows = insertRows(for: b)
        writeThrough(failure, rollback: rollback, guarding: sessionID) { api in try await api.insert("bookings", rows) }
    }

    func writeBookingUpdate(_ b: Booking, _ values: [String: AnyJSON], failure: String, rollback: Rollback) {
        let ids = b.rowIDs.isEmpty ? [b.id] : b.rowIDs
        writeThrough(failure, rollback: rollback) { api in try await api.update("bookings", ids: ids, values) }
    }

    func writeBookingDelete(_ b: Booking, failure: String, rollback: Rollback?, silent: Bool = false) {
        let ids = b.rowIDs.isEmpty ? [b.id] : b.rowIDs
        writeThrough(failure, rollback: rollback, silent: silent) { api in try await api.delete("bookings", ids: ids) }
    }

    func writeHousehold(_ values: [String: AnyJSON], failure: String, rollback: Rollback) {
        let id = householdID
        writeThrough(failure, rollback: rollback) { api in try await api.update("households", ids: [id], values) }
    }

    func writeMember(_ id: String, _ values: [String: AnyJSON], failure: String, rollback: Rollback?, silent: Bool = false) {
        writeThrough(failure, rollback: rollback, silent: silent) { api in try await api.update("members", ids: [id], values) }
    }

    // MARK: Shared demo clock

    /// Reads the household's demo clock, so this iPhone shows the same demo time as the web app.
    func refreshClock() async {
        guard let api, authUserID != nil, !clockPinnedLocally, !frozenClock else { return }
        do {
            applyClock(try await api.demoClock(), received: Date())
        } catch {
            noteFailure(error, "clock")
        }
    }

    /// `serverNow` corrects for this iPhone's clock being a little ahead or behind the server.
    func applyClock(_ c: DemoClockRow, received: Date) {
        realOrigin = c.startedAt.addingTimeInterval(received.timeIntervalSince(c.serverNow))
        clockOffset = TimeInterval(c.skewMs) / 1000
    }

    /// Demo controls: moves the clock for every device of the household.
    func jumpClock(by seconds: TimeInterval) {
        clockOffset += seconds
        let skew = Int((clockOffset * 1000).rounded())
        let id = householdID
        writeThrough("Couldn't move the demo clock.", rollback: nil) { api in
            try await api.update("households", ids: [id], ["demo_clock_skew_ms": .integer(skew)])
        }
    }

    /// Demo controls: starts the demo day again at Tue 5:40 a.m. on every device of the household.
    func restartClock() {
        let started = Date()
        realOrigin = started
        clockOffset = 0
        let id = householdID
        writeThrough("Couldn't restart the demo clock.", rollback: nil) { api in
            try await api.update("households", ids: [id], ["demo_clock_started_at": .date(started), "demo_clock_skew_ms": .integer(0)])
        }
    }

    /// Puts the signed-in household back to its demo state, then reloads it.
    func resetDemoHousehold() async {
        guard let api else { return }
        do {
            try await api.resetDemoHousehold()
            await refreshCounts()
            await refreshHousehold()
            showToast("Sample data reset.")
        } catch {
            showToast("Couldn't reset. \(BackendError(error).localizedDescription)")
        }
    }
}

extension AppModel {
    /// Waits for running writes and reports whether all of them reached the database.
    func writesSucceeded() async -> Bool {
        let before = failedWrites
        await flushWrites()
        return failedWrites == before
    }
}
