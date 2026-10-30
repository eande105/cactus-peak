import AppIntents
import SwiftUI

// MARK: - Enums and entities (type names, raw values and phrases are public contracts: never rename after release)

enum UsualSlot: String, AppEnum {
    case fiveAM, sixAM, sevenAM, noon, fivePM, sixPM
    static let typeDisplayRepresentation: TypeDisplayRepresentation = "Time"
    static let caseDisplayRepresentations: [UsualSlot: DisplayRepresentation] = [
        .fiveAM: "5 a.m.", .sixAM: "6 a.m.", .sevenAM: "7 a.m.", .noon: "noon", .fivePM: "5 p.m.", .sixPM: "6 p.m.",
    ]
    var hour: Int { switch self { case .fiveAM: 5; case .sixAM: 6; case .sevenAM: 7; case .noon: 12; case .fivePM: 17; case .sixPM: 18 } }
}

enum ReserveDuration: String, AppEnum {
    case sixtyMinutes, ninetyMinutes
    static let typeDisplayRepresentation: TypeDisplayRepresentation = "Duration"
    static let caseDisplayRepresentations: [ReserveDuration: DisplayRepresentation] = [.sixtyMinutes: "60 minutes", .ninetyMinutes: "90 minutes"]
    var minutes: Int { self == .sixtyMinutes ? 60 : 90 }
}

struct ClubEntity: AppEntity {
    static let typeDisplayRepresentation: TypeDisplayRepresentation = "Club"
    static let defaultQuery = ClubQuery()
    var id: String
    var name: String
    var displayRepresentation: DisplayRepresentation { DisplayRepresentation(title: "\(name)") }
}

struct ClubQuery: EnumerableEntityQuery {
    func allEntities() async throws -> [ClubEntity] {
        await MainActor.run { AppModel.shared.clubs.map { ClubEntity(id: $0.id, name: $0.fullName) } }
    }
    func entities(for identifiers: [String]) async throws -> [ClubEntity] {
        await MainActor.run { AppModel.shared.clubs.filter { identifiers.contains($0.id) }.map { ClubEntity(id: $0.id, name: $0.fullName) } }
    }
}

struct ClassSessionEntity: AppEntity {
    static let typeDisplayRepresentation: TypeDisplayRepresentation = "Class"
    static let defaultQuery = ClassSessionQuery()
    var id: String
    var name: String
    var when: String
    var displayRepresentation: DisplayRepresentation { DisplayRepresentation(title: "\(name)", subtitle: "\(when)") }
}

struct ClassSessionQuery: EntityStringQuery {
    @MainActor private func make(_ s: ClassSession) -> ClassSessionEntity {
        ClassSessionEntity(id: s.id, name: s.name, when: "\(s.start.cpWeekdayShort) \(s.start.cpTime) · \(AppModel.shared.club(s.clubID).shortName)")
    }
    func entities(for identifiers: [String]) async throws -> [ClassSessionEntity] {
        await MainActor.run { identifiers.compactMap { AppModel.shared.session($0) }.map(make) }
    }
    func entities(matching string: String) async throws -> [ClassSessionEntity] {
        await MainActor.run {
            let m = AppModel.shared
            return m.sessions.filter { $0.start > m.now && $0.clubID == m.member.homeClubID && $0.name.localizedCaseInsensitiveContains(string) }.prefix(10).map(make)
        }
    }
    func suggestedEntities() async throws -> [ClassSessionEntity] {
        await MainActor.run {
            let m = AppModel.shared
            return m.sessions.filter { $0.start > m.now && $0.clubID == m.member.homeClubID }.prefix(10).map(make)
        }
    }
}

struct BookingEntity: AppEntity {
    static let typeDisplayRepresentation: TypeDisplayRepresentation = "Booking"
    static let defaultQuery = BookingQuery()
    var id: String
    var title: String
    var when: String
    var displayRepresentation: DisplayRepresentation { DisplayRepresentation(title: "\(title)", subtitle: "\(when)") }
}

