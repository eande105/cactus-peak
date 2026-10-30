import Foundation
import Supabase

struct BillLine: Identifiable, Hashable, Sendable { var id: String { label }; var label: String; var amount: Int }

struct FreezeQuote: Hashable, Sendable {
    var start: Date
    var end: Date
    var restart: Date
    var total: Int
    var affected: [Booking]
}

struct PlanQuote: Hashable, Sendable {
    var target: PlanTier
    var isUpgrade: Bool
    var delta: Int
    var proratedToday: Int
    var daysLeft: Int
    var cycleDays: Int
    var effective: Date
    var lost: [String]
}

extension AppModel {
    // MARK: Billing
    var isOwner: Bool { !member.isTeen }
    var childCount: Int { people.filter { $0.role == .child || $0.role == .teen }.count }
    var billLines: [BillLine] {
        var l = [BillLine(label: member.plan.name, amount: member.plan.price)]
        for p in people where p.role != .admin { l.append(BillLine(label: "\(p.first) (\(p.role == .adult ? "adult" : "child"))", amount: p.addOnPrice)) }
        if isFrozen { return [BillLine(label: "Freeze", amount: 10)] }
        return l
    }
    var nextBillTotal: Int { billLines.reduce(0) { $0 + $1.amount } }
    /// From `invoices`, newest first.
    var billingHistory: [(String, Int, String)] {
        invoices.map { ($0.issuedAt.cpFormat("MMM d"), Int($0.amount.rounded()), $0.status.capitalized) }
    }

    // MARK: Freeze (starts on the first billing date at least 30 days after the request)
    func firstBillingDate(onOrAfter d: Date) -> Date {
        var comps = AZ.cal.dateComponents([.year, .month], from: d)
        comps.day = member.billingDay
        var c = AZ.cal.date(from: comps)!
        if c < d.startOfAZDay { c = AZ.cal.date(byAdding: .month, value: 1, to: c)! }
        return c
    }
    var thirtyDaysOut: Date { now.startOfAZDay.addingDays(30) }
    func freezeQuote(months: Int) -> FreezeQuote {
        let start = firstBillingDate(onOrAfter: thirtyDaysOut)
        let restart = AZ.cal.date(byAdding: .month, value: months, to: start)!
        let end = restart.addingDays(-1)
        let affected = bookings.filter { $0.status == .booked && $0.start >= start && $0.start < restart }
        return FreezeQuote(start: start, end: end, restart: restart, total: 10 * months, affected: affected)
    }
    func freezeBlockReason() -> String? {
        if !isOwner { return "Only \(member.ownerFirst) can freeze the plan." }
        if paymentFailedDay > 0 { return "Pay your balance first." }
        if freeze != nil { return "Your membership is already frozen." }
        if membershipCancelOn != nil { return "Reinstate your membership first." }
        return nil
    }
    func setFreeze(months: Int) {
        let q = freezeQuote(months: months)
        let undo = rollbackPoint()
        freeze = FreezeState(start: q.start, end: q.end, months: months)
        for b in q.affected { if let i = bookings.firstIndex(where: { $0.id == b.id }) { bookings[i].status = .cancelled } }
        let window: [String: AnyJSON] = [
            "start": .double(q.start.timeIntervalSince1970 * 1000), "months": .integer(months),
            "end": .double(q.end.timeIntervalSince1970 * 1000), "resume": .double(q.restart.timeIntervalSince1970 * 1000),
        ]
        let hh = householdID
        let cancelIDs = q.affected.flatMap { $0.rowIDs.isEmpty ? [$0.id] : $0.rowIDs }
        let cancelledAt = now
        writeThrough("Couldn't schedule the freeze.", rollback: undo) { api in
            try await api.update("households", ids: [hh], ["freeze_window": .object(window), "status": "freeze_scheduled"])
            try await api.update("bookings", ids: cancelIDs, ["status": "cancelled", "cancelled_at": .date(cancelledAt)])
        }
        addInbox(.billing, "Your freeze starts \(q.start.cpDayMonth)", "You cannot check in while frozen.")
        publishSnapshot()
    }
    /// Used by the debug launch state: start a freeze that is already running.
    func startFreezeNow(_ f: FreezeState) {
        freeze = f
        for i in bookings.indices where bookings[i].status == .booked || bookings[i].status == .waitlisted || bookings[i].status == .hold {
            if bookings[i].start >= f.start && bookings[i].start <= f.end.addingDays(1) { bookings[i].status = .cancelled }
        }
        publishSnapshot()
    }
    func resumeEarly() {
        let undo = rollbackPoint()
        writeHousehold(["freeze_window": .null, "status": "active"], failure: "Couldn't resume your membership.", rollback: undo)
        freeze = nil
        showToast("Welcome back. Your plan price bills for the rest of this cycle.")
        publishSnapshot()
    }

