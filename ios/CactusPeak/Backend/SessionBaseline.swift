import Foundation

/// The spots taken by members outside the demo households, the same numbers the web app shows.
/// A port of `web-app/lib/data/sessions.ts` (`hash`, `STORY`, the baseline rule). It must match bit for bit,
/// so `SessionBaselineTests` checks it against values computed by running the web code.
enum SessionBaseline {
    /// FNV-1a, 32-bit, over UTF-16 code units, as `hash()` in sessions.ts (`Math.imul`, `>>> 0`). Returns 0..<1.
    static func hash(_ s: String) -> Double {
        var h: UInt32 = 2_166_136_261
        for unit in s.utf16 {
            h ^= UInt32(unit)
            h = h &* 16_777_619
        }
        return Double(h % 100_000) / 100_000
    }

    /// JavaScript `Math.round`: halves round up, never to even.
    static func jsRound(_ x: Double) -> Int { Int((x + 0.5).rounded(.down)) }

    /// The written spec's numbers (Val Vista, Oct 27 to Nov 1). Keyed like sessions.ts: "<club>|YYYY-MM-DD|HH:MM|<key>".
    static let story: [String: (booked: Int, waitlist: Int)] = [
        "gilbert-val-vista|2026-10-27|05:30|rrs": (8, 0),
        "gilbert-val-vista|2026-10-27|06:00|cc": (15, 0),
        "gilbert-val-vista|2026-10-27|07:00|cc": (9, 0),
        "gilbert-val-vista|2026-10-27|09:00|af": (7, 0),
        "gilbert-val-vista|2026-10-27|09:30|dfy": (6, 0),
        "gilbert-val-vista|2026-10-27|12:00|sbh": (19, 3),
        "gilbert-val-vista|2026-10-27|16:30|dfy": (8, 0),
        "gilbert-val-vista|2026-10-27|16:30|ts": (7, 0),
        "gilbert-val-vista|2026-10-27|17:30|m30": (6, 0),
        "gilbert-val-vista|2026-10-28|06:00|cc": (12, 0),
        "gilbert-val-vista|2026-10-29|06:00|rrs": (14, 3),
        "gilbert-val-vista|2026-10-30|12:00|dfy": (12, 0),
        "gilbert-val-vista|2026-10-31|08:00|sbh": (16, 0),
        "gilbert-val-vista|2026-10-31|08:00|cc": (17, 0),
        "gilbert-val-vista|2026-11-01|09:00|m30": (9, 0),
        "mesa-dobson|2026-10-31|08:00|e60": (15, 0),
    ]

    /// - Parameters: day "YYYY-MM-DD" and time "HH:MM" in Arizona time.
    static func make(club: String, day: String, time: String, classKey: String, capacity: Int) -> (booked: Int, waitlist: Int) {
        let sk = "\(club)|\(day)|\(time)|\(classKey)"
        if let s = story[sk] { return s }
        let r = hash(sk)
        if r > 0.93 { return (capacity, 1 + Int((hash(sk + "w") * 5).rounded(.down))) }
        return (jsRound(Double(capacity) * (0.3 + r * 0.62)), 0)
    }
}
