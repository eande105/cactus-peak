import Foundation

// Database rows as PostgREST returns them. Keys arrive in snake_case and are decoded with
// `.convertFromSnakeCase`; nested jsonb keys are camelCase already and pass through unchanged.
// Only the columns the iOS app uses are listed. Extra columns are ignored.

// MARK: - Catalog

struct ClubRow: Codable, Hashable, Sendable {
    struct Pool: Codable, Hashable, Sendable { var label: String?; var lanes: Int?; var unit: String?; var outdoor: Bool?; var therapy: Bool? }
    struct Courts: Codable, Hashable, Sendable { var sport: String; var count: Int }
    var slug: String
    var sort: Int
    var name: String
    var shortName: String
    var city: String
    var neighborhood: String
    var address: String
    var zip: String
    var phone: String
    var clubType: String
    var typeLabel: String
    var personality: String
    var lat: Double
    var lng: Double
    var photoCaption: String?
    var amenities: [String]
    var pool: Pool?
    var courts: [Courts]
    var kidsClub: Bool
    var recovery: String
    var studios: [String]
    var studioCount: Int
    var typicalWeekday: [Int]
    var typicalWeekend: [Int]
    var demoMiles: Double?
}

struct CategoryRow: Codable, Hashable, Sendable {
    var id: String
    var sort: Int
    var name: String
}

struct CoachRow: Codable, Hashable, Sendable {
    struct OpenTime: Codable, Hashable, Sendable { var dow: Int; var time: String }
    var id: String
    var slug: String
    var name: String
    var firstName: String
    var discipline: String
    var credential: String
    var clubs: [String]
    var teachesClasses: Bool
    var personalTrainer: Bool
    var specialties: [String]
    var teaches: [String]
    var about: String
    var openTimes: [OpenTime]
}

struct ClassTypeRow: Codable, Hashable, Sendable {
    var key: String
    var slug: String
    var sort: Int
    var name: String
    var categoryId: String
    var duration: Int
    var intensity: Int
    var capacity: Int
    var unit: String
    var firstTimerOk: Bool
    var teenOk: Bool
    var minAge: Int
    var bookable: Bool
    var about: String
    var blurb: String
    var bring: [String]
    var clubSlugs: [String]?
}

struct ScheduleRow: Codable, Hashable, Sendable {
    var id: Int
    var clubSlug: String
    var classKey: String
    /// "05:30:00"
    var startTime: String
    /// 0 = Sunday
    var days: [Int]
    var studio: String
    var coachId: String
    var intensity: Int?
}

struct PlanRow: Codable, Hashable, Sendable {
    var id: String
    var sort: Int
    var name: String
    var price: Double
    var bookingWindowDays: Int
    var guestPasses: Int
}

struct PTPackRow: Codable, Hashable, Sendable {
    var sessions: Int
    var price: Double
}

struct FAQRow: Codable, Hashable, Sendable {
    var id: String
    var audience: String
    var sort: Int
    var question: String
    var answer: String
}

/// Everything public the app shows, saved to disk as one file.
struct CatalogRows: Codable, Hashable, Sendable {
    var clubs: [ClubRow] = []
    var categories: [CategoryRow] = []
    var coaches: [CoachRow] = []
    var classTypes: [ClassTypeRow] = []
    var schedules: [ScheduleRow] = []
    var plans: [PlanRow] = []
    var ptPacks: [PTPackRow] = []
    var faqs: [FAQRow] = []
    var isEmpty: Bool { clubs.isEmpty || schedules.isEmpty }
}

/// `demo_clock()`: one demo clock per household, shared with the web app.
/// Demo now = Tue Oct 27, 2026, 5:40 a.m. + (real now − startedAt) + skewMs.
struct DemoClockRow: Codable, Hashable, Sendable {
    var startedAt: Date
    var skewMs: Int
    var serverNow: Date
}

struct SessionCountRow: Codable, Hashable, Sendable {
    var sessionId: String
    var booked: Int
    var waitlisted: Int
}

// MARK: - Household

struct HouseholdRow: Codable, Hashable, Sendable {
    struct FreezeWindow: Codable, Hashable, Sendable { var start: Double; var months: Int; var end: Double; var resume: Double? }
    struct PendingPlan: Codable, Hashable, Sendable { var plan: String; var on: Double }
    struct PTPack: Codable, Hashable, Sendable { var total: Int; var used: Int; var expiresOn: Double?; var coachSlug: String? }
    var id: String
    var primaryMemberId: String
    var planId: String
    var billingDay: Int
    var memberSince: Date
    var status: String
    var freezeWindow: FreezeWindow?
    var cancelOn: Date?
    var pendingPlan: PendingPlan?
    var paymentFailedAt: Date?
    var ptPack: PTPack?
    var ptIntroLeft: Int
    var homeClubChangedAt: Date?
}

