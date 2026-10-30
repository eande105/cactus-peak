import Foundation
import Supabase

/// Reads and writes through PostgREST. Row level security limits every household read and write to the
/// signed-in member's own household, so these calls never name another household.
struct BackendAPI: Sendable {
    let client: SupabaseClient

    private func rows<T: Decodable>(_ table: String, _ type: T.Type, build: ((PostgrestFilterBuilder) -> PostgrestFilterBuilder)? = nil) async throws -> [T] {
        var q = client.from(table).select()
        if let build { q = build(q) }
        let data = try await q.execute().data
        return try RowCoding.decoder.decode([T].self, from: data)
    }

    // MARK: Catalog (anyone can read)

    func catalog() async throws -> CatalogRows {
        async let clubs = rows("clubs", ClubRow.self)
        async let categories = rows("categories", CategoryRow.self)
        async let coaches = rows("coaches", CoachRow.self)
        async let types = rows("class_types", ClassTypeRow.self)
        async let schedules = rows("class_schedules", ScheduleRow.self)
        async let plans = rows("plans", PlanRow.self)
        async let packs = rows("pt_packs", PTPackRow.self)
        async let faqs = rows("faqs", FAQRow.self) { $0.eq("audience", value: "member") }
        return try await CatalogRows(clubs: clubs, categories: categories, coaches: coaches, classTypes: types,
                                     schedules: schedules, plans: plans, ptPacks: packs, faqs: faqs)
    }

    /// Booked and waitlisted counts for every class session in the range, across all households.
    func sessionCounts(from: Date, to: Date) async throws -> [SessionCountRow] {
        let data = try await client.rpc("session_counts", params: ["p_from": RowCoding.iso(from), "p_to": RowCoding.iso(to)]).execute().data
        return try RowCoding.decoder.decode([SessionCountRow].self, from: data)
    }

    // MARK: Household (own household only)

    func household(userID: UUID) async throws -> HouseholdRows {
        let me = try await rows("members", MemberRow.self) { $0.eq("auth_user_id", value: userID.uuidString.lowercased()) }
        guard let member = me.first else { throw BackendError(kind: .notFound) }
        let hh = member.householdId
        async let households = rows("households", HouseholdRow.self) { $0.eq("id", value: hh) }
        async let members = rows("members", MemberRow.self) { $0.eq("household_id", value: hh) }
        async let bookings = rows("bookings", BookingDBRow.self) { $0.eq("household_id", value: hh) }
        async let strikes = rows("strikes", StrikeRow.self) { $0.eq("household_id", value: hh) }
        async let notices = rows("notices", NoticeRow.self) { $0.eq("household_id", value: hh) }
        async let guests = rows("guest_passes", GuestPassRow.self) { $0.eq("household_id", value: hh) }
        async let visits = rows("visits", VisitRow.self) { $0.eq("household_id", value: hh) }
        async let invoices = rows("invoices", InvoiceRow.self) { $0.eq("household_id", value: hh) }
        guard let household = try await households.first else { throw BackendError(kind: .notFound) }
        return try await HouseholdRows(userId: userID, memberId: member.id, household: household, members: members,
                                       bookings: bookings, strikes: strikes, notices: notices, guestPasses: guests,
                                       visits: visits, invoices: invoices)
    }

    // MARK: Writes

    func insert(_ table: String, _ values: [[String: AnyJSON]]) async throws {
        guard !values.isEmpty else { return }
        try await client.from(table).insert(values).execute()
    }

    func update(_ table: String, ids: [String], _ values: [String: AnyJSON]) async throws {
        guard !ids.isEmpty else { return }
        try await client.from(table).update(values).in("id", values: ids).execute()
    }

    func update(_ table: String, column: String, equals value: String, _ values: [String: AnyJSON]) async throws {
        try await client.from(table).update(values).eq(column, value: value).execute()
    }

    func delete(_ table: String, ids: [String]) async throws {
        guard !ids.isEmpty else { return }
        try await client.from(table).delete().in("id", values: ids).execute()
    }

    /// The household's shared demo clock. The server restarts it when it is missing or older than 3 hours.
    func demoClock() async throws -> DemoClockRow {
        let data = try await client.rpc("demo_clock").execute().data
        guard let row = try RowCoding.decoder.decode([DemoClockRow].self, from: data).first else {
            throw BackendError(kind: .notFound)
        }
        return row
    }

    func resetDemoHousehold() async throws {
        try await client.rpc("reset_demo_household").execute()
    }
}

extension AnyJSON {
    static func date(_ d: Date?) -> AnyJSON { d.map { .string(RowCoding.iso($0)) } ?? .null }
    static func text(_ s: String?) -> AnyJSON { s.map { .string($0) } ?? .null }
    static func int(_ i: Int?) -> AnyJSON { i.map { .integer($0) } ?? .null }
}
