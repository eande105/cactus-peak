import XCTest
@testable import CactusPeak

final class SessionKeyTests: XCTestCase {
    func testMatchesWebFormat() {
        // 6:00 a.m. Arizona time is 13:00 UTC. The id uses the Arizona day and time.
        let start = AZ.date(2026, 10, 27, 6, 0)
        XCTAssertEqual(SessionKey.make(club: "gilbert-val-vista", start: start, classKey: "cc"), "gilbert-val-vista~2026-10-27~0600~cc")
        XCTAssertEqual(SessionKey.make(club: "mesa-dobson", start: AZ.date(2026, 11, 1, 17, 30), classKey: "ride"), "mesa-dobson~2026-11-01~1730~ride")
    }

    func testLateEveningStaysOnArizonaDay() {
        // 6:30 p.m. Arizona is 01:30 UTC the next day. The id must not move to the UTC day.
        XCTAssertEqual(SessionKey.make(club: "x", start: AZ.date(2026, 10, 28, 18, 30), classKey: "kf"), "x~2026-10-28~1830~kf")
    }

    func testParseRoundTrip() {
        let id = "mesa-red-mountain~2026-10-28~0900~af"
        let p = SessionKey.parse(id)
        XCTAssertEqual(p?.club, "mesa-red-mountain")
        XCTAssertEqual(p?.classKey, "af")
        XCTAssertEqual(p?.start, AZ.date(2026, 10, 28, 9, 0))
        XCTAssertEqual(p.map { SessionKey.make(club: $0.club, start: $0.start, classKey: $0.classKey) }, id)
        XCTAssertNil(SessionKey.parse("gilbert-val-vista_20261029_0600_cycle6"))
    }
}

final class CatalogMappingTests: XCTestCase {
    func testClubRow() {
        let c = CatalogMapper.clubs(Fixtures.catalog.clubs)[0]
        XCTAssertEqual(c.id, "mesa-dobson")
        XCTAssertEqual(c.fullName, "Mesa – Dobson")
        XCTAssertEqual(c.lanes, 8)
        XCTAssertEqual(c.pickleball, 4)
        XCTAssertEqual(c.tennis, 2)
        XCTAssertTrue(c.hasTherapyPool)
        XCTAssertTrue(c.hasRecovery)
        XCTAssertEqual(c.typicalWeekday.count, 18)
        XCTAssertEqual(c.amenities.first?.symbol, "figure.pool.swim")
    }

    func testCoachRows() {
        let rows = Fixtures.catalog
        let coaches = CatalogMapper.coaches(rows.coaches, classTypes: rows.classTypes)
        let jamal = coaches.first { $0.id == "jamal" }!
        XCTAssertEqual(jamal.category, .cycle)
        XCTAssertEqual(jamal.shortName, "Jamal C.")
        XCTAssertEqual(jamal.credential, "Cycle coach")
        let sam = coaches.first { $0.id == "sam" }!
        XCTAssertEqual(sam.category, .youth, "No discipline: the category comes from the classes the coach teaches")
        XCTAssertTrue(sam.trains)
        XCTAssertEqual(sam.openTimes, [Coach.Opening(dow: 2, minute: 9 * 60 + 30)])
    }

    func testSessionsFromSchedule() {
        // Tue Oct 27 to Mon Nov 2. Climb Cycle runs Mon to Fri, yoga on Sunday, lap swim is not bookable.
        let s = CatalogMapper.sessions(catalog: Fixtures.catalog, from: AZ.date(2026, 10, 27), days: 7)
        XCTAssertEqual(s.filter { $0.classKey == "cc" }.count, 5)
        XCTAssertEqual(s.filter { $0.classKey == "dfy" }.map(\.id), ["mesa-dobson~2026-11-01~0900~dfy"])
        XCTAssertFalse(s.contains { $0.classKey == "lap-swim" })
        let cycle = s.first { $0.id == "mesa-dobson~2026-10-27~0600~cc" }
        XCTAssertEqual(cycle?.start, AZ.date(2026, 10, 27, 6, 0))
        XCTAssertEqual(cycle?.durationMin, 45)
        XCTAssertEqual(cycle?.capacity, 20)
        XCTAssertEqual(cycle?.spotNoun, "bikes")
        XCTAssertEqual(cycle?.intensity, 4)
        XCTAssertEqual(s.first { $0.classKey == "dfy" }?.intensity, 1, "A schedule intensity overrides the class type")
        XCTAssertEqual(s.first { $0.classKey == "dfy" }?.category, .mindBody)
    }
}

