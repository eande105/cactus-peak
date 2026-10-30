import Foundation
import ActivityKit

let cpAppGroup = "group.com.cactuspeak.member"

/// A small cached copy of what widgets need. The app writes it. Widgets only read it.
/// No member name, member number or pass code is ever stored here.
struct WidgetSnapshot: Codable, Sendable, Hashable {
    struct NextClass: Codable, Sendable, Hashable {
        var sessionID: String
        var name: String
        var category: ClassCategory
        var start: Date
        var end: Date
        var room: String
        var clubShort: String
        var intensity: Int
    }
    struct ClubNow: Codable, Sendable, Hashable {
        var slug: String
        var name: String
        var level: Int          // 1...5, 0 = closed or unavailable
        var word: String
        var hourly: [Double]    // 18 values, 4 a.m. to 9 p.m.
        var hourIndex: Int
        var openUntil: String
        var updatedAt: Date
    }
    struct Upcoming: Codable, Sendable, Hashable {
        var title: String
        var start: Date
        var club: String
        var category: ClassCategory?
    }
    struct Kids: Codable, Sendable, Hashable {
        var names: String
        var start: Date
        var checkInBy: Date
    }

    var generatedAt: Date
    var next: NextClass?
    var nextList: [NextClass] = []     // upcoming booked classes, so a timeline can move on by itself
    var club: ClubNow
    var upcoming: [Upcoming]
    var weekVisits: Int
    var goal: Int
    var streakWeeks: Int
    var weekDots: [Bool]       // Mon...Sun, visited
    var todayIndex: Int
    var kids: Kids?

    static let sample: WidgetSnapshot = {
        let start = AZ.date(2026, 10, 27, 6, 0)
        return WidgetSnapshot(
            generatedAt: AZ.date(2026, 10, 27, 5, 40),
            next: .init(sessionID: "sample", name: "Climb Cycle", category: .cycle, start: start,
                        end: start.addingTimeInterval(45 * 60), room: "Cycle studio", clubShort: "Val Vista", intensity: 4),
            club: .init(slug: "gilbert-val-vista", name: "Gilbert – Val Vista", level: 3, word: "Steady",
                        hourly: [0.15, 0.4, 0.55, 0.45, 0.3, 0.25, 0.3, 0.35, 0.3, 0.25, 0.3, 0.45, 0.7, 0.85, 0.75, 0.55, 0.35, 0.2],
                        hourIndex: 1, openUntil: "10 p.m.", updatedAt: AZ.date(2026, 10, 27, 5, 35)),
            upcoming: [
                .init(title: "Climb Cycle", start: start, club: "Val Vista", category: .cycle),
                .init(title: "Climb Cycle", start: AZ.date(2026, 10, 29, 6, 0), club: "Val Vista", category: .cycle),
                .init(title: "Kids club", start: AZ.date(2026, 10, 31, 8, 0), club: "Val Vista", category: .youth),
            ],
            weekVisits: 2, goal: 3, streakWeeks: 6,
            weekDots: [true, false, false, false, false, false, false], todayIndex: 1,
            kids: .init(names: "Mia + Eli", start: AZ.date(2026, 10, 31, 8, 0), checkInBy: AZ.date(2026, 10, 31, 8, 15)))
    }()
}

enum SnapshotStore {
    private static var url: URL? {
        FileManager.default.containerURL(forSecurityApplicationGroupIdentifier: cpAppGroup)?
            .appendingPathComponent("snapshot.json")
    }
    static func save(_ s: WidgetSnapshot) {
        guard let url, let data = try? JSONEncoder().encode(s) else { return }
        try? data.write(to: url, options: .atomic)
    }
    static func load() -> WidgetSnapshot {
        guard let url, let data = try? Data(contentsOf: url),
              let s = try? JSONDecoder().decode(WidgetSnapshot.self, from: data) else { return .sample }
        return s
    }
}

/// Live Activity data. One activity at a time. No member name on the Lock Screen.
struct ClassActivityAttributes: ActivityAttributes {
    struct ContentState: Codable, Hashable {
        enum Phase: String, Codable, Hashable { case upcoming, checkInDue, inProgress, ended }
        var phase: Phase
        var startsAt: Date
        var endsAt: Date
        var startLabel: String      // "6:00 a.m." (Arizona time, formatted by the app)
        var endLabel: String
    }
    var sessionID: String
    var className: String
    var category: ClassCategory
    var clubShort: String
    var room: String
}
