import XCTest
@testable import CactusPeak

/// Expected values come from running web-app/lib/data/sessions.ts (`sessionsForDay`) with tsx on 2026-10-29.
final class SessionBaselineTests: XCTestCase {
    func testHashMatchesWeb() {
        XCTAssertEqual(SessionBaseline.hash("mesa-dobson|2026-10-27|09:30|dfy"), 0.41146, accuracy: 1e-12)
    }

    func testJSRoundRoundsHalfUp() {
        XCTAssertEqual(SessionBaseline.jsRound(10.5), 11)
        XCTAssertEqual(SessionBaseline.jsRound(11.5), 12)
        XCTAssertEqual(SessionBaseline.jsRound(10.49), 10)
    }

    func testBaselinesMatchWeb() {
        let cases: [(club: String, day: String, time: String, key: String, cap: Int, booked: Int, wait: Int)] = [
            ("mesa-dobson", "2026-10-27", "09:30", "dfy", 20, 11, 0),        // formula
            ("mesa-dobson", "2026-10-28", "05:30", "ms", 12, 10, 0),         // formula
            ("gilbert-val-vista", "2026-10-29", "06:00", "rrs", 14, 14, 3),  // STORY, with waitlist
            ("mesa-dobson", "2026-10-31", "08:00", "e60", 18, 15, 0),        // STORY
            ("mesa-dobson", "2026-10-31", "11:00", "m30", 24, 24, 4),        // r > 0.93: full, waitlist
            ("mesa-dobson", "2026-11-03", "09:00", "af", 16, 16, 1),         // r > 0.93
        ]
        for c in cases {
            let b = SessionBaseline.make(club: c.club, day: c.day, time: c.time, classKey: c.key, capacity: c.cap)
            XCTAssertEqual(b.booked, c.booked, "\(c.club) \(c.day) \(c.time) \(c.key)")
            XCTAssertEqual(b.waitlist, c.wait, "\(c.club) \(c.day) \(c.time) \(c.key)")
        }
    }

    @MainActor func testSpotsLeftMatchesWebSessionLeft() {
        let m = Fixtures.model()
        m.applyHousehold(Fixtures.household(bookings: []), savedAt: Date())
        // Fixture Climb Cycle, Wed Oct 28 6:00 at Dobson, capacity 20. Web baseline: 14 booked.
        let s = m.session("mesa-dobson~2026-10-28~0600~cc")!
        XCTAssertEqual(s.baseBooked, 14)
        XCTAssertEqual(m.spotsLeft(s), 6)
        // Two other households hold spots.
        m.applyCounts([SessionCountRow(sessionId: s.id, booked: 2, waitlisted: 0)])
        XCTAssertEqual(m.spotsLeft(s), 4)
        // This member books: counted once, whether or not session_counts has caught up.
        guard case .ok = m.book(s) else { return XCTFail("Book failed") }
        XCTAssertEqual(m.spotsLeft(s), 3)
        m.applyCounts([SessionCountRow(sessionId: s.id, booked: 3, waitlisted: 0)])
        XCTAssertEqual(m.spotsLeft(s), 3)
    }
}