final class HouseholdMappingTests: XCTestCase {
    let now = AZ.date(2026, 10, 27, 5, 40)

    func testMemberAndPeople() {
        let s = HouseholdMapper.map(Fixtures.household(bookings: []), coaches: [], now: now)
        XCTAssertEqual(s.member.name, "Daniel Whitaker")
        XCTAssertEqual(s.member.plan, .trailhead)
        XCTAssertEqual(s.member.homeClubID, "mesa-dobson")
        XCTAssertEqual(s.member.age, 52)
        XCTAssertEqual(s.member.billingDay, 14)
        XCTAssertEqual(s.member.sinceText, "September 2026")
        XCTAssertEqual(s.people.map(\.role), [.admin, .child, .child])
        XCTAssertEqual(s.people[1].allergies, "Peanuts")
        XCTAssertEqual(s.weeklyGoal, 4)
        XCTAssertEqual(s.interests, [.recovery, .mindBody])
        XCTAssertEqual(s.ptSessionsLeft, 3)
        XCTAssertFalse(s.onboarded)
        XCTAssertEqual(s.inbox.first?.kind, .coach)
        XCTAssertTrue(s.inbox.first?.unread == true)
    }

    func testBookingStatusesAndKinds() {
        let rows = Fixtures.household(bookings: [
            Fixtures.booking("b1"),
            Fixtures.booking("b2", status: "late_cancelled"),
            Fixtures.booking("b3", status: "no_show"),
            Fixtures.booking("b4", status: "held"),
            Fixtures.booking("b5", status: "pending_approval"),
            Fixtures.booking("b6", kind: "lane", session: nil),
            Fixtures.booking("b7", member: "someone-else"),
        ])
        let s = HouseholdMapper.map(rows, coaches: [], now: now) { _ in "dana" }
        let byID = Dictionary(uniqueKeysWithValues: s.bookings.map { ($0.id, $0) })
        XCTAssertEqual(byID["b1"]?.status, .booked)
        XCTAssertEqual(byID["b1"]?.sessionID, "mesa-dobson~2026-10-28~0900~af")
        XCTAssertEqual(byID["b1"]?.coachID, "dana")
        XCTAssertEqual(byID["b1"]?.start, AZ.date(2026, 10, 28, 9, 0))
        XCTAssertEqual(byID["b2"]?.status, .lateCancelled)
        XCTAssertEqual(byID["b3"]?.status, .missed)
        XCTAssertEqual(byID["b4"]?.status, .hold)
        XCTAssertNil(byID["b5"], "A teen request is not a booking")
        XCTAssertEqual(byID["b6"]?.kind, .lane)
        XCTAssertEqual(byID["b6"]?.resource, 3)
        XCTAssertNil(byID["b7"], "Another member's class is not on this member's list")
    }

    func testKidsClubRowsBecomeOneBooking() {
        let rows = Fixtures.household(bookings: [
            Fixtures.booking("k1", kind: "kids", member: "kid1", ref: "CP-KC", session: nil),
            Fixtures.booking("k2", kind: "kids", member: "kid2", ref: "CP-KC", session: nil),
        ])
        let s = HouseholdMapper.map(rows, coaches: [], now: now)
        XCTAssertEqual(s.bookings.count, 1)
        XCTAssertEqual(s.bookings[0].people, ["Theo", "Ivy"])
        XCTAssertEqual(s.bookings[0].rowIDs, ["k1", "k2"])
        XCTAssertEqual(s.bookings[0].detail, "Theo + Ivy")
    }

