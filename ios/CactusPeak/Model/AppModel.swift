import Foundation
import Observation
import SwiftUI
import WidgetKit
import Supabase

struct MemberProfile: Hashable, Sendable {
    var first: String
    var last: String
    var plan: PlanTier
    var homeClubID: ClubID
    var memberNumber: String
    var billingDay: Int
    var sinceText: String
    var age: Int = 34
    var isTeen: Bool = false
    var ownerFirst: String = ""
    var email: String = ""
    var name: String { "\(first) \(last)" }
}

/// Demo logins (supabase/README.md). DEBUG builds sign in as one of them from Settings > Demo controls.
/// All use the same demo password. iOS testing uses Daniel, Ron and Linda; the web app's tests use the others.
enum DemoAccount: String, CaseIterable, Identifiable, Sendable {
    case maya, chris, alicia, jordan, daniel, ron, linda
    var id: String { rawValue }
    var email: String { "\(rawValue)@example.com" }
    var title: String {
        switch self {
        case .maya: "Maya Brandt · Ridge · Val Vista"
        case .chris: "Chris Brandt · on Maya's plan"
        case .alicia: "Alicia Ramos · family owner"
        case .jordan: "Jordan Ramos · teen"
        case .daniel: "Daniel Whitaker · Trailhead · Dobson"
        case .ron: "Ron Park · Ridge · Red Mountain"
        case .linda: "Linda Park · on Ron's plan"
        }
    }
    init?(email: String) {
        guard let name = email.split(separator: "@").first else { return nil }
        self.init(rawValue: String(name))
    }
}

struct FreezeState: Hashable, Sendable { var start: Date; var end: Date; var months: Int }

struct ReserveHold: Hashable, Sendable {
    var kind: ReserveKind
    var clubID: ClubID
    var start: Date
    var label: String
    var expires: Date
    var extended: Bool
}

enum ReserveKind: String, Hashable, Codable, Sendable, CaseIterable { case court, lane, kidsClub }

struct ToastMessage: Identifiable, Equatable {
    var id = UUID()
    var text: String
    var undoID: String?
    var calendarID: String?
}

@MainActor @Observable
final class AppModel {
    static let shared = AppModel()

    // MARK: Clock (virtual, Arizona time). Sample "now" is Tue Oct 27, 2026, 5:40 a.m.
    // The household's shared clock sets realOrigin and clockOffset (see AppModel+Sync `applyClock`).
    @ObservationIgnored var realOrigin = Date()
    @ObservationIgnored private var virtualOrigin = AZ.date(2026, 10, 27, 5, 40)
    var clockOffset: TimeInterval = 0
    var frozenClock = false
    /// DEBUG `-clock` launches keep their own time and ignore the household's shared clock.
    @ObservationIgnored var clockPinnedLocally = false
    var now: Date {
        let base = frozenClock ? virtualOrigin : virtualOrigin.addingTimeInterval(Date().timeIntervalSince(realOrigin))
        return base.addingTimeInterval(clockOffset)
    }

    // MARK: Catalog (from Supabase, cached on disk)
    private(set) var clubs: [Club] = []
    private(set) var coaches: [Coach] = []
    private(set) var sessions: [ClassSession] = []
    private(set) var catalogRows = CatalogRows()
    @ObservationIgnored var clubIndex: [ClubID: Club] = [:]
    @ObservationIgnored var coachIndex: [CoachID: Coach] = [:]
    @ObservationIgnored var sessionIndex: [SessionID: ClassSession] = [:]
    @ObservationIgnored var sessionsByDay: [String: [ClassSession]] = [:]
    /// When the catalog on screen was saved, from the network or the disk cache.
    var catalogSavedAt: Date?
    /// Booked and waitlisted counts per session, across all households (`session_counts`).
    var counts: [SessionID: SessionCountRow] = [:]
    /// Local changes not yet in `counts`: +1 for a booking made here, -1 for one cancelled here.
    var spotDelta: [SessionID: Int] = [:]
    /// Other households' booked and waitlisted counts per session (web `s.others`).
    var others: [SessionID: (booked: Int, waitlisted: Int)] = [:]

