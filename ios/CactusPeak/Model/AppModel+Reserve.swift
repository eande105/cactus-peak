import Foundation

struct CourtSlot: Identifiable, Hashable, Sendable {
    var start: Date
    var free: [Int]
    var past: Bool
    var id: Date { start }
}
struct LaneSlot: Identifiable, Hashable, Sendable {
    var start: Date
    var swimmers: [Int]
    var past: Bool
    var id: Date { start }
    var open: Int { swimmers.filter { $0 == 0 }.count }
    var shared: Int { swimmers.filter { $0 == 1 }.count }
    var bookable: Int { open + shared }
}
struct KidsBlock: Identifiable, Hashable, Sendable {
    var index: Int
    var start: Date
    var end: Date
    var spotsLeft: Int
    var capacity: Int
    var past: Bool
    var id: Int { index }
}
struct PTSlot: Identifiable, Hashable, Sendable {
    var start: Date
    var available: Bool
    var id: Date { start }
}

struct ReserveRequest: Identifiable, Hashable, Sendable {
    var kind: ReserveKind
    var clubID: ClubID
    var start: Date
    var sport: CourtSport?
    var duration: Int
    var block: Int?
    var id: String { "\(kind.rawValue)|\(clubID)|\(start.timeIntervalSince1970)|\(sport?.rawValue ?? "")|\(duration)" }
}

enum ReserveResult {
    case ok(Booking)
    case failed(String)
}

extension AppModel {
    // MARK: Day windows
    /// Courts: today plus 3 days. Lanes and kids club follow the class window.
    func reserveDays(_ kind: ReserveKind) -> [Date] {
        let n = kind == .court ? 3 : window
        return (0...n).map { now.startOfAZDay.addingDays($0) }
    }
    func reserveOpensAt(_ day: Date, kind: ReserveKind) -> Date {
        day.addingDays(-(kind == .court ? 3 : window)).addingTimeInterval(6 * 3600)
    }
    func clubsFor(_ kind: ReserveKind) -> [Club] {
        clubs.filter { c in
            switch kind { case .court: c.hasCourts; case .lane: c.hasPool; case .kidsClub: c.hasKids }
        }
    }
    func reserveEligibleClubs(_ kind: ReserveKind) -> [Club] {
        clubsFor(kind).filter { member.plan.allClubs || $0.id == member.homeClubID }
    }

    // MARK: Courts
    func courtSlots(club: Club, sport: CourtSport, day: Date, duration: Int) -> [CourtSlot] {
        let total = club.courts(for: sport)
        guard total > 0 else { return [] }
        let open = club.opens(on: day), close = club.closes(on: day)
        var slots: [CourtSlot] = []
        var m = ((open + 29) / 30) * 30
        while m + duration <= close {
            let start = AZ.cal.date(bySettingHour: m / 60, minute: m % 60, second: 0, of: day)!
            var free: [Int]
            if let o = Occupancy.courtOverride(club: club, sport: sport, day: day, slotMinute: m, duration: duration) { free = o }
            else {
                free = (1...total).filter { court in
                    stride(from: m, to: m + duration, by: 30).allSatisfy { !Occupancy.courtOccupied(club: club, sport: sport, court: court, day: day, slotMinute: $0) }
                }
            }
            let end = start.addingTimeInterval(Double(duration) * 60)
            let mine = bookings.filter { $0.kind == .court && $0.status == .booked && $0.clubID == club.id && $0.sport == sport && $0.start < end && $0.end > start }.map(\.resource)
            free.removeAll { mine.contains($0) }
            slots.append(CourtSlot(start: start, free: free, past: start <= now))
            m += 30
        }
        return slots
    }

    func courtListText(_ free: [Int]) -> String {
        switch free.count {
        case 0: return "Full"
        case 1: return "Court \(free[0]) open"
        default: return "Courts " + free.map(String.init).joined(separator: ", ") + " open"
        }
    }