    func testInsertRowForClass() {
        var b = Booking(id: "b_x", kind: .classSession, status: .booked, sessionID: "mesa-dobson~2026-10-27~0600~cc", title: "Climb Cycle",
                        clubID: "mesa-dobson", category: .mindBody, start: AZ.date(2026, 10, 27, 6, 0), end: AZ.date(2026, 10, 27, 6, 45),
                        detail: "Cycle Studio")
        b.ref = "CP-ABCDE"
        let row = HouseholdMapper.insertRow(b, rowID: "b_x", memberID: "daniel", ownerID: "daniel", householdID: "h3",
                                            clubName: "Mesa – Dobson", coachSlug: nil, now: now)
        XCTAssertEqual(row["kind"], .string("class"))
        XCTAssertEqual(row["status"], .string("booked"))
        XCTAssertEqual(row["category_id"], .string("mind-body"))
        XCTAssertEqual(row["session_id"], .string("mesa-dobson~2026-10-27~0600~cc"))
        XCTAssertEqual(row["place"], .string("Cycle Studio"))
        XCTAssertEqual(row["starts_at"], .string("2026-10-27T13:00:00.000Z"))
    }

    func testStatusRoundTrip() {
        for s in [BookingStatus.booked, .hold, .waitlisted, .cancelled, .lateCancelled, .attended, .missed] {
            XCTAssertEqual(HouseholdMapper.status(HouseholdMapper.dbStatus(s)), s)
        }
    }
}

final class BackendErrorTests: XCTestCase {
    func testCodes() {
        XCTAssertEqual(BackendError(code: "23505").kind, .duplicate)
        XCTAssertEqual(BackendError(code: "42501").kind, .notAllowed)
        XCTAssertEqual(BackendError(code: "PGRST116").kind, .notFound)
        XCTAssertEqual(BackendError(code: "XX000").kind, .other)
    }

    func testNetworkErrorsAreOffline() {
        XCTAssertEqual(BackendError(URLError(.notConnectedToInternet)).kind, .offline)
        XCTAssertEqual(BackendError(URLError(.timedOut)).kind, .offline)
        XCTAssertEqual(BackendError(URLError(.badServerResponse)).kind, .other)
    }

    func testMessagesNeverBlameTheMemberForANetworkFailure() {
        let offline = BackendError(kind: .offline).localizedDescription
        XCTAssertFalse(offline.localizedCaseInsensitiveContains("password"))
        XCTAssertTrue(BackendError(kind: .invalidCredentials).localizedDescription.contains("password"))
        for k in [BackendError.Kind.offline, .duplicate, .notAllowed, .notFound, .invalidCredentials, .notConfigured, .other] {
            XCTAssertFalse(BackendError(kind: k).localizedDescription.contains(".."))
        }
    }
}

final class LocalCacheTests: XCTestCase {
    private func tempCache() -> LocalCache {
        LocalCache(directory: FileManager.default.temporaryDirectory.appendingPathComponent(UUID().uuidString))
    }

    func testCatalogRoundTrip() throws {
        let cache = tempCache()
        let saved = Date(timeIntervalSince1970: 1_800_000_000)
        try cache.write(Fixtures.catalog, to: LocalCache.catalogFile, savedAt: saved)
        let back = cache.read(CatalogRows.self, from: LocalCache.catalogFile)
        XCTAssertEqual(back?.value, Fixtures.catalog)
        XCTAssertEqual(back?.savedAt, saved)
    }

    func testHouseholdRoundTripAndSignOut() throws {
        let cache = tempCache()
        let rows = Fixtures.household(bookings: [Fixtures.booking("b1")])
        let file = LocalCache.householdFile(rows.userId)
        try cache.write(rows, to: file)
        XCTAssertEqual(cache.read(HouseholdRows.self, from: file)?.value, rows, "camelCase jsonb keys survive the snake_case round trip")
        try cache.write(Fixtures.catalog, to: LocalCache.catalogFile)
        cache.removeHouseholds()
        XCTAssertNil(cache.read(HouseholdRows.self, from: file))
        XCTAssertNotNil(cache.read(CatalogRows.self, from: LocalCache.catalogFile), "Sign-out keeps the public catalog")
    }