    // MARK: Plan changes
    func planQuote(to t: PlanTier) -> PlanQuote {
        let up = t.price > member.plan.price
        let next = nextBillDate
        let prev = AZ.cal.date(byAdding: .month, value: -1, to: next)!
        let cycle = AZ.cal.dateComponents([.day], from: prev, to: next).day ?? 30
        let left = AZ.cal.dateComponents([.day], from: now.startOfAZDay, to: next).day ?? 0
        let delta = t.price - member.plan.price
        let prorated = up ? Int((Double(delta) * Double(left) / Double(cycle)).rounded()) : 0
        var lost: [String] = []
        if !up {
            if member.plan.courtsIncluded && !t.courtsIncluded { lost.append("Courts: not included in \(t.name)") }
            if member.plan.allClubs && !t.allClubs { lost.append("Other clubs: only \(homeClub.fullName)") }
            if member.plan.recoveryIncluded && !t.recoveryIncluded { lost.append("Recovery suite: not included in \(t.name)") }
            if member.plan.guestPassesPerMonth > t.guestPassesPerMonth { lost.append("Guest passes: \(t.guestPassesPerMonth) a month") }
            if member.plan.windowDays > t.windowDays { lost.append("Booking window: \(t.windowDays) days") }
        }
        return PlanQuote(target: t, isUpgrade: up, delta: delta, proratedToday: prorated, daysLeft: left, cycleDays: cycle,
                         effective: up ? now : next, lost: lost)
    }
    func changePlan(to t: PlanTier) {
        let q = planQuote(to: t)
        let undo = rollbackPoint()
        if q.isUpgrade {
            member.plan = t; pendingDowngrade = nil
            writeHousehold(["plan_id": .string(t.rawValue), "pending_plan": .null], failure: "Couldn't change your plan.", rollback: undo)
        } else {
            pendingDowngrade = (t, q.effective)
            let pending: [String: AnyJSON] = ["plan": .string(t.rawValue), "on": .double(q.effective.timeIntervalSince1970 * 1000)]
            writeHousehold(["pending_plan": .object(pending)], failure: "Couldn't schedule the plan change.", rollback: undo)
        }
        publishSnapshot()
    }
    func cancelMembership() {
        let undo = rollbackPoint()
        let on = firstBillingDate(onOrAfter: thirtyDaysOut)
        membershipCancelOn = on
        writeHousehold(["cancel_on": .date(on), "status": "cancel_scheduled"], failure: "Couldn't cancel your membership.", rollback: undo)
    }
    func reinstate() {
        let undo = rollbackPoint()
        membershipCancelOn = nil
        writeHousehold(["cancel_on": .null, "status": "active"], failure: "Couldn't reinstate your membership.", rollback: undo)
    }

