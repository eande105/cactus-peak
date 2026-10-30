import Foundation
import CoreLocation

typealias ClubID = String
typealias SessionID = String
typealias BookingID = String
typealias CoachID = String
typealias PersonID = String

// MARK: - Plans

enum PlanTier: String, Codable, CaseIterable, Sendable, Hashable, Identifiable {
    case trailhead, ridge, summit
    var id: String { rawValue }
    var name: String { rawValue.capitalized }
    var price: Int { switch self { case .trailhead: 54; case .ridge: 79; case .summit: 129 } }
    var windowDays: Int { self == .summit ? 9 : 7 }
    var guestPassesPerMonth: Int { switch self { case .trailhead: 0; case .ridge: 1; case .summit: 4 } }
    var courtsIncluded: Bool { self != .trailhead }
    var recoveryIncluded: Bool { self == .summit }
    var allClubs: Bool { self != .trailhead }
    var tagline: String {
        switch self {
        case .trailhead: "One home club"
        case .ridge: "All 5 clubs"
        case .summit: "Everything in Ridge, plus recovery"
        }
    }
    var perks: [String] {
        switch self {
        case .trailhead: ["One home club", "Classes and pools at that club", "Book classes 7 days ahead"]
        case .ridge: ["All 5 clubs", "All classes", "Courts, 3 days ahead", "1 guest pass a month", "Book classes 7 days ahead"]
        case .summit: ["Everything in Ridge", "Recovery suite", "Book classes 9 days ahead", "4 guest passes a month", "Towel service", "1 PT intro session a quarter"]
        }
    }
}

// MARK: - Clubs

struct Club: Identifiable, Hashable, Sendable, Codable {
    let id: ClubID
    let slug: String
    let city: String
    let area: String
    let address: String
    let phone: String
    let zip: String
    let latitude: Double
    let longitude: Double
    let kind: String
    let personality: String
    let amenities: [Amenity]
    let lanes: Int
    let hasKids: Bool
    let pickleball: Int
    let tennis: Int
    let basketball: Int
    let hasRecovery: Bool
    let hasTherapyPool: Bool
    let studios: Int
    let distanceMiles: Double
    let photoCaptions: [String]
    let toneIndex: Int
    /// Usual busyness, 1 to 5, one value an hour from 4 a.m. to 9 p.m. (18 values). From `clubs.typical_weekday`.
    let typicalWeekday: [Int]
    let typicalWeekend: [Int]

    var fullName: String { "\(city) – \(area)" }
    /// A short fact line for headers. The personality line lives in the club copy, not the hero.
    var factLine: String {
        var p: [String] = []
        if hasPool { p.append("Lap pool") }
        if hasCourts { p.append("Courts") }
        if hasKids { p.append("Kids club") }
        if p.isEmpty { p = ["Strength floor", "Studios"] }
        if hasRecovery && p.count < 3 { p.append("Recovery") }
        return p.prefix(3).joined(separator: " · ")
    }
    var shortName: String { area }
    var hasPool: Bool { lanes > 0 }
    var hasCourts: Bool { pickleball + tennis + basketball > 0 }
    var coordinate: CLLocationCoordinate2D { .init(latitude: latitude, longitude: longitude) }

    struct Amenity: Hashable, Sendable, Identifiable, Codable {
        var label: String
        var symbol: String
        var id: String { label }
    }

    /// Court count for a sport, 0 if none.
    func courts(for sport: CourtSport) -> Int {
        switch sport { case .pickleball: pickleball; case .tennis: tennis; case .basketball: basketball }
    }
    var courtSports: [CourtSport] { CourtSport.allCases.filter { courts(for: $0) > 0 } }