    // MARK: Member and household (from Supabase)
    var member = MemberProfile(first: "", last: "", plan: .ridge, homeClubID: "gilbert-val-vista",
                               memberNumber: "", billingDay: 1, sinceText: "", email: "")
    /// `members.id` and `households.id` of the signed-in member.
    var memberRowID = ""
    var householdID = ""
    var invoices: [InvoiceRow] = []
    /// Class rows of the other household members, for spot counts.
    var familyClassRows: [(sessionID: SessionID, status: String)] = []
    var people: [Person] = []
    var bookings: [Booking] = []
    var visits: [Date] = []
    var strikes: [Date] = []
    var pauseUntil: Date?
    var freeze: FreezeState?
    var membershipCancelOn: Date?
    var pendingDowngrade: (PlanTier, Date)?
    var paymentFailedDay = 0
    var homeClubChangedThisCycle = false
    var inbox: [InboxItem] = []
    var guestPasses: [GuestPass] = []
    var guestUsedThisCycle = 0
    var favouriteSessions: Set<SessionID> = []
    var favouriteClubs: Set<ClubID> = []
    var prefs = Prefs()
    var weeklyGoal = 3
    var ptSessionsLeft = 0
    var ptExpires = AZ.date(2027, 8, 14)
    var recentSearches = ["Climb Cycle", "Pickleball Open Play"]
    var passClubID: ClubID = "gilbert-val-vista"
    var checkedInAt: Date?
    var hold: ReserveHold?
    var lastCancelled: Booking?
    var lastBookedID: String?
    var holdExpiredCount = 0
    var lastLateCancelID: String?
    var visibleUpdate = 0

    // MARK: Sync state
    /// False until the member's bookings have loaded (from the network or the disk cache). Book buttons wait.
    var bookingsKnown = false
    /// True once household data is on screen, so the welcome cover does not flash onboarding.
    var householdLoaded = false
    /// Sessions with a book request running. A second tap does nothing.
    var inFlight: Set<SessionID> = []
    /// The last fetch failed because the device is offline.
    var networkOffline = false
    var householdSavedAt: Date?
    @ObservationIgnored var lastSync: Date?
    @ObservationIgnored var pendingWrites = 0
    @ObservationIgnored var failedWrites = 0
    @ObservationIgnored var writeTasks: [Task<Void, Never>] = []
    @ObservationIgnored var refreshAfterWrites = false
    @ObservationIgnored let cache: LocalCache
    @ObservationIgnored let api: BackendAPI?

    // MARK: Environment toggles (demo controls)
    var demoOffline = false
    /// Offline: the network is down, or Demo controls say so. Booking is blocked and banners show saved data.
    var offline: Bool {
        get { demoOffline || networkOffline }
        set { demoOffline = newValue; if !newValue { networkOffline = false } }
    }
    var forceError = false
    var staleBusyness = false
    var notificationsAuthorized = true
    var toast: ToastMessage?
    var walletAdded = false
    var calendarAdded: Set<BookingID> = []
    var nextID = 100

    // Sign-in / onboarding. `signedIn` follows Supabase Auth; see AppModel+Sync.
    var signedIn = false
    @ObservationIgnored var authUserID: UUID?
    var onboarded = false {
        didSet { if let u = authUserID { UserDefaults.standard.set(onboarded, forKey: "cp.onboarded.\(u.uuidString)") } }
    }

    @ObservationIgnored private var timer: Timer?

    /// Reads the disk cache before the first frame: the catalog, and the household of a stored session.
    init(cache: LocalCache = LocalCache(), client: SupabaseClient? = Backend.client) {
        self.cache = cache
        api = client.map(BackendAPI.init(client:))
        if let saved = cache.read(CatalogRows.self, from: LocalCache.catalogFile) {
            applyCatalog(saved.value, savedAt: saved.savedAt)
        }
        if let session = client?.auth.currentSession {
            authUserID = session.user.id
            signedIn = true
            onboarded = UserDefaults.standard.bool(forKey: "cp.onboarded.\(session.user.id.uuidString)")
            if let saved = cache.read(HouseholdRows.self, from: LocalCache.householdFile(session.user.id)) {
                applyHousehold(saved.value, savedAt: saved.savedAt)
            }
        }
    }

    /// The window of dated sessions the app builds: a week back (history, streaks) to 11 days ahead.
    var sessionWindow: (from: Date, days: Int) { (virtualOrigin.startOfAZDay.addingDays(-8), 20) }