struct BookingQuery: EntityQuery {
    @MainActor private func make(_ b: Booking) -> BookingEntity { BookingEntity(id: b.id, title: b.title, when: "\(b.start.cpWeekdayShort) \(b.start.cpTime)") }
    func entities(for identifiers: [String]) async throws -> [BookingEntity] {
        await MainActor.run { identifiers.compactMap { AppModel.shared.booking($0) }.map(make) }
    }
    func suggestedEntities() async throws -> [BookingEntity] {
        await MainActor.run { AppModel.shared.upcomingBookings.filter { $0.status == .booked }.map(make) }
    }
}

enum CactusIntentError: Error, CustomLocalizedStringResourceConvertible {
    case nothing(String)
    var localizedStringResource: LocalizedStringResource {
        switch self { case .nothing(let m): "\(m)" }
    }
}

// MARK: - Intents

struct ShowPassIntent: AppIntent {
    static let title: LocalizedStringResource = "Show my pass"
    static let description = IntentDescription("Opens your check-in pass.")
    static var supportedModes: IntentModes { .foreground(.immediate) }
    func perform() async throws -> some IntentResult {
        await MainActor.run { AppRouter.shared.selection = .today; AppRouter.shared.present(.pass) }
        return .result()
    }
}

struct BookUsualClassIntent: AppIntent {
    static let title: LocalizedStringResource = "Book my usual class"
    static let description = IntentDescription("Books the class you take most often at that time.")
    static var supportedModes: IntentModes { [.background, .foreground(.dynamic)] }
    @Parameter(title: "Time", default: .sixAM) var slot: UsualSlot
    static var parameterSummary: some ParameterSummary { Summary("Book my usual \(\.$slot) class") }

    func perform() async throws -> some IntentResult & ProvidesDialog {
        enum Found { case booked(String), full(String), paused(String), none }
        let found: Found = await MainActor.run {
            let m = AppModel.shared
            if let r = m.bookingBlock { return .paused(r.label) }
            guard let s = m.usualSession(hour: slot.hour) else { return .none }
            switch m.state(for: s) {
            case .book, .dropIn:
                if case .ok(let b) = m.book(s, force: true) {
                    return .booked("Booked \(b.title), \(b.start.cpFormat("EEEE")) \(b.start.cpTimeShort) at \(m.club(b.clubID).fullName). Free cancel until \(b.cancelCutoff().cpTimeShort)")
                }
                return .none
            case .waitlist: return .full("\(s.name) is full.")
            case .booked: return .booked("You already have \(s.name), \(s.start.cpFormat("EEEE")) \(s.start.cpTimeShort)")
            default: return .none
            }
        }
        // The booking is written to the server in the background. Report what the server accepted.
        if case .booked = found, await !AppModel.shared.writesSucceeded() {
            throw CactusIntentError.nothing("I couldn't save that booking. Open Cactus Peak and try again.")
        }
        switch found {
        case .booked(let t): return .result(dialog: "\(t)")
        case .paused(let t): throw CactusIntentError.nothing("Booking is paused. \(t).")
        case .none: throw CactusIntentError.nothing("I couldn't find a class at that time. Open Cactus Peak to pick one.")
        case .full(let t):
            let choice = try await requestChoice(between: [IntentChoiceOption(title: "Join waitlist"), .cancel], dialog: "\(t) Late cancels count as strikes. Join the waitlist?")
            if choice.title == IntentChoiceOption(title: "Join waitlist").title {
                let ok = await MainActor.run { () -> Bool in
                    let m = AppModel.shared
                    guard let s = m.usualSession(hour: slot.hour) else { return false }
                    return m.joinWaitlist(s) != nil
                }
                return .result(dialog: ok ? "You're on the waitlist." : "I couldn't join the waitlist.")
            }
            return .result(dialog: "OK. I left it.")
        }
    }
}

