import Foundation
import Supabase

struct CancelPreview: Hashable, Sendable {
    var late: Bool
    var countsStrike: Bool
    var strikeNumber: Int          // the number this cancel would make (1...3)
    var pausesBookings: Bool
    var pauseEnds: Date
    var freeUntil: Date
    var kind: BookingKind
}

enum BookOutcome {
    case ok(Booking)
    case clash(Booking)
    case rejected(String)
}

struct StreakInfo: Hashable, Sendable { var weeks: Int; var best: Int; var thisWeek: Int; var goalMet: Bool }

extension AppModel {
    // MARK: Lists
    var upcomingBookings: [Booking] {
        bookings.filter { ($0.status == .booked || $0.status == .waitlisted || $0.status == .hold) && $0.end > now }
            .sorted { $0.start < $1.start }
    }
    var nextBooking: Booking? { upcomingBookings.first { $0.status == .booked } }
    var activeHold: Booking? { bookings.first { $0.status == .hold } }
    var pastBookings: [Booking] {
        bookings.filter { [.attended, .missed, .lateCancelled, .cancelled].contains($0.status) }.sorted { $0.start > $1.start }
    }
    func booking(forSession id: SessionID) -> Booking? {
        bookings.first { $0.sessionID == id && ($0.status == .booked || $0.status == .waitlisted || $0.status == .hold) }
    }

    // MARK: Booking state (the shared deriveBookingState)
    func state(for s: ClassSession) -> BookingState {
        if inFlight.contains(s.id) { return .booking }
        if let b = booking(forSession: s.id) {
            switch b.status {
            case .booked: return .booked(late: now > b.cancelCutoff() && now < s.start)
            case .waitlisted: return .waitlisted(b.waitlistPosition)
            case .hold: return .hold(b.holdExpires ?? now)
            default: break
            }
        }
        if now >= s.start { return .started }
        if let r = bookingBlock { return .restricted(r) }
        // Until the member's bookings load, Book could be wrong (they may already hold a spot).
        if !bookingsKnown { return .checking }
        let opens = opensAt(s.start)
        if opens > now { return .restricted(.notOpen(opens)) }
        if member.plan == .trailhead && s.clubID != member.homeClubID { return .restricted(.plan("Ridge only")) }
        if member.age < s.minAge { return .restricted(.age("\(s.minAge)+ only")) }
        let left = spotsLeft(s)
        if left > 0 {
            let hadWaitlist = outsideWaitlist(s) > 0
            return (hadWaitlist && s.start.timeIntervalSince(now) <= 3600) ? .dropIn(left) : .book
        }
        if s.start.timeIntervalSince(now) <= 3600 { return .full("Waitlist closed 1 hour before start") }
        if activeWaitlists >= 5 { return .full("You are on 5 waitlists. Leave one to join another.") }
        return .waitlist
    }

    /// One-line explanation placed next to the action. Times come from the booking window.
    func rulesText(for s: ClassSession) -> (cancel: String, waitlist: String, strikes: String?) {
        let free = s.start.addingTimeInterval(-2 * 3600)
        let wl = s.start.addingTimeInterval(-3600)
        let c = "Cancel free until \(free.cpTime) (2 hours before). After that, it counts as a late cancel."
        let w = "If this class is full, the waitlist moves you up until \(wl.cpTime) (1 hour before). You get a push and 30 minutes to confirm."
        let st = strikesIn30 > 0 ? "You have \(strikesIn30) late cancel\(strikesIn30 == 1 ? "" : "s") in the last 30 days. 3 in 30 days pauses new bookings for 3 days." : nil
        return (c, w, st)
    }