    func testMissingFileReadsNil() {
        XCTAssertNil(tempCache().read(CatalogRows.self, from: LocalCache.catalogFile))
    }

    @MainActor func testModelReadsCacheBeforeFirstFrame() throws {
        let cache = tempCache()
        try cache.write(Fixtures.catalog, to: LocalCache.catalogFile)
        let m = AppModel(cache: cache, client: nil)
        XCTAssertEqual(m.clubs.map(\.id), ["mesa-dobson"])
        XCTAssertFalse(m.sessions.isEmpty)
        XCTAssertNotNil(m.catalogSavedAt)
    }
}

@MainActor
final class BookingModelTests: XCTestCase {
    func testSpotsLeftIsCapacityMinusSessionCounts() {
        let m = Fixtures.model()
        let s = m.session("mesa-dobson~2026-10-28~0600~cc")!
        let free = s.capacity - s.baseBooked
        XCTAssertEqual(m.spotsLeft(s), free)
        m.applyCounts([SessionCountRow(sessionId: s.id, booked: 3, waitlisted: 0)])
        XCTAssertEqual(m.spotsLeft(s), free - 3)
    }

    func testCheckingUntilBookingsKnown() {
        let m = Fixtures.model()
        let s = m.session("mesa-dobson~2026-10-28~0600~cc")!
        XCTAssertEqual(m.state(for: s), .checking)
        m.applyHousehold(Fixtures.household(bookings: []), savedAt: Date())
        XCTAssertEqual(m.state(for: s), .book)
    }

    func testInFlightBlocksASecondBooking() {
        let m = Fixtures.model()
        m.applyHousehold(Fixtures.household(bookings: []), savedAt: Date())
        let s = m.session("mesa-dobson~2026-10-28~0600~cc")!
        m.inFlight.insert(s.id)
        XCTAssertEqual(m.state(for: s), .booking)
        guard case .rejected = m.book(s) else { return XCTFail("A second tap must not book twice") }
        XCTAssertTrue(m.bookings.isEmpty)
    }

    func testBookAndCancelUpdateSpots() {
        let m = Fixtures.model()
        m.applyHousehold(Fixtures.household(bookings: []), savedAt: Date())
        let s = m.session("mesa-dobson~2026-10-28~0600~cc")!
        guard case .ok(let b) = m.book(s) else { return XCTFail("Book failed") }
        XCTAssertEqual(b.memberID, "daniel")
        XCTAssertTrue(b.ref.hasPrefix("CP-"))
        XCTAssertEqual(m.spotsLeft(s), 5)
        XCTAssertEqual(m.state(for: s), .booked(late: false))
        let p = m.cancel(b.id)
        XCTAssertEqual(p?.late, false)
        XCTAssertEqual(m.spotsLeft(s), 6)
        XCTAssertEqual(m.booking(b.id)?.status, .cancelled)
    }

    func testRollbackRestoresBookings() {
        let m = Fixtures.model()
        m.applyHousehold(Fixtures.household(bookings: []), savedAt: Date())
        let point = m.rollbackPoint()
        let s = m.session("mesa-dobson~2026-10-28~0600~cc")!
        _ = m.book(s)
        XCTAssertEqual(m.bookings.count, 1)
        m.restore(point)
        XCTAssertTrue(m.bookings.isEmpty)
        XCTAssertEqual(m.spotsLeft(s), 6)
    }

    func testTrailheadIsHomeClubOnly() {
        let m = Fixtures.model()
        m.applyHousehold(Fixtures.household(bookings: []), savedAt: Date())
        XCTAssertEqual(m.member.plan, .trailhead)
        XCTAssertEqual(m.member.homeClubID, "mesa-dobson")
        XCTAssertTrue(m.reserveEligibleClubs(.lane).allSatisfy { $0.id == "mesa-dobson" })
    }
}