    // Hours (same at all clubs)
    func opens(on date: Date) -> Int { AZ.cal.isDateInWeekend(date) ? 6 * 60 : 4 * 60 + 30 }
    func closes(on date: Date) -> Int { AZ.cal.isDateInWeekend(date) ? 20 * 60 : 22 * 60 }
    func isOpen(at date: Date) -> Bool {
        let c = AZ.cal.dateComponents([.hour, .minute], from: date)
        let m = (c.hour ?? 0) * 60 + (c.minute ?? 0)
        return m >= opens(on: date) && m < closes(on: date)
    }
    func openUntilText(on date: Date) -> String {
        AZ.cal.isDateInWeekend(date) ? "8 p.m." : "10 p.m."
    }
}

enum CourtSport: String, CaseIterable, Codable, Sendable, Hashable, Identifiable {
    case pickleball, tennis, basketball
    var id: String { rawValue }
    var title: String { rawValue.capitalized }
}

// MARK: - Coaches

struct Coach: Identifiable, Hashable, Sendable, Codable {
    /// PT openings: weekday (0 = Sunday) and minutes after midnight.
    struct Opening: Hashable, Sendable, Codable { var dow: Int; var minute: Int }
    let id: CoachID
    /// "marisol-vega". Bookings store the slug (`bookings.coach_slug`).
    let slug: String
    let fullName: String
    let shortName: String
    let credential: String
    let category: ClassCategory
    let clubs: [ClubID]
    let specialties: [String]
    let bio: String
    let trains: Bool
    let openTimes: [Opening]
    var initials: String {
        fullName.split(separator: " ").compactMap { $0.first }.map(String.init).joined()
    }
}

// MARK: - Classes

/// One dated class, made on the device from `class_schedules` and `class_types`.
/// `baseBooked` and `baseWaitlist` are members outside the demo households (the web app's baseline).
/// Demo households' bookings come from `session_counts` (see `AppModel.spotsLeft`).
struct ClassSession: Identifiable, Hashable, Sendable {
    let id: SessionID
    let classKey: String
    let name: String
    let category: ClassCategory
    let clubID: ClubID
    let room: String
    let start: Date
    let durationMin: Int
    let coachID: CoachID
    let intensity: Int
    let capacity: Int
    let baseBooked: Int
    let baseWaitlist: Int
    let firstTimers: Bool
    let teenOK: Bool
    let minAge: Int
    let summary: String
    let bring: [String]
    let spotNoun: String
    var end: Date { start.addingTimeInterval(Double(durationMin) * 60) }
}

// MARK: - Bookings

enum BookingKind: String, Codable, Sendable, Hashable { case classSession, court, lane, kids, pt }
enum BookingStatus: String, Codable, Sendable, Hashable {
    case booked, waitlisted, hold, attended, missed, lateCancelled, cancelled
}

struct Booking: Identifiable, Hashable, Sendable {
    var id: BookingID
    var kind: BookingKind
    var status: BookingStatus
    var sessionID: SessionID?
    var title: String
    var clubID: ClubID
    var category: ClassCategory
    var start: Date
    var end: Date
    var detail: String            // "Court 3", "Lane 4", "Mia + Eli", "with Dev P."
    var people: [String] = []
    var waitlistPosition: Int = 0
    var holdExpires: Date?
    var checkedIn: Bool = false
    var feedback: String?
    var guestShared: Bool = false
    var coachID: CoachID?
    var createdAt: Date = Date(timeIntervalSince1970: 0)
    var cancelReason: String?
    var resource: Int = 0          // court or lane number
    var sport: CourtSport?
    /// The member the booking is for (`bookings.member_id`).
    var memberID: String?
    /// Database rows behind this booking. Kids club keeps one row per child; the app shows them as one booking.
    var rowIDs: [String] = []
    var ref: String = ""

    var isActive: Bool { status == .booked || status == .waitlisted || status == .hold }
    func cancelCutoff() -> Date {
        kind == .pt ? start.addingTimeInterval(-24 * 3600) : start.addingTimeInterval(-2 * 3600)
    }
}