    func applyCatalog(_ rows: CatalogRows, savedAt: Date) {
        catalogRows = rows
        catalogSavedAt = savedAt
        clubs = CatalogMapper.clubs(rows.clubs)
        coaches = CatalogMapper.coaches(rows.coaches, classTypes: rows.classTypes)
        clubIndex = Dictionary(clubs.map { ($0.id, $0) }, uniquingKeysWith: { a, _ in a })
        coachIndex = Dictionary(coaches.map { ($0.id, $0) }, uniquingKeysWith: { a, _ in a })
        let w = sessionWindow
        sessions = CatalogMapper.sessions(catalog: rows, from: w.from, days: w.days)
        sessionIndex = Dictionary(sessions.map { ($0.id, $0) }, uniquingKeysWith: { a, _ in a })
        sessionsByDay = Dictionary(grouping: sessions, by: { $0.start.cpDayKey })
        visibleUpdate += 1
    }

    func startTicking() {
        guard timer == nil else { return }
        timer = Timer.scheduledTimer(withTimeInterval: 1, repeats: true) { [weak self] _ in
            MainActor.assumeIsolated { self?.tick() }
        }
    }

    // MARK: Lookups
    func club(_ id: ClubID) -> Club { clubIndex[id] ?? clubs.first { $0.id == id } ?? Club.placeholder(id) }
    func coach(_ id: CoachID) -> Coach { coachIndex[id] ?? coaches.first { $0.slug == id } ?? Coach.placeholder(id) }
    var homeClub: Club { club(member.homeClubID) }
    func session(_ id: SessionID) -> ClassSession? { sessionIndex[id] }
    func booking(_ id: BookingID) -> Booking? { bookings.first { $0.id == id } }
    var isTeen: Bool { member.isTeen }
    var currentPerson: Person? { people.first { $0.first == member.first } }

    /// This household's class bookings in a session: the member's live bookings (with changes not yet saved)
    /// plus other household members' saved rows.
    func household(in id: SessionID) -> (active: Int, saved: Int, waitlisted: Int) {
        var active = 0, saved = 0, wait = 0
        for b in bookings where b.sessionID == id {
            switch b.status {
            case .booked, .hold: active += 1; saved += 1
            case .attended, .missed: saved += 1
            case .waitlisted: wait += 1
            default: break
            }
        }
        for r in familyClassRows where r.sessionID == id {
            switch r.status {
            case "booked", "held": active += 1; saved += 1
            case "attended": saved += 1
            case "waitlisted": wait += 1
            default: break
            }
        }
        return (active, saved, wait)
    }
    /// Other households' bookings (web `othersIn`). Set by `applyCounts`.
    func othersIn(_ id: SessionID) -> (booked: Int, waitlisted: Int) { others[id] ?? (0, 0) }

    /// `session_counts` minus this household's saved bookings (web `fetchOthers`). Called only when no write is
    /// running, so the household's bookings on screen are the saved ones. Bookings made after this count once,
    /// through `household(in:).active`.
    func applyCounts(_ rows: [SessionCountRow]) {
        counts = Dictionary(rows.map { ($0.sessionId, $0) }, uniquingKeysWith: { a, _ in a })
        var out: [SessionID: (booked: Int, waitlisted: Int)] = [:]
        for r in rows {
            let mine = household(in: r.sessionId)
            let o = (max(0, r.booked - mine.saved), max(0, r.waitlisted - mine.waitlisted))
            if o.0 > 0 || o.1 > 0 { out[r.sessionId] = o }
        }
        others = out
    }
    /// The web app's `sessionLeft`: capacity − baseline − other households − this household's active bookings.
    func spotsLeft(_ s: ClassSession) -> Int {
        max(0, s.capacity - s.baseBooked - othersIn(s.id).booked - household(in: s.id).active)
    }
    /// People ahead in line who are not in this household (web `outsideWaitlist`).
    func outsideWaitlist(_ s: ClassSession) -> Int { s.baseWaitlist + othersIn(s.id).waitlisted }
    /// The web app's `waitCount`.
    func waitlistCount(_ s: ClassSession) -> Int { outsideWaitlist(s) + household(in: s.id).waitlisted }

    func sessions(club: ClubID?, day: Date) -> [ClassSession] {
        let key = day.cpDayKey
        return (sessionsByDay[key] ?? []).filter { (club == nil || $0.clubID == club) && visible($0) }
    }
    /// Teens only see classes flagged Teen OK that their age allows.
    func visible(_ s: ClassSession) -> Bool {
        if member.isTeen { return s.teenOK && s.minAge <= member.age }
        return true
    }