    // MARK: Book
    func book(_ s: ClassSession, force: Bool = false) -> BookOutcome {
        if inFlight.contains(s.id) { return .rejected("Booking is already in progress.") }
        let st = state(for: s)
        guard st.isBookable else { return .rejected("That class can't be booked right now.") }
        if !force, let c = bookings.first(where: { $0.isActive && $0.status == .booked && $0.start < s.end && $0.end > s.start }) {
            return .clash(c)
        }
        let undo = rollbackPoint()
        var b = Booking(id: newID("b"), kind: .classSession, status: .booked, sessionID: s.id, title: s.name, clubID: s.clubID,
                        category: s.category, start: s.start, end: s.end, detail: "\(s.room)", coachID: s.coachID, createdAt: now)
        b.memberID = memberRowID; b.rowIDs = [b.id]; b.ref = HouseholdMapper.newRef()
        bookings.append(b)
        spotDelta[s.id, default: 0] += 1
        writeInsert(b, failure: "Couldn't book \(s.name).", rollback: undo, guarding: s.id)
        afterBookingChange(b)
        return .ok(b)
    }

    func joinWaitlist(_ s: ClassSession) -> Booking? {
        guard case .waitlist = state(for: s) else { return nil }
        let undo = rollbackPoint()
        var b = Booking(id: newID("b"), kind: .classSession, status: .waitlisted, sessionID: s.id, title: s.name, clubID: s.clubID,
                        category: s.category, start: s.start, end: s.end, detail: s.room, coachID: s.coachID, createdAt: now)
        b.waitlistPosition = waitlistCount(s) + 1
        b.memberID = memberRowID; b.rowIDs = [b.id]; b.ref = HouseholdMapper.newRef()
        bookings.append(b)
        writeInsert(b, failure: "Couldn't join the waitlist.", rollback: undo, guarding: s.id)
        return b
    }

    func leaveWaitlist(_ id: BookingID) {
        guard let i = bookings.firstIndex(where: { $0.id == id }) else { return }
        let undo = rollbackPoint()
        let b = bookings.remove(at: i)
        writeBookingDelete(b, failure: "Couldn't leave the waitlist.", rollback: undo)
        showToast("Left the waitlist.")
    }

    /// Demo: a spot opens for the first booking on the member's waitlist. Starts the 30-minute hold.
    func simulatePromotion() {
        guard let i = bookings.firstIndex(where: { $0.status == .waitlisted && $0.start.timeIntervalSince(now) > 3600 }) else { return }
        let undo = rollbackPoint()
        bookings[i].status = .hold
        bookings[i].holdExpires = now.addingTimeInterval(30 * 60)
        let b = bookings[i]
        writeBookingUpdate(b, ["status": "held", "hold_expires_at": .date(b.holdExpires), "waitlist_position": .null],
                           failure: "Couldn't open the spot.", rollback: undo)
        addInbox(.waitlist, "A spot opened in \(b.title)",
                 "\(b.start.cpWeekdayShort) \(b.start.cpTime) · \(club(b.clubID).fullName). Confirm by \(b.holdExpires!.cpTime)",
                 route: "/book/class/\(b.sessionID ?? "")?action=confirm")
        NotificationSupport.shared.post(title: "A spot opened in \(b.title)",
                                         body: "\(b.start.cpWeekdayShort) \(b.start.cpTime) · \(club(b.clubID).fullName). Confirm by \(b.holdExpires!.cpTime)",
                                         category: "WAITLIST_PROMOTED", route: "/book/class/\(b.sessionID ?? "")?action=confirm")
    }

    @discardableResult
    func confirmHold(_ id: BookingID) -> Bool {
        guard let i = bookings.firstIndex(where: { $0.id == id && $0.status == .hold }),
              let e = bookings[i].holdExpires, e > now else { return false }
        let undo = rollbackPoint()
        writeBookingUpdate(bookings[i], ["status": "booked", "hold_expires_at": .null], failure: "Couldn't confirm the spot.", rollback: undo)
        bookings[i].status = .booked
        bookings[i].holdExpires = nil
        if let sid = bookings[i].sessionID { spotDelta[sid, default: 0] += 1 }
        afterBookingChange(bookings[i])
        addInbox(.waitlist, "You're in", "\(bookings[i].title), \(bookings[i].start.cpWeekdayShort) \(bookings[i].start.cpTime)")
        return true
    }