    // MARK: Lanes
    func laneSlots(club: Club, day: Date) -> [LaneSlot] {
        guard club.hasPool else { return [] }
        let open = AZ.cal.isDateInWeekend(day) ? 6 * 60 : 5 * 60 + 30
        let poolClose = club.closes(on: day) - 30
        var slots: [LaneSlot] = []
        var m = open
        while m + 45 <= poolClose {
            let start = AZ.cal.date(bySettingHour: m / 60, minute: m % 60, second: 0, of: day)!
            var sw = Occupancy.laneSwimmers(club: club, day: day, slotMinute: m)
            let end = start.addingTimeInterval(45 * 60)
            for b in bookings where b.kind == .lane && b.status == .booked && b.clubID == club.id && b.start < end && b.end > start {
                if b.resource >= 1 && b.resource <= sw.count { sw[b.resource - 1] = min(2, sw[b.resource - 1] + 1) }
            }
            slots.append(LaneSlot(start: start, swimmers: sw, past: start <= now))
            m += 45
        }
        return slots
    }
    func laneRowText(_ s: LaneSlot, total: Int) -> String {
        if s.bookable == 0 { return "Full" }
        var t = "\(s.open) lane\(s.open == 1 ? "" : "s") open"
        if s.shared > 0 { t += " · +\(s.shared) to share" }
        return t
    }

    // MARK: Kids club
    func kidsBlocks(club: Club, day: Date) -> [KidsBlock] {
        Occupancy.kidsBlocks.enumerated().map { i, b in
            let start = AZ.cal.date(bySettingHour: b.start / 60, minute: 0, second: 0, of: day)!
            let end = AZ.cal.date(bySettingHour: b.end / 60, minute: 0, second: 0, of: day)!
            var left = Occupancy.kidsSpotsLeft(club: club, day: day, block: i)
            let mine = bookings.filter { $0.kind == .kids && $0.status == .booked && $0.clubID == club.id && $0.start == start }.reduce(0) { $0 + max($1.people.count, 1) }
            left = max(0, left - mine)
            return KidsBlock(index: i, start: start, end: end, spotsLeft: left, capacity: Occupancy.kidsCapacity(club), past: start <= now)
        }
    }
    var kidsEligible: [Person] { people.filter { ($0.role == .child) && $0.age <= 12 } }

    // MARK: PT
    /// A coach's PT openings that day: the coach's set times from the database (`coaches.open_times`),
    /// or simulated hourly openings for a coach without set times.
    func ptSlots(coach: Coach, day: Date) -> [PTSlot] {
        func taken(_ start: Date) -> Bool { bookings.contains { $0.kind == .pt && $0.status == .booked && $0.start == start } }
        if !coach.openTimes.isEmpty {
            let dow = AZ.cal.component(.weekday, from: day) - 1
            return coach.openTimes.filter { $0.dow == dow }.map(\.minute).sorted().map { m in
                let start = AZ.cal.date(bySettingHour: m / 60, minute: m % 60, second: 0, of: day)!
                return PTSlot(start: start, available: start > now && !taken(start))
            }
        }
        return (8..<20).map { h in
            let start = AZ.cal.date(bySettingHour: h, minute: 0, second: 0, of: day)!
            return PTSlot(start: start, available: start > now && Occupancy.ptAvailable(coach: coach, day: day, hour: h) && !taken(start))
        }
    }
    var ptIntroAvailable: Bool { member.plan == .summit && !bookings.contains { $0.kind == .pt && $0.detail.contains("intro") && $0.status != .cancelled } }

    enum PTResult { case ok(Booking), requestSent(String), failed(String) }
    func bookPT(coach: Coach, start: Date) -> PTResult {
        if member.isTeen { return .requestSent("Needs a parent's OK. We sent the request to \(member.ownerFirst).") }
        let intro = ptIntroAvailable
        let dur = intro ? 30 : 45
        let undo = rollbackPoint()
        var b = Booking(id: newID("b"), kind: .pt, status: .booked, sessionID: nil,
                        title: intro ? "PT intro session" : "Personal training", clubID: coach.clubs.first ?? member.homeClubID,
                        category: .strength, start: start, end: start.addingTimeInterval(Double(dur) * 60),
                        detail: intro ? "with \(coach.shortName) · intro" : "with \(coach.shortName)", coachID: coach.id, createdAt: now)
        b.memberID = memberRowID; b.rowIDs = [b.id]; b.ref = HouseholdMapper.newRef()
        if !intro { b.title = "Training with \(coach.fullName)" }
        bookings.append(b)
        writeInsert(b, failure: "Couldn't book the session.", rollback: undo)
        afterBookingChange(b)
        return .ok(b)
    }