    var window: Int { member.plan.windowDays }
    func opensAt(_ start: Date, windowDays: Int? = nil) -> Date {
        start.startOfAZDay.addingDays(-(windowDays ?? window)).addingTimeInterval(6 * 3600)
    }
    var lastBookableDay: Date { now.startOfAZDay.addingDays(window) }

    // MARK: Busyness
    func busyness(_ club: Club) -> BusynessReading { Occupancy.busyness(club: club, at: now, staleDemo: staleBusyness) }
    func popular(_ club: Club, day: Date? = nil) -> [Double] { Occupancy.popularTimes(club: club, on: day ?? now) }

    // MARK: Account status
    var isFrozen: Bool { if let f = freeze { return now >= f.start && now < f.end } else { return false } }
    var freezeScheduled: Bool { if let f = freeze { return now < f.start } else { return false } }
    var isPaused: Bool { if let p = pauseUntil { return p > now } else { return false } }
    var strikesIn30: Int { strikes.filter { $0 > now.addingTimeInterval(-30 * 86400) }.count }
    var activeWaitlists: Int { bookings.filter { $0.status == .waitlisted && $0.kind == .classSession }.count }
    var bookingBlock: RestrictReason? {
        if offline { return .offline }
        if isFrozen { return .frozen }
        if let p = pauseUntil, p > now { return .paused(p) }
        if paymentFailedDay >= 8 { return .pastDue }
        return nil
    }
    var nextBillDate: Date {
        var comps = AZ.cal.dateComponents([.year, .month], from: now)
        comps.day = member.billingDay
        comps.hour = 0
        var d = AZ.cal.date(from: comps)!
        if d <= now.startOfAZDay { d = AZ.cal.date(byAdding: .month, value: 1, to: d)! }
        return d
    }

    /// Booking confirmation is inline: a haptic and a short toast with an Add to calendar action. No separate page.
    func announceBooked(_ b: Booking?) {
        guard let b else { return }
        lastBookedID = b.id
        let when = "\(b.start.cpFormat("EEE")) \(b.start.cpTime)"
        let text: String
        switch (b.kind, b.status) {
        case (_, .waitlisted): text = "On the waitlist, #\(b.waitlistPosition)"
        case (.court, _): text = "Court \(b.resource) is yours · \(when)"
        case (.lane, _): text = "Lane \(b.resource) is yours · \(when)"
        case (.kids, _): text = "\(b.detail) booked · \(when)"
        default: text = "Booked · \(when)"
        }
        showToast(text, calendarID: b.status == .booked && b.kind != .kids ? b.id : nil)
    }

    // MARK: Toasts
    func showToast(_ text: String, undoID: String? = nil, calendarID: String? = nil) {
        let t = ToastMessage(text: text, undoID: undoID, calendarID: calendarID)
        toast = t
        Task { [weak self] in
            try? await Task.sleep(for: .seconds(8))
            if self?.toast?.id == t.id { self?.toast = nil }
        }
    }

    // MARK: Time passing
    private var lastMinute = -1
    func tick() {
        // Holds
        if let h = hold, h.expires <= now { hold = nil; holdExpiredCount += 1 }
        for i in bookings.indices where bookings[i].status == .hold {
            if let e = bookings[i].holdExpires, e <= now {
                let b = bookings[i]
                bookings.remove(at: i)
                // The spot goes back. No rollback: the hold has ended whatever the network says.
                writeBookingDelete(b, failure: "", rollback: nil, silent: true)
                addInbox(.waitlist, "Your hold ended", "\(b.title), \(b.start.cpWeekdayShort) \(b.start.cpTime) The spot went to the next person.")
                break
            }
        }
        let minute = AZ.cal.component(.minute, from: now)
        if minute != lastMinute {
            lastMinute = minute
            settleFinishedBookings()
            publishSnapshot()
            LiveActivityManager.shared.sync(model: self)
        }
    }