struct MemberRow: Codable, Hashable, Sendable {
    struct Permissions: Codable, Hashable, Sendable { var classes: Bool?; var courts: Bool?; var lanes: Bool?; var coachMessages: Bool? }
    struct Prefs: Codable, Hashable, Sendable { var weeklyTarget: Int?; var interests: [String]?; var reminderMin: Int?; var onboardingStep: Int? }
    var id: String
    var householdId: String
    var authUserId: UUID?
    var role: String
    var firstName: String
    var lastName: String
    var dob: Date
    var email: String
    var memberNumber: String
    var homeClub: String
    var parentId: String?
    var allergyNotes: String?
    var status: String
    var permissions: Permissions?
    var pausedUntil: Date?
    var streakWeeks: Int
    var lifetimeVisits: Int
    var longestStreak: Int
    var prefs: Prefs?
}

struct BookingDBRow: Codable, Hashable, Sendable {
    var id: String
    var householdId: String
    var kind: String
    var memberId: String
    var ownerId: String
    var status: String
    var ref: String
    var clubSlug: String
    var startsAt: Date
    var endsAt: Date
    var title: String
    var categoryId: String
    var place: String
    var sessionId: String?
    var spot: String?
    var waitlistPosition: Int?
    var holdExpiresAt: Date?
    var resource: String?
    var sport: String?
    var children: [String]?
    var coachSlug: String?
    var feedbackDone: Bool
    var cancelledAt: Date?
    var createdAt: Date
}

struct StrikeRow: Codable, Hashable, Sendable {
    var id: String
    var memberId: String
    var at: Date
    var bookingId: String?
    var title: String
}

struct NoticeRow: Codable, Hashable, Sendable {
    var id: String
    var memberId: String
    var type: String
    var title: String
    var body: String
    var at: Date
    var readAt: Date?
    var needsAction: Bool
    var bookingId: String?
    var filter: String
}

struct GuestPassRow: Codable, Hashable, Sendable {
    var id: String
    var guestName: String
    var contact: String
    var clubSlug: String
    var visitDate: Date
    var validUntil: Date
    var status: String
    var bought: Bool
    var sentAt: Date
}

struct VisitRow: Codable, Hashable, Sendable {
    var memberId: String
    var clubSlug: String
    var at: Date
}

struct InvoiceRow: Codable, Hashable, Sendable {
    var id: String
    var issuedAt: Date
    var description: String
    var kind: String
    var amount: Double
    var status: String
}

/// The signed-in member's household as the database holds it. Saved to disk per user, removed on sign-out.
struct HouseholdRows: Codable, Hashable, Sendable {
    var userId: UUID
    var memberId: String
    var household: HouseholdRow
    var members: [MemberRow]
    var bookings: [BookingDBRow]
    var strikes: [StrikeRow]
    var notices: [NoticeRow]
    var guestPasses: [GuestPassRow]
    var visits: [VisitRow]
    var invoices: [InvoiceRow]
}

// MARK: - Coding

enum RowCoding {
    /// Postgres sends timestamptz as "2026-10-27T13:00:00+00:00" (sometimes with fractions) and date as "2026-10-27".
    static func parseDate(_ s: String) -> Date? {
        if s.count == 10 {
            let p = s.split(separator: "-").compactMap { Int($0) }
            guard p.count == 3 else { return nil }
            return AZ.date(p[0], p[1], p[2])
        }
        let iso = ISO8601DateFormatter()
        iso.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
        if let d = iso.date(from: s) { return d }
        iso.formatOptions = [.withInternetDateTime]
        if let d = iso.date(from: s) { return d }
        // "2026-10-27 13:00:00+00" (psql style), used by cached rows written by older builds or tests.
        let f = DateFormatter()
        f.locale = Locale(identifier: "en_US_POSIX")
        for format in ["yyyy-MM-dd HH:mm:ssXXXXX", "yyyy-MM-dd HH:mm:ssX", "yyyy-MM-dd'T'HH:mm:ssX"] {
            f.dateFormat = format
            if let d = f.date(from: s) { return d }
        }
        return nil
    }

    static func iso(_ d: Date) -> String {
        let f = ISO8601DateFormatter()
        f.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
        return f.string(from: d)
    }

    /// Decoder for PostgREST responses.
    static var decoder: JSONDecoder {
        let d = JSONDecoder()
        d.keyDecodingStrategy = .convertFromSnakeCase
        d.dateDecodingStrategy = .custom { decoder in
            let c = try decoder.singleValueContainer()
            if let n = try? c.decode(Double.self) { return Date(timeIntervalSince1970: n > 1e11 ? n / 1000 : n) }
            let s = try c.decode(String.self)
            guard let date = parseDate(s) else {
                throw DecodingError.dataCorruptedError(in: c, debugDescription: "Unknown date \(s)")
            }
            return date
        }
        return d
    }

    /// Encoder and decoder for the on-device cache: the same keys, dates as seconds.
    static var cacheEncoder: JSONEncoder {
        let e = JSONEncoder()
        e.keyEncodingStrategy = .convertToSnakeCase
        e.dateEncodingStrategy = .secondsSince1970
        return e
    }
    static var cacheDecoder: JSONDecoder {
        let d = decoder
        return d
    }
}