struct NextClassIntent: AppIntent {
    static let title: LocalizedStringResource = "Next class"
    static var supportedModes: IntentModes { .background }
    func perform() async throws -> some IntentResult & ProvidesDialog {
        let text: String? = await MainActor.run {
            let m = AppModel.shared
            guard let b = m.nextBooking else { return nil }
            return "Your next class is \(b.title), \(b.start.cpFormat("EEEE")) at \(b.start.cpTimeShort), \(m.club(b.clubID).fullName)."
        }
        guard let text else { return .result(dialog: "You have nothing booked.") }
        return .result(dialog: "\(text)")
    }
}

struct ClubBusynessIntent: AppIntent {
    static let title: LocalizedStringResource = "Club busyness"
    static var supportedModes: IntentModes { .background }
    @Parameter(title: "Club") var club: ClubEntity?
    func perform() async throws -> some IntentResult & ProvidesDialog {
        let text: String = await MainActor.run {
            let m = AppModel.shared
            let c = club.map { m.club($0.id) } ?? m.homeClub
            let r = m.busyness(c)
            if r.closed { return "\(c.fullName) is closed. It opens at \(r.opensText)" }
            return "\(c.fullName) is \(r.word.lowercased()) right now, \(r.level) of 5."
        }
        return .result(dialog: "\(text)")
    }
}

struct CancelNextBookingIntent: AppIntent {
    static let title: LocalizedStringResource = "Cancel next class"
    static var supportedModes: IntentModes { .background }
    @Parameter(title: "Booking") var booking: BookingEntity?
    func perform() async throws -> some IntentResult & ProvidesDialog {
        let info: (id: String, title: String, late: Bool)? = await MainActor.run {
            let m = AppModel.shared
            let b = booking.flatMap { m.booking($0.id) } ?? m.nextBooking
            return b.map { ($0.id, $0.title, m.cancelPreview($0).countsStrike) }
        }
        guard let info else { throw CactusIntentError.nothing("You have nothing booked.") }
        try await requestConfirmation(actionName: .continue, dialog: info.late ? "Cancel \(info.title)? That counts as a late cancel and a strike." : "Cancel \(info.title)?")
        await MainActor.run { _ = AppModel.shared.cancel(info.id) }
        guard await AppModel.shared.writesSucceeded() else { throw CactusIntentError.nothing("I couldn't cancel \(info.title). Open Cactus Peak and try again.") }
        return .result(dialog: "Cancelled \(info.title).")
    }
}

struct ReserveCourtIntent: AppIntent {
    static let title: LocalizedStringResource = "Reserve a court"
    static var supportedModes: IntentModes { [.background, .foreground(.dynamic)] }
    @Parameter(title: "Club") var club: ClubEntity
    @Parameter(title: "Start") var start: Date
    @Parameter(title: "Duration", default: .ninetyMinutes) var duration: ReserveDuration
    func perform() async throws -> some IntentResult & ProvidesDialog {
        let r: String = await MainActor.run {
            let m = AppModel.shared
            let req = ReserveRequest(kind: .court, clubID: club.id, start: start, sport: .pickleball, duration: duration.minutes)
            m.beginHold(req, label: "court")
            switch m.reserveCourt(req, court: nil) {
            case .ok(let b): return "\(b.title) is yours, \(b.start.cpFormat("EEEE")) \(b.start.cpTimeShort)"
            case .failed(let msg): m.endHold(); return msg
            }
        }
        guard await AppModel.shared.writesSucceeded() else { throw CactusIntentError.nothing("I couldn't save that court. Open Cactus Peak and try again.") }
        return .result(dialog: "\(r)")
    }
}

struct JoinWaitlistIntent: AppIntent {
    static let title: LocalizedStringResource = "Join waitlist"
    static var supportedModes: IntentModes { .background }
    @Parameter(title: "Class") var session: ClassSessionEntity
    func perform() async throws -> some IntentResult & ProvidesDialog {
        try await requestConfirmation(actionName: .continue, dialog: "Late cancels count as strikes. Join the waitlist?")
        var ok: Bool = await MainActor.run { AppModel.shared.session(session.id).flatMap { AppModel.shared.joinWaitlist($0) } != nil }
        if ok { ok = await AppModel.shared.writesSucceeded() }
        return .result(dialog: ok ? "You're on the waitlist for \(session.name)." : "I couldn't join that waitlist.")
    }
}