    // MARK: Holds (5 minutes, one 5-minute extension)
    func beginHold(_ r: ReserveRequest, label: String) {
        hold = ReserveHold(kind: r.kind, clubID: r.clubID, start: r.start, label: label, expires: now.addingTimeInterval(5 * 60), extended: false)
    }
    func extendHold() {
        guard var h = hold, !h.extended else { return }
        h.expires = h.expires.addingTimeInterval(5 * 60); h.extended = true; hold = h
    }
    func endHold() { hold = nil }
    var holdValid: Bool { if let h = hold { return h.expires > now } else { return false } }

    // MARK: Court reservation
    func reserveCourt(_ r: ReserveRequest, court: Int?) -> ReserveResult {
        guard let sport = r.sport else { return .failed("Pick a sport.") }
        let club = self.club(r.clubID)
        if let b = bookingBlock { return .failed(b == .offline ? "You're offline. Try again when you are online." : "Booking is paused. \(b.label).") }
        guard member.plan.courtsIncluded else { return .failed("Courts come with Ridge.") }
        if member.isTeen, currentPerson?.courtsAllowed != true { return .failed("Ask a parent to turn on courts.") }
        guard holdValid else { return .failed("Your hold ended. Pick the time again.") }
        let day = r.start.startOfAZDay
        let mine = bookings.filter { $0.kind == .court && $0.status == .booked && $0.end > now }
        if mine.contains(where: { $0.start.startOfAZDay == day }) { return .failed("You already have a court on \(day.cpWeekdayShort). One a day.") }
        if mine.count >= 2 { return .failed("You have 2 active court reservations. Cancel one to book another.") }
        let slots = courtSlots(club: club, sport: sport, day: day, duration: r.duration)
        guard let slot = slots.first(where: { $0.start == r.start }), !slot.free.isEmpty else {
            return .failed("Someone just took that time. Pick another start.")
        }
        let chosen = court.flatMap { slot.free.contains($0) ? $0 : nil } ?? slot.free[0]
        if let c = court, !slot.free.contains(c) {
            return .failed("Someone just took that time. \(courtListText(slot.free)) at \(r.start.cpTime)")
        }
        let undo = rollbackPoint()
        var b = Booking(id: newID("b"), kind: .court, status: .booked, sessionID: nil, title: "\(sport.title) · Court \(chosen)", clubID: club.id,
                        category: .court, start: r.start, end: r.start.addingTimeInterval(Double(r.duration) * 60), detail: "Court \(chosen)", createdAt: now)
        b.resource = chosen; b.sport = sport
        b.memberID = memberRowID; b.rowIDs = [b.id]; b.ref = HouseholdMapper.newRef()
        bookings.append(b)
        hold = nil
        writeInsert(b, failure: "Couldn't reserve the court.", rollback: undo)
        afterBookingChange(b)
        return .ok(b)
    }

