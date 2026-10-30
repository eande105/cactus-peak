import Foundation
import Supabase

/// The household as the app's models see it. `HouseholdMapper.map` makes it from database rows.
struct HouseholdState: Sendable {
    var householdID: String
    var memberID: String
    var member: MemberProfile
    var people: [Person]
    var bookings: [Booking]
    var strikes: [Date]
    var pauseUntil: Date?
    var freeze: FreezeState?
    var membershipCancelOn: Date?
    var pendingDowngrade: (PlanTier, Date)?
    var paymentFailedDay: Int
    var homeClubChangedThisCycle: Bool
    var inbox: [InboxItem]
    var guestPasses: [GuestPass]
    var guestUsedThisCycle: Int
    var visits: [Date]
    var weeklyGoal: Int
    var interests: Set<ClassCategory>
    var reminderLead: Int
    var ptSessionsLeft: Int
    var ptExpires: Date?
    var invoices: [InvoiceRow]
    var onboarded: Bool
}

enum HouseholdMapper {
    static func role(_ r: String) -> FamilyRole {
        switch r { case "primary": .admin; case "teen": .teen; case "child": .child; default: .adult }
    }

    static func age(_ dob: Date, at now: Date) -> Int {
        AZ.cal.dateComponents([.year], from: dob, to: now).year ?? 0
    }

    static func status(_ s: String) -> BookingStatus? {
        switch s {
        case "booked": .booked
        case "held": .hold
        case "waitlisted": .waitlisted
        case "cancelled": .cancelled
        case "late_cancelled": .lateCancelled
        case "attended": .attended
        case "no_show": .missed
        default: nil // pending_approval: a teen request, shown in the Inbox, not as a booking
        }
    }

    static func dbStatus(_ s: BookingStatus) -> String {
        switch s {
        case .booked: "booked"
        case .hold: "held"
        case .waitlisted: "waitlisted"
        case .cancelled: "cancelled"
        case .lateCancelled: "late_cancelled"
        case .attended: "attended"
        case .missed: "no_show"
        }
    }

    static func kind(_ k: String) -> BookingKind {
        switch k { case "court": .court; case "lane": .lane; case "kids": .kids; case "pt": .pt; default: .classSession }
    }
    static func dbKind(_ k: BookingKind) -> String {
        switch k { case .classSession: "class"; case .court: "court"; case .lane: "lane"; case .kids: "kids"; case .pt: "pt" }
    }

    static func inboxKind(_ n: NoticeRow) -> InboxItem.Kind {
        let t = n.type.lowercased()
        if t.contains("waitlist") || t.contains("hold") || t.contains("spot") { return .waitlist }
        if t.contains("teen") || t.contains("approval") || n.needsAction { return .approval }
        if t.contains("family") || t.contains("checkin") { return .family }
        switch n.filter {
        case "billing": return .billing
        case "training": return .coach
        case "news": return t == "coach" ? .coach : .club
        default: return .reminder
        }
    }

    static func number(in s: String?) -> Int { Int((s ?? "").filter(\.isNumber)) ?? 0 }

