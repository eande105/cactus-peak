import XCTest
@testable import CactusPeak

@MainActor
final class CopyTests: XCTestCase {
    func testEndingSentence() {
        XCTAssertEqual("5:30 a.m.".endingSentence, "5:30 a.m.")
        XCTAssertEqual("Free cancel".endingSentence, "Free cancel.")
        XCTAssertEqual("Ready?".endingSentence, "Ready?")
    }

    func testTimeFormatter() {
        XCTAssertEqual(AZ.date(2026, 10, 27, 5, 30).cpTime, "5:30 a.m.")
        XCTAssertEqual(AZ.date(2026, 10, 27, 12, 0).cpTime, "12:00 p.m.")
        XCTAssertEqual(AZ.date(2026, 10, 27, 0, 5).cpTime, "12:05 a.m.")
        XCTAssertEqual(AZ.date(2026, 10, 27, 6, 0).cpTimeShort, "6 a.m.")
        XCTAssertEqual(AZ.date(2026, 10, 27, 18, 15).cpTimeShort, "6:15 p.m.")
        XCTAssertEqual(AZ.date(2026, 10, 27, 6, 0).cpClock.0, "6:00")
    }

    /// Every generated sentence must be free of a doubled period, because a time string already ends with one.
    func testNoDoublePeriods() {
        let m = Fixtures.model()
        m.applyHousehold(Fixtures.household(bookings: [Fixtures.booking("b1")]), savedAt: Date())
        var texts: [String] = []
        for s in m.sessions.prefix(400) {
            let r = m.rulesText(for: s)
            texts += [r.cancel, r.waitlist] + (r.strikes.map { [$0] } ?? [])
        }
        for c in m.clubs { texts.append(m.popularCaption(c)) }
        for b in m.upcomingBookings { texts.append("Free cancel until \(b.cancelCutoff().cpTime)") }
        texts.append(ClashPrompt(id: "x", existing: "Rib Rack Strength", existingTime: "5:30 a.m.").message)
        for t in texts { XCTAssertFalse(t.contains(".."), "Double period in: \(t)") }
    }
}