    func reserveLane(_ r: ReserveRequest, lane: Int?) -> ReserveResult {
        let club = self.club(r.clubID)
        if let b = bookingBlock { return .failed(b == .offline ? "You're offline. Try again when you are online." : "Booking is paused. \(b.label).") }
        if member.isTeen, !(currentPerson?.lanesAllowed == true && member.age >= 14) { return .failed("Ask a parent to turn on lap lanes.") }
        guard holdValid else { return .failed("Your hold ended. Pick the time again.") }
        let day = r.start.startOfAZDay
        if bookings.contains(where: { $0.kind == .lane && $0.status == .booked && $0.start == r.start }) { return .failed("You already have a lane at that time.") }
        guard let slot = laneSlots(club: club, day: day).first(where: { $0.start == r.start }), slot.bookable > 0 else {
            return .failed("Lap lanes have no waitlist. Try another time.")
        }
        let openLanes = slot.swimmers.enumerated().filter { $0.element < 2 }.map { $0.offset + 1 }
        let chosen: Int
        if let l = lane { guard openLanes.contains(l) else { return .failed("Lane \(l) just filled. Pick another lane.") }; chosen = l }
        else { chosen = slot.swimmers.enumerated().first { $0.element == 0 }.map { $0.offset + 1 } ?? openLanes[0] }
        let undo = rollbackPoint()
        var b = Booking(id: newID("b"), kind: .lane, status: .booked, sessionID: nil, title: "Lap swim · Lane \(chosen)", clubID: club.id,
                        category: .aqua, start: r.start, end: r.start.addingTimeInterval(45 * 60), detail: "Lane \(chosen)", createdAt: now)
        b.resource = chosen
        b.memberID = memberRowID; b.rowIDs = [b.id]; b.ref = HouseholdMapper.newRef()
        bookings.append(b)
        hold = nil
        writeInsert(b, failure: "Couldn't reserve the lane.", rollback: undo)
        afterBookingChange(b)
        return .ok(b)
    }

    func reserveKids(_ r: ReserveRequest, children: [Person], note: String) -> ReserveResult {
        let club = self.club(r.clubID)
        if offline { return .failed("You're offline. Try again when you are online.") }
        if isFrozen { return .failed("Membership frozen. Resume to book.") }
        guard !children.isEmpty else { return .failed("Pick at least one child.") }
        guard holdValid else { return .failed("Your hold ended. Pick the time again.") }
        let day = r.start.startOfAZDay
        guard let idx = r.block, let blk = kidsBlocks(club: club, day: day).first(where: { $0.index == idx }) else { return .failed("That block is not available.") }
        for c in children {
            let n = bookings.filter { $0.kind == .kids && $0.status == .booked && $0.start.startOfAZDay == day && $0.people.contains(c.first) }.count
            if n >= 2 { return .failed("\(c.first) has 2 blocks that day.") }
        }
        if blk.spotsLeft < children.count {
            return .failed("Only \(blk.spotsLeft) spot\(blk.spotsLeft == 1 ? "" : "s") left. Reserve \(blk.spotsLeft) child\(blk.spotsLeft == 1 ? "" : "ren") or join the waitlist for the other.")
        }
        let names = children.map(\.first)
        var b = Booking(id: newID("b"), kind: .kids, status: .booked, sessionID: nil, title: "Kids club", clubID: club.id, category: .youth,
                        start: blk.start, end: blk.end, detail: names.joined(separator: " + "), people: names, createdAt: now)
        b.cancelReason = note.isEmpty ? nil : note
        b.rowIDs = children.map { _ in newID("b") }; b.id = b.rowIDs[0]; b.ref = HouseholdMapper.newRef()
        let undo = rollbackPoint()
        bookings.append(b)
        hold = nil
        writeInsert(b, failure: "Couldn't reserve kids club.", rollback: undo)
        afterBookingChange(b)
        return .ok(b)
    }

    func joinKidsWaitlist(_ r: ReserveRequest, children: [Person]) -> Booking? {
        let club = self.club(r.clubID)
        guard let idx = r.block, let blk = kidsBlocks(club: club, day: r.start.startOfAZDay).first(where: { $0.index == idx }) else { return nil }
        var b = Booking(id: newID("b"), kind: .kids, status: .waitlisted, sessionID: nil, title: "Kids club", clubID: club.id, category: .youth,
                        start: blk.start, end: blk.end, detail: children.map(\.first).joined(separator: " + "), people: children.map(\.first), createdAt: now)
        b.waitlistPosition = 2
        b.rowIDs = children.map { _ in newID("b") }; b.id = b.rowIDs[0]; b.ref = HouseholdMapper.newRef()
        let undo = rollbackPoint()
        bookings.append(b)
        writeInsert(b, failure: "Couldn't join the kids club waitlist.", rollback: undo)
        return b
    }
}