    /// - Parameter coachForSession: the coach of a class session, from the generated timetable.
    static func map(_ r: HouseholdRows, coaches: [Coach], now: Date, coachForSession: (SessionID) -> CoachID? = { _ in nil }) -> HouseholdState {
        let me = r.members.first { $0.id == r.memberId } ?? r.members[0]
        let primary = r.members.first { $0.id == r.household.primaryMemberId }
        let namesByID = Dictionary(r.members.map { ($0.id, $0.firstName) }, uniquingKeysWith: { a, _ in a })
        let coachBySlug = Dictionary(coaches.map { ($0.slug, $0) }, uniquingKeysWith: { a, _ in a })
        let plan = PlanTier(rawValue: r.household.planId) ?? .trailhead

        let member = MemberProfile(
            first: me.firstName, last: me.lastName, plan: plan, homeClubID: me.homeClub, memberNumber: me.memberNumber,
            billingDay: r.household.billingDay, sinceText: r.household.memberSince.cpFormat("MMMM yyyy"),
            age: age(me.dob, at: now), isTeen: me.role == "teen", ownerFirst: primary?.firstName ?? "", email: me.email)

        let people = r.members.sorted { (role($0.role) == .admin ? 0 : 1, $0.dob) < (role($1.role) == .admin ? 0 : 1, $1.dob) }.map { m in
            Person(id: m.id, first: m.firstName, last: m.lastName, role: role(m.role), age: age(m.dob, at: now),
                   invitePending: m.status != "active", courtsAllowed: m.permissions?.courts ?? (m.role != "teen"),
                   lanesAllowed: m.permissions?.lanes ?? (m.role != "teen"), checkInAlerts: false, accessPaused: false,
                   allergies: m.allergyNotes ?? "")
        }

        // Bookings: the member's own, plus kids club blocks (one row per child, shown as one booking).
        var bookings: [Booking] = []
        var kidsGroups: [String: Int] = [:]
        for row in r.bookings.sorted(by: { $0.createdAt < $1.createdAt }) {
            guard let st = status(row.status) else { continue }
            let k = kind(row.kind)
            if k != .kids && row.memberId != me.id { continue }
            let cat = ClassCategory(dbID: row.categoryId) ?? .strength
            if k == .kids {
                let key = "\(row.ref)|\(row.startsAt.timeIntervalSince1970)|\(row.status)"
                let name = namesByID[row.memberId] ?? "Child"
                if let i = kidsGroups[key] {
                    bookings[i].people.append(name)
                    bookings[i].rowIDs.append(row.id)
                    bookings[i].detail = bookings[i].people.joined(separator: " + ")
                    continue
                }
                var b = Booking(id: row.id, kind: .kids, status: st, sessionID: nil, title: row.title, clubID: row.clubSlug, category: cat,
                                start: row.startsAt, end: row.endsAt, detail: name, people: [name])
                b.memberID = row.memberId; b.rowIDs = [row.id]; b.ref = row.ref; b.createdAt = row.createdAt
                b.waitlistPosition = row.waitlistPosition ?? 0
                kidsGroups[key] = bookings.count
                bookings.append(b)
                continue
            }
            let coach = row.coachSlug.flatMap { coachBySlug[$0] }
            let detail: String
            switch k {
            case .court, .lane: detail = row.resource ?? row.place
            case .pt: detail = "with \(coach?.shortName ?? "your coach")"
            default: detail = row.place
            }
            var b = Booking(id: row.id, kind: k, status: st, sessionID: row.sessionId, title: row.title, clubID: row.clubSlug,
                            category: cat, start: row.startsAt, end: row.endsAt, detail: detail)
            b.waitlistPosition = row.waitlistPosition ?? 0
            b.holdExpires = row.holdExpiresAt
            b.checkedIn = st == .attended
            b.feedback = row.feedbackDone ? "Sent" : nil
            b.coachID = coach?.id ?? row.sessionId.flatMap(coachForSession)
            b.createdAt = row.createdAt
            b.resource = number(in: row.resource)
            b.sport = row.sport.flatMap(CourtSport.init(rawValue:)) ?? (k == .court ? .pickleball : nil)
            b.memberID = row.memberId
            b.rowIDs = [row.id]
            b.ref = row.ref
            bookings.append(b)
        }

        let fw = r.household.freezeWindow.map {
            FreezeState(start: Date(timeIntervalSince1970: $0.start / 1000), end: Date(timeIntervalSince1970: $0.end / 1000), months: $0.months)
        }
        let pending = r.household.pendingPlan.flatMap { p in PlanTier(rawValue: p.plan).map { ($0, Date(timeIntervalSince1970: p.on / 1000)) } }
        let failedDay = r.household.paymentFailedAt.map { (AZ.cal.dateComponents([.day], from: $0.startOfAZDay, to: now.startOfAZDay).day ?? 0) + 1 } ?? 0

        // The billing cycle started on the last billing day.
        var comps = AZ.cal.dateComponents([.year, .month], from: now)
        comps.day = r.household.billingDay
        var cycleStart = AZ.cal.date(from: comps) ?? now
        if cycleStart > now { cycleStart = AZ.cal.date(byAdding: .month, value: -1, to: cycleStart) ?? cycleStart }

        let inbox = r.notices.filter { $0.memberId == me.id }.sorted { $0.at > $1.at }.map {
            InboxItem(id: $0.id, kind: inboxKind($0), title: $0.title, body: $0.body, time: $0.at, unread: $0.readAt == nil,
                      route: $0.bookingId.map { "/bookings/\($0)" })
        }
        let passes = r.guestPasses.filter { $0.status != "cancelled" }.sorted { $0.sentAt > $1.sentAt }.map { g -> GuestPass in
            let s: GuestPass.Status = switch g.status { case "used": .used; case "expired": .expired; case "opened": .waiver; default: .shared }
            return GuestPass(id: g.id, guest: g.guestName, status: g.validUntil < now && s == .shared ? .expired : s, expires: g.validUntil)
        }
        let used = r.guestPasses.filter { !$0.bought && $0.status != "cancelled" && $0.sentAt >= cycleStart }.count
        let interests = Set((me.prefs?.interests ?? []).compactMap(ClassCategory.init(dbID:)))
        let pack = r.household.ptPack

        return HouseholdState(
            householdID: r.household.id, memberID: me.id, member: member, people: people, bookings: bookings,
            strikes: r.strikes.filter { $0.memberId == me.id }.map(\.at).sorted(),
            pauseUntil: me.pausedUntil, freeze: fw, membershipCancelOn: r.household.cancelOn, pendingDowngrade: pending,
            paymentFailedDay: failedDay,
            homeClubChangedThisCycle: r.household.homeClubChangedAt.map { $0 >= cycleStart } ?? false,
            inbox: inbox, guestPasses: passes, guestUsedThisCycle: used,
            visits: r.visits.filter { $0.memberId == me.id }.map(\.at).sorted(),
            weeklyGoal: me.prefs?.weeklyTarget ?? 3, interests: interests.isEmpty ? [.cycle, .strength] : interests,
            reminderLead: me.prefs?.reminderMin ?? 60,
            ptSessionsLeft: pack.map { max(0, $0.total - $0.used) } ?? 0,
            ptExpires: pack?.expiresOn.map { Date(timeIntervalSince1970: $0 / 1000) },
            invoices: r.invoices.sorted { $0.issuedAt > $1.issuedAt },
            onboarded: (me.prefs?.onboardingStep ?? 0) >= 6)
    }