    // MARK: Family
    func addPerson(first: String, last: String, adult: Bool, age: Int) {
        let role: FamilyRole = adult ? .adult : (age >= 13 ? .teen : .child)
        let undo = rollbackPoint()
        let p = Person(id: newID("m"), first: first, last: last, role: role, age: age, invitePending: adult || age >= 13)
        people.append(p)
        // Only the age is asked for, so the date of birth is the same day that many years ago.
        let dob = AZ.cal.date(byAdding: .year, value: -age, to: now.startOfAZDay) ?? now
        var row: [String: AnyJSON] = [
            "id": .string(p.id), "household_id": .string(householdID),
            "role": .string(role == .adult ? "adult" : role == .teen ? "teen" : "child"),
            "first_name": .string(first), "last_name": .string(last), "dob": .string(dob.cpFormat("yyyy-MM-dd")),
            "member_number": .string("CP-\(Int.random(in: 100...999))-\(Int.random(in: 100...999))-\(Int.random(in: 100...999))"),
            "home_club": .string(member.homeClubID), "status": .string(p.invitePending ? "invited" : "active"),
            "invited_at": .date(p.invitePending ? now : nil),
        ]
        if role != .adult { row["parent_id"] = .string(memberRowID) }
        let insert = row
        writeThrough("Couldn't add \(first).", rollback: undo) { api in try await api.insert("members", [insert]) }
    }
    func removePerson(_ id: PersonID) {
        guard people.contains(where: { $0.id == id && $0.role != .admin }) else { return }
        let undo = rollbackPoint()
        people.removeAll { $0.id == id && $0.role != .admin }
        writeThrough("Couldn't remove that family member.", rollback: undo) { api in try await api.delete("members", ids: [id]) }
    }
    func updatePerson(_ p: Person) {
        guard let i = people.firstIndex(where: { $0.id == p.id }) else { return }
        let undo = rollbackPoint()
        people[i] = p
        var values: [String: AnyJSON] = ["allergy_notes": .text(p.allergies.isEmpty ? nil : p.allergies)]
        if p.role == .teen {
            values["permissions"] = .object(["classes": true, "courts": .bool(p.courtsAllowed), "lanes": .bool(p.lanesAllowed), "coachMessages": true])
        }
        writeMember(p.id, values, failure: "Couldn't save \(p.first)'s settings.", rollback: undo)
    }

    // MARK: Guest passes
    var guestPassesLeft: Int { max(0, member.plan.guestPassesPerMonth - guestUsedThisCycle) }
    func shareGuestPass(name: String) {
        guard guestPassesLeft > 0 else { return }
        let undo = rollbackPoint()
        guestUsedThisCycle += 1
        let g = GuestPass(id: newID("g"), guest: name.isEmpty ? "Guest" : name, status: .shared, expires: now.startOfAZDay.addingDays(14))
        guestPasses.insert(g, at: 0)
        let row: [String: AnyJSON] = [
            "id": .string(g.id), "household_id": .string(householdID), "guest_name": .string(g.guest), "contact": "",
            "club_slug": .string(member.homeClubID), "visit_date": .date(now.startOfAZDay), "valid_until": .date(g.expires),
            "status": "sent", "bought": false, "sent_at": .date(now),
        ]
        writeThrough("Couldn't share the guest pass.", rollback: undo) { api in try await api.insert("guest_passes", [row]) }
    }
    func revokeGuestPass(_ id: String) {
        guard let i = guestPasses.firstIndex(where: { $0.id == id }) else { return }
        let undo = rollbackPoint()
        writeThrough("Couldn't cancel the guest pass.", rollback: undo) { api in try await api.update("guest_passes", ids: [id], ["status": "cancelled"]) }
        if guestPasses[i].status == .shared { guestUsedThisCycle = max(0, guestUsedThisCycle - 1) }
        guestPasses.remove(at: i)
    }