    /// Past bookings: checked in = attended, otherwise a no-show, which counts as a late cancel.
    /// This is worked out on the device against the demo clock and is not written back: the database keeps
    /// `booked`, and the server owns attendance (see BUILD-NOTES "Backend").
    func settleFinishedBookings() {
        for i in bookings.indices where bookings[i].status == .booked && bookings[i].end < now {
            if bookings[i].checkedIn || bookings[i].kind == .kids {
                bookings[i].status = .attended
            } else {
                bookings[i].status = .missed
                if bookings[i].kind == .classSession || bookings[i].kind == .court || bookings[i].kind == .lane {
                    addStrike()
                }
            }
        }
    }

    func addStrike() {
        strikes.append(now)
        if strikesIn30 >= 3 { pauseUntil = now.addingTimeInterval(3 * 86400) }
    }

    /// Adds a notice and saves it to `notices`, best effort (a failed save does not undo the action that caused it).
    func addInbox(_ kind: InboxItem.Kind, _ title: String, _ body: String, route: String? = nil) {
        let item = InboxItem(id: newID("n"), kind: kind, title: title, body: body, time: now, unread: true, route: route)
        inbox.insert(item, at: 0)
        guard !memberRowID.isEmpty else { return }
        let filter = switch kind { case .billing: "billing"; case .coach: "training"; case .club: "news"; default: "bookings" }
        let row: [String: AnyJSON] = [
            "id": .string(item.id), "household_id": .string(householdID), "member_id": .string(memberRowID),
            "type": .string(kind.rawValue), "title": .string(title), "body": .string(body), "at": .date(now),
            "needs_action": .bool(kind == .approval), "filter": .string(filter),
        ]
        writeThrough("", rollback: nil, silent: true) { api in try await api.insert("notices", [row]) }
    }
    var unreadCount: Int { inbox.filter(\.unread).count }

    /// Ids are text in the database and made on the device, so they must not repeat across devices.
    func newID(_ p: String) -> String { HouseholdMapper.newID(p) }

    // MARK: Widgets
    func publishSnapshot() {
        let club = homeClub
        let b = busyness(club)
        let next = nextBooking
        let upcoming = upcomingBookings.prefix(3).map {
            WidgetSnapshot.Upcoming(title: $0.title, start: $0.start, club: self.club($0.clubID).shortName, category: $0.category)
        }
        var dots = [Bool](repeating: false, count: 7)
        let ws = weekStart(now)
        for v in visits where v >= ws && v < ws.addingDays(7) {
            let idx = AZ.cal.dateComponents([.day], from: ws, to: v.startOfAZDay).day ?? 0
            if (0..<7).contains(idx) { dots[idx] = true }
        }
        let kids = upcomingBookings.first { $0.kind == .kids }
        let hour = AZ.cal.component(.hour, from: now)
        let list: [WidgetSnapshot.NextClass] = upcomingBookings.filter { $0.status == .booked && $0.kind == .classSession }.prefix(4).map { n in
            let s = n.sessionID.flatMap { session($0) }
            return .init(sessionID: n.sessionID ?? n.id, name: n.title, category: n.category, start: n.start, end: n.end, room: s?.room ?? n.detail, clubShort: self.club(n.clubID).shortName, intensity: s?.intensity ?? 3)
        }
        var snap = WidgetSnapshot(
            generatedAt: now,
            next: next.map { n in
                let s = n.sessionID.flatMap { session($0) }
                return .init(sessionID: n.sessionID ?? n.id, name: n.title, category: n.category, start: n.start, end: n.end,
                             room: s?.room ?? n.detail, clubShort: self.club(n.clubID).shortName, intensity: s?.intensity ?? 3)
            },
            club: .init(slug: club.slug, name: club.fullName, level: b.closed ? 0 : b.level, word: b.closed ? "Closed" : b.word,
                        hourly: popular(club), hourIndex: min(max(hour - 4, 0), 17), openUntil: club.openUntilText(on: now), updatedAt: b.updatedAt),
            upcoming: Array(upcoming), weekVisits: visitsThisWeek, goal: weeklyGoal, streakWeeks: streak.weeks,
            weekDots: dots, todayIndex: AZ.cal.dateComponents([.day], from: ws, to: now.startOfAZDay).day ?? 0,
            kids: kids.map { .init(names: $0.people.joined(separator: " + "), start: $0.start, checkInBy: $0.start.addingTimeInterval(15 * 60)) })
        snap.generatedAt = now
        snap.nextList = list
        SnapshotStore.save(snap)
        WidgetCenter.shared.reloadAllTimelines()
    }
}