struct TrackNextClassIntent: AppIntent {
    static let title: LocalizedStringResource = "Track next class"
    static var supportedModes: IntentModes { .background }
    func perform() async throws -> some IntentResult & ProvidesDialog {
        await MainActor.run { AppModel.shared.prefs.liveActivities = true; LiveActivityManager.shared.sync(model: AppModel.shared) }
        return .result(dialog: "Tracking your next class on the Lock Screen.")
    }
}

struct AddNextClassToCalendarIntent: AppIntent {
    static let title: LocalizedStringResource = "Add to calendar"
    static var supportedModes: IntentModes { .foreground(.immediate) }
    func perform() async throws -> some IntentResult {
        await MainActor.run {
            if let b = AppModel.shared.nextBooking { AppRouter.shared.present(.calendar(b.id)) }
        }
        return .result()
    }
}

/// Used by the notification action "Confirm spot". One code path for notifications, Siri and the UI.
struct ConfirmWaitlistSpotIntent: AppIntent {
    static let title: LocalizedStringResource = "Confirm waitlist spot"
    static var supportedModes: IntentModes { .background }
    func perform() async throws -> some IntentResult & ProvidesDialog {
        var ok: Bool = await MainActor.run { if let h = AppModel.shared.activeHold { return AppModel.shared.confirmHold(h.id) } else { return false } }
        if ok { ok = await AppModel.shared.writesSucceeded() }
        return .result(dialog: ok ? "You're in." : "The hold ended.")
    }
}

struct CactusPeakShortcuts: AppShortcutsProvider {
    static var appShortcuts: [AppShortcut] {
        AppShortcut(intent: ShowPassIntent(), phrases: ["Show my pass in \(.applicationName)", "Open my check-in pass in \(.applicationName)"],
                    shortTitle: "Show pass", systemImageName: "qrcode")
        AppShortcut(intent: NextClassIntent(), phrases: ["What's my next class in \(.applicationName)", "When is my next class in \(.applicationName)"],
                    shortTitle: "Next class", systemImageName: "calendar")
        AppShortcut(intent: BookUsualClassIntent(), phrases: ["Book my usual \(\.$slot) class in \(.applicationName)", "Book my usual class in \(.applicationName)"],
                    shortTitle: "Book usual class", systemImageName: "calendar.badge.plus")
        AppShortcut(intent: ClubBusynessIntent(), phrases: ["How busy is my club in \(.applicationName)"],
                    shortTitle: "Club busyness", systemImageName: "chart.bar")
        AppShortcut(intent: CancelNextBookingIntent(), phrases: ["Cancel my next class in \(.applicationName)"],
                    shortTitle: "Cancel next class", systemImageName: "xmark.circle")
        AppShortcut(intent: TrackNextClassIntent(), phrases: ["Track my next class in \(.applicationName)"],
                    shortTitle: "Track next class", systemImageName: "livephoto")
        AppShortcut(intent: AddNextClassToCalendarIntent(), phrases: ["Add my next class to my calendar in \(.applicationName)"],
                    shortTitle: "Add to calendar", systemImageName: "calendar.badge.plus")
    }
}

extension AppModel {
    /// The class the member takes most often around this hour, at the home club, next time it runs.
    func usualSession(hour: Int) -> ClassSession? {
        let counts = Dictionary(grouping: bookings.filter { $0.status == .attended }, by: \.title).mapValues(\.count)
        let preferred = counts.sorted { $0.value > $1.value }.map(\.key)
        let candidates = sessions.filter { $0.clubID == member.homeClubID && $0.start > now && AZ.cal.component(.hour, from: $0.start) == hour && visible($0) }
        for name in preferred { if let s = candidates.first(where: { $0.name == name }) { return s } }
        return candidates.first
    }
}