// MARK: - Booking state (the shared 12 ids)

enum RestrictReason: Hashable, Sendable {
    case notOpen(Date)
    case frozen
    case paused(Date)
    case pastDue
    case age(String)
    case teenApproval
    case plan(String)
    case offline

    var label: String {
        switch self {
        case .notOpen(let d): "Opens \(d.cpWeekdayShort) \(d.cpTime)"
        case .frozen: "Membership frozen"
        case .paused(let d): "Booking paused to \(d.cpDayMonth)"
        case .pastDue: "Booking paused"
        case .age(let s): s
        case .teenApproval: "Needs parent OK"
        case .plan(let s): s
        case .offline: "Offline"
        }
    }
    var note: String {
        switch self {
        case .notOpen: "Bookings open at 6:00 a.m."
        case .frozen: "Resume your membership to book."
        case .paused: "Kids club, check-in and cancelling still work."
        case .pastDue: "Update your card to book again."
        case .age: "This class has an age rule."
        case .teenApproval: "A parent has to approve this."
        case .plan: "See plans to unlock it."
        case .offline: "Reconnect to book."
        }
    }
}

enum BookingState: Hashable, Sendable {
    case book
    case booking
    /// The member's bookings have not loaded yet, so Book might be wrong.
    case checking
    case booked(late: Bool)
    case waitlist
    case waitlisted(Int)
    case hold(Date)
    case full(String)
    case dropIn(Int)
    case started
    case restricted(RestrictReason)
    case error

    var isBookable: Bool {
        switch self { case .book, .dropIn: true; default: false }
    }
}

// MARK: - People, family, billing

enum FamilyRole: String, Codable, Sendable, Hashable { case admin, adult, teen, child }

struct Person: Identifiable, Hashable, Sendable {
    var id: PersonID
    var first: String
    var last: String
    var role: FamilyRole
    var age: Int
    var invitePending: Bool = false
    var courtsAllowed: Bool = false
    var lanesAllowed: Bool = false
    var checkInAlerts: Bool = false
    var accessPaused: Bool = false
    var allergies: String = ""
    var name: String { "\(first) \(last)" }
    var roleLabel: String {
        switch role {
        case .admin: "Admin"
        case .adult: "Adult"
        case .teen: "Teen · \(age)"
        case .child: "Child · \(age)"
        }
    }
    var addOnPrice: Int { role == .adult ? 39 : (role == .admin ? 0 : 19) }
}

struct GuestPass: Identifiable, Hashable, Sendable {
    enum Status: String, Sendable { case shared = "Shared", waiver = "Waiver signed", used = "Used", expired = "Expired" }
    var id: String
    var guest: String
    var status: Status
    var expires: Date
}

struct InboxItem: Identifiable, Hashable, Sendable {
    enum Kind: String, Sendable { case waitlist, reminder, club, billing, family, coach, approval }
    var id: String
    var kind: Kind
    var title: String
    var body: String
    var time: Date
    var unread: Bool
    var route: String? = nil
}

struct Prefs: Equatable, Sendable {
    var notifWaitlist = true
    var notifReminders = true
    var reminderLead = 60
    var notifBookingChanges = true
    var notifClubNews = false
    var notifBilling = true
    var notifFamily = true
    var liveActivities = true
    var keepPassShortcut = false
    var brightnessBoost = true
    var haptics = true
    var shareUsage = false
    var interests: Set<ClassCategory> = [.cycle, .strength]
}

// MARK: - Busyness

struct BusynessReading: Hashable, Sendable {
    var level: Int           // 1...5
    var usual: Int
    var closed: Bool
    var stale: Bool
    var updatedAt: Date
    var opensText: String
    var word: String { BusynessReading.word(level) }
    static func word(_ l: Int) -> String {
        switch l { case 1: "Quiet"; case 2: "Light"; case 3: "Steady"; case 4: "Busy"; default: "Packed" }
    }
}
