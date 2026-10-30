import Foundation

func stableHash(_ s: String) -> UInt64 {
    var h: UInt64 = 14695981039346656037
    for b in s.utf8 { h = (h ^ UInt64(b)) &* 1099511628211 }
    return h
}

/// Simulated occupancy for things the database does not track: live busyness, other people on courts and in
/// lanes, kids club places and PT openings for coaches without set times. The member's own bookings come from
/// the database and are added on top by `AppModel`. The catalog itself (clubs, coaches, classes) is never made up here.
enum Occupancy {
    // MARK: Busyness
    static func level(for v: Double) -> Int { v < 0.2 ? 1 : v < 0.4 ? 2 : v < 0.6 ? 3 : v < 0.8 ? 4 : 5 }

    /// 18 hourly values (4 a.m. to 9 p.m.), 0...1. Made from the club's usual busyness (1 to 5) in the database.
    static func popularTimes(club: Club, on date: Date) -> [Double] {
        let levels = AZ.cal.isDateInWeekend(date) ? club.typicalWeekend : club.typicalWeekday
        guard levels.count == 18 else { return Array(repeating: 0.3, count: 18) }
        return levels.map { min(1, max(0, (Double($0) - 0.5) / 5)) }
    }

    static func busyness(club: Club, at now: Date, staleDemo: Bool) -> BusynessReading {
        let closed = !club.isOpen(at: now)
        let c = AZ.cal.dateComponents([.hour, .minute], from: now)
        let hour = c.hour ?? 0
        let idx = min(max(hour - 4, 0), 17)
        let curve = popularTimes(club: club, on: now)
        let usual = level(for: curve[idx])
        let bucket = ((c.minute ?? 0) / 5)
        let jitter = (Double(stableHash("\(club.id)\(now.cpDayKey)\(hour)\(bucket)") % 100) / 100 - 0.5) * 0.12
        let lvl = level(for: max(0, curve[idx] + jitter))
        let updated = AZ.cal.date(bySettingHour: hour, minute: bucket * 5, second: 0, of: now) ?? now
        let opens = AZ.cal.isDateInWeekend(now.addingDays(club.isOpen(at: now) ? 0 : 1)) ? "6:00 a.m." : "4:30 a.m."
        return BusynessReading(level: lvl, usual: usual, closed: closed,
                               stale: staleDemo && club.id == "gilbert-val-vista",
                               updatedAt: staleDemo ? updated.addingTimeInterval(-22 * 60) : updated, opensText: opens)
    }

    // MARK: Courts
    static func courtOccupied(club: Club, sport: CourtSport, court: Int, day: Date, slotMinute: Int) -> Bool {
        let h = Int(stableHash("\(club.id)|\(sport.rawValue)|\(court)|\(day.cpDayKey)|\(slotMinute)") % 100)
        let hour = slotMinute / 60
        let density = hour < 7 ? 38 : hour < 12 ? 48 : hour < 16 ? 26 : hour < 20 ? 55 : 35
        return h < density
    }
    static func courtOverride(club: Club, sport: CourtSport, day: Date, slotMinute: Int, duration: Int) -> [Int]? {
        if club.id == "mesa-red-mountain", sport == .pickleball, day.cpDayKey == "20261029", duration == 90 {
            switch slotMinute {
            case 7 * 60: return [2]
            case 8 * 60: return [1, 3, 4]
            case 9 * 60: return [1, 2, 3, 5, 6]
            default: return nil
            }
        }
        return nil
    }

    // MARK: Lanes
    static func laneSwimmers(club: Club, day: Date, slotMinute: Int) -> [Int] {
        guard club.lanes > 0 else { return [] }
        return (1...club.lanes).map { lane in
            let h = Int(stableHash("\(club.id)|lane\(lane)|\(day.cpDayKey)|\(slotMinute)") % 100)
            let hour = slotMinute / 60
            let peak = (hour >= 5 && hour <= 7) || (hour >= 17 && hour <= 19)
            let t0 = peak ? 20 : 38, t1 = peak ? 45 : 62
            return h < t0 ? 0 : (h < t1 ? 1 : 2)
        }
    }

    // MARK: Kids
    static let kidsBlocks: [(start: Int, end: Int)] = [(8 * 60, 10 * 60), (10 * 60, 12 * 60), (16 * 60, 18 * 60), (18 * 60, 20 * 60)]
    static func kidsSpotsLeft(club: Club, day: Date, block: Int) -> Int {
        let h = Int(stableHash("\(club.id)|kids|\(day.cpDayKey)|\(block)") % 100)
        return h < 12 ? 0 : (h < 35 ? 1 + h % 5 : 4 + h % 12)
    }
    static func kidsCapacity(_ club: Club) -> Int { club.id == "mesa-dobson" ? 24 : 16 }

    // MARK: Personal training
    static func ptAvailable(coach: Coach, day: Date, hour: Int) -> Bool {
        Int(stableHash("\(coach.id)|\(day.cpDayKey)|\(hour)") % 100) > 32
    }
}