    /// Short booking reference, the same shape the web app uses ("CP-9D3M1").
    static func newRef() -> String {
        let chars = Array("ABCDEFGHJKLMNPQRSTUVWXYZ23456789")
        return "CP-" + String((0..<5).map { _ in chars.randomElement()! })
    }

    /// Text ids, made on the device. The prefix tells the row type apart in the database.
    static func newID(_ prefix: String) -> String {
        "\(prefix)_\(UUID().uuidString.lowercased().replacingOccurrences(of: "-", with: "").prefix(12))"
    }

    /// The insert for one booking row. Kids club calls this once per child.
    static func insertRow(_ b: Booking, rowID: String, memberID: String, ownerID: String, householdID: String,
                          clubName: String, coachSlug: String?, now: Date) -> [String: AnyJSON] {
        var row: [String: AnyJSON] = [
            "id": .string(rowID), "household_id": .string(householdID), "kind": .string(dbKind(b.kind)),
            "member_id": .string(memberID), "owner_id": .string(ownerID), "status": .string(dbStatus(b.status)),
            "ref": .string(b.ref), "club_slug": .string(b.clubID), "starts_at": .date(b.start), "ends_at": .date(b.end),
            "title": .string(b.title), "category_id": .string(b.category.dbID), "created_at": .date(now),
        ]
        switch b.kind {
        case .classSession:
            row["place"] = .string(b.detail)
            row["session_id"] = .text(b.sessionID)
            if b.status == .waitlisted { row["waitlist_position"] = .int(b.waitlistPosition) }
        case .court:
            row["place"] = .string("\(clubName) · Court \(b.resource)")
            row["resource"] = .string("Court \(b.resource)")
            row["sport"] = .text(b.sport?.rawValue)
        case .lane:
            row["place"] = .string("\(clubName) · Lap pool")
            row["resource"] = .string("Lane \(b.resource)")
        case .kids:
            row["place"] = .string(clubName)
            if b.status == .waitlisted { row["waitlist_position"] = .int(b.waitlistPosition) }
        case .pt:
            row["place"] = .string(clubName)
            row["coach_slug"] = .text(coachSlug)
        }
        return row
    }
}