    /// "Release spot" gives the spot to the next person and shows no strike.
    func releaseHold(_ id: BookingID) {
        guard let b = bookings.first(where: { $0.id == id && $0.status == .hold }) else { return }
        let undo = rollbackPoint()
        bookings.removeAll { $0.id == id && $0.status == .hold }
        writeBookingDelete(b, failure: "Couldn't release the spot.", rollback: undo)
        showToast("Spot released. No strike.")
    }

    // MARK: Cancel
    func cancelPreview(_ b: Booking) -> CancelPreview {
        let cutoff = b.cancelCutoff()
        let late = now > cutoff
        let strikeKinds: [BookingKind] = [.classSession, .court, .lane]
        let counts = late && strikeKinds.contains(b.kind) && b.status == .booked
        let n = strikesIn30 + 1
        return CancelPreview(late: late && b.kind != .kids, countsStrike: counts, strikeNumber: min(n, 3), pausesBookings: counts && n >= 3,
                             pauseEnds: now.addingTimeInterval(3 * 86400), freeUntil: cutoff, kind: b.kind)
    }

    @discardableResult
    func cancel(_ id: BookingID, reason: String? = nil) -> CancelPreview? {
        guard let i = bookings.firstIndex(where: { $0.id == id }) else { return nil }
        let b = bookings[i]
        let p = cancelPreview(b)
        let undo = rollbackPoint()
        if b.status == .booked, let sid = b.sessionID { spotDelta[sid, default: 0] -= 1 }
        lastCancelled = b
        let newStatus: BookingStatus = p.late && b.kind != .kids ? .lateCancelled : .cancelled
        bookings[i].status = newStatus
        bookings[i].cancelReason = reason
        if p.countsStrike { addStrike(); lastLateCancelID = b.id }
        // One write for the booking, the strike and a pause, so a failure rolls all of them back.
        let ids = b.rowIDs.isEmpty ? [b.id] : b.rowIDs
        let values: [String: AnyJSON] = ["status": .string(HouseholdMapper.dbStatus(newStatus)), "cancelled_at": .date(now)]
        let strike: [String: AnyJSON]? = p.countsStrike ? [
            "id": .string(newID("s")), "household_id": .string(householdID), "member_id": .string(memberRowID), "at": .date(now),
            "booking_id": .string(b.id), "title": .string("\(b.title), \(b.start.cpFormat("EEE MMM d"))"),
        ] : nil
        let pause: (String, Date)? = p.pausesBookings ? pauseUntil.map { (memberRowID, $0) } : nil
        writeThrough("Couldn't cancel \(b.title).", rollback: undo) { api in
            try await api.update("bookings", ids: ids, values)
            if let strike { try await api.insert("strikes", [strike]) }
            if let pause { try await api.update("members", ids: [pause.0], ["paused_until": .date(pause.1)]) }
        }
        if p.late && p.countsStrike {
            if p.pausesBookings { addInbox(.reminder, "New bookings are paused", "You can book again on \(pauseUntil?.cpWeekdayShort ?? "") \(pauseUntil?.cpDayMonth ?? ""). Kids club and check-in still work.") }
            else if strikesIn30 == 2 { addInbox(.reminder, "2 strikes in 30 days", "One more pauses new bookings for 3 days.") }
        }
        if !p.late { showToast("Cancelled.", undoID: b.id) }
        LiveActivityManager.shared.sync(model: self)
        publishSnapshot()
        return p
    }

    /// Undo for a free cancel inside the 8 second window.
    func undoCancel(_ id: BookingID) {
        guard let i = bookings.firstIndex(where: { $0.id == id }), bookings[i].status == .cancelled else { return }
        let undo = rollbackPoint()
        writeBookingUpdate(bookings[i], ["status": "booked", "cancelled_at": .null], failure: "Couldn't undo the cancel.", rollback: undo)
        bookings[i].status = .booked
        if let sid = bookings[i].sessionID { spotDelta[sid, default: 0] += 1 }
        toast = nil
        publishSnapshot()
    }