    // MARK: Feedback, favourites, home club
    func giveFeedback(_ id: BookingID, _ answer: String) {
        guard let i = bookings.firstIndex(where: { $0.id == id }) else { return }
        let undo = rollbackPoint()
        bookings[i].feedback = answer
        writeBookingUpdate(bookings[i], ["feedback_done": true], failure: "Couldn't send your feedback.", rollback: undo)
    }
    func toggleFavourite(session id: SessionID) { if favouriteSessions.contains(id) { favouriteSessions.remove(id) } else { favouriteSessions.insert(id) } }
    func toggleFavourite(club id: ClubID) { if favouriteClubs.contains(id) { favouriteClubs.remove(id) } else { favouriteClubs.insert(id) } }
    var canChangeHomeClub: Bool { !(member.plan == .trailhead && homeClubChangedThisCycle) }
    func setHomeClub(_ id: ClubID) {
        guard id != member.homeClubID else { return }
        let undo = rollbackPoint()
        if member.plan == .trailhead {
            guard !homeClubChangedThisCycle else { return }
            homeClubChangedThisCycle = true
        }
        member.homeClubID = id
        passClubID = id
        let me = memberRowID, hh = householdID, at = now
        writeThrough("Couldn't change your home club.", rollback: undo) { api in
            try await api.update("members", ids: [me], ["home_club": .string(id)])
            try await api.update("households", ids: [hh], ["home_club_changed_at": .date(at)])
        }
        publishSnapshot()
    }
    func markRead(_ id: String, _ read: Bool = true) {
        guard let i = inbox.firstIndex(where: { $0.id == id }), inbox[i].unread == read else { return }
        let undo = rollbackPoint()
        inbox[i].unread = !read
        let at = now
        writeThrough("Couldn't update the message.", rollback: undo) { api in try await api.update("notices", ids: [id], ["read_at": .date(read ? at : nil)]) }
    }
    func markAllRead() {
        let ids = inbox.filter(\.unread).map(\.id)
        guard !ids.isEmpty else { return }
        let undo = rollbackPoint()
        for i in inbox.indices { inbox[i].unread = false }
        let at = now
        writeThrough("Couldn't mark messages read.", rollback: undo) { api in try await api.update("notices", ids: ids, ["read_at": .date(at)]) }
    }
    func deleteInbox(_ id: String) {
        let undo = rollbackPoint()
        inbox.removeAll { $0.id == id }
        writeThrough("Couldn't delete the message.", rollback: undo) { api in try await api.delete("notices", ids: [id]) }
    }

    // MARK: Pass state
    enum PassState: Equatable {
        case valid, checkedIn(Date), beforeDesk, closed(String), frozen(Date), frozenScheduled, paymentWarning, paymentPaused, seeDesk
        case wrongClub(String), trial(Int)
    }
    var passState: PassState {
        if isFrozen, let f = freeze { return .frozen(f.end) }
        if paymentFailedDay >= 15 { return .seeDesk }
        if member.plan == .trailhead && passClubID != member.homeClubID { return .wrongClub(homeClub.fullName) }
        let club = self.club(passClubID)
        if !club.isOpen(at: now) { return .closed(club.opensText(now)) }
        if checkedInToday, let c = checkedInAt, now.timeIntervalSince(c) < 4 * 3600 { return .checkedIn(c) }
        if paymentFailedDay >= 8 { return .paymentPaused }
        if paymentFailedDay >= 1 { return .paymentWarning }
        let c = AZ.cal.dateComponents([.hour], from: now).hour ?? 0
        if c < 6 { return .beforeDesk }
        return .valid
    }

    /// The code rotates every 60 seconds. It is made on the device, so the pass works offline.
    func passCode(at d: Date? = nil) -> String {
        let t = Int((d ?? now).timeIntervalSince1970 / 60)
        return "CPA1|\(member.memberNumber.replacingOccurrences(of: " ", with: ""))|\(passClubID.suffix(6))|\(stableHash("\(member.memberNumber)\(t)") % 1_000_000)"
    }
}

extension Club {
    func opensText(_ d: Date) -> String {
        let c = AZ.cal.dateComponents([.hour, .minute], from: d)
        let m = (c.hour ?? 0) * 60 + (c.minute ?? 0)
        let day = m < opens(on: d) ? d : d.addingDays(1)
        return opens(on: day) == 360 ? "6:00 a.m." : "4:30 a.m."
    }
}