    func afterBookingChange(_ b: Booking) {
        visibleUpdate += 1
        if prefs.notifReminders && b.kind != .kids { NotificationSupport.shared.scheduleReminder(for: b, lead: prefs.reminderLead, clubName: club(b.clubID).fullName) }
        publishSnapshot()
        LiveActivityManager.shared.sync(model: self)
    }

    /// Other sessions of the same class later this week, for "Reschedule instead".
    func sameClassThisWeek(_ b: Booking) -> [ClassSession] {
        guard let sid = b.sessionID, let s = session(sid) else { return [] }
        return sessions.filter { $0.name == s.name && $0.clubID == s.clubID && $0.id != s.id && $0.start > now && $0.start < s.start.addingDays(7) }
    }

    // MARK: Pass and visits
    func checkIn(at when: Date? = nil) {
        let t = when ?? now
        checkedInAt = t
        visits.append(t)
        let visit: [String: AnyJSON] = ["household_id": .string(householdID), "member_id": .string(memberRowID),
                                        "club_slug": .string(passClubID), "at": .date(t)]
        writeThrough("", rollback: nil, silent: true) { api in try await api.insert("visits", [visit]) }
        // The booking the member walked in for counts as attended.
        if let i = bookings.firstIndex(where: { $0.kind == .classSession && $0.status == .booked && $0.clubID == passClubID
            && t > $0.start.addingTimeInterval(-30 * 60) && t < $0.end }) {
            bookings[i].checkedIn = true
        }
        publishSnapshot()
    }
    var checkedInToday: Bool { if let c = checkedInAt { return AZ.cal.isDate(c, inSameDayAs: now) } else { return false } }

    // MARK: Streak
    func weekStart(_ d: Date) -> Date {
        let comps = AZ.cal.dateComponents([.yearForWeekOfYear, .weekOfYear], from: d)
        return AZ.cal.date(from: comps)!.startOfAZDay
    }
    var visitsThisWeek: Int { let ws = weekStart(now); return visits.filter { $0 >= ws && $0 < ws.addingDays(7) && $0 <= now }.count }
    func weeklyCounts(_ weeks: Int) -> [(start: Date, count: Int)] {
        let cur = weekStart(now)
        return (0..<weeks).reversed().map { k in
            let s = cur.addingDays(-7 * k)
            return (s, visits.filter { $0 >= s && $0 < s.addingDays(7) && $0 <= now }.count)
        }
    }
    var streak: StreakInfo {
        let counts = weeklyCounts(60).map(\.count)       // oldest first, last = this week
        let goal = weeklyGoal
        var weeks = 0
        var forgiven = 0
        var i = counts.count - 2
        while i >= 0 {
            if counts[i] >= goal { weeks += 1 }
            else if forgiven < max(1, (weeks + 1) / 10) && weeks > 0 && i > 0 && counts[i - 1] >= goal { forgiven += 1 }
            else { break }
            i -= 1
        }
        let met = counts.last.map { $0 >= goal } ?? false
        if met { weeks += 1 }
        var best = 0, run = 0
        for c in counts.dropLast() { if c >= goal { run += 1; best = max(best, run) } else { run = 0 } }
        best = max(best, weeks, 11)
        return StreakInfo(weeks: weeks, best: best, thisWeek: counts.last ?? 0, goalMet: met)
    }
    func attendedByCategory(weeks: Int = 12) -> [(ClassCategory, Int)] {
        let from = weekStart(now).addingDays(-7 * (weeks - 1))
        var d: [ClassCategory: Int] = [:]
        for b in bookings where b.status == .attended && b.start >= from { d[b.category, default: 0] += 1 }
        return d.sorted { $0.value > $1.value }.map { ($0.key, $0.value) }
    }
}
