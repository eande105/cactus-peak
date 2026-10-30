import SwiftUI

/// Confirmation for things that have no list to return to (a freeze). A small hierarchical check, a title, the facts.
/// Bookings do not use this: they confirm inline with a haptic and a toast, and the screen shows Booked.
struct SuccessPattern<Summary: View, Extra: View>: View {
    var headline: String
    var pill: String
    var pillSymbol: String = "checkmark"
    var primaryTitle: String?
    var primaryAction: () -> Void = {}
    var shareText: String?
    @ViewBuilder var summary: () -> Summary
    @ViewBuilder var extra: () -> Extra

    var body: some View {
        List {
            Section {
                VStack(alignment: .leading, spacing: 8) {
                    Label(headline, systemImage: "checkmark.circle").symbolRenderingMode(.hierarchical).font(.title2.bold()).foregroundStyle(Color.statusSuccess)
                    StatusPill(text: pill, symbol: pillSymbol, tone: .success)
                }
                .accessibilityAddTraits(.isHeader)
            }
            Section { summary() }
            if let primaryTitle {
                Section {
                    Button(action: primaryAction) { Label(primaryTitle, systemImage: "calendar.badge.plus") }
                    if let shareText { ShareLink(item: shareText) { Label("Share", systemImage: "square.and.arrow.up") } }
                }
            }
            Section { extra() }.listRowBackground(Color.clear)
        }
        .listStyle(.insetGrouped).scrollContentBackground(.hidden).background(Color.appBackground)
    }
}

/// Booking detail (from My bookings). A List of facts and actions.
struct SuccessView: View {
    @Environment(AppModel.self) private var model
    @Environment(AppRouter.self) private var router
    @Environment(\.openURL) private var openURL
    let bookingID: BookingID
    var fresh: Bool

    var body: some View {
        if let b = model.booking(bookingID) {
            let club = model.club(b.clubID)
            let session = b.sessionID.flatMap { model.session($0) }
            List {
                Section {
                    VStack(alignment: .leading, spacing: 6) {
                        Text(title(b)).font(.title2.bold()).accessibilityAddTraits(.isHeader)
                        statusPill(b)
                    }
                    LabeledContent("When", value: "\(b.start.cpFormat("EEE, MMM d")) · \(b.start.cpTime)–\(b.end.cpTime)")
                    LabeledContent("Where", value: "\(b.detail.isEmpty ? "" : "\(b.detail) · ")\(club.fullName)")
                    if let s = session { LabeledContent("Intensity") { HStack { RibMeter(value: s.intensity, tone: .category(s.category), size: .sm, peak: false); Text(Intensity.word(s.intensity)) } } }
                    if b.status == .waitlisted {
                        Text("We'll tell you if a spot opens. We can offer you one until \(b.start.addingTimeInterval(-3600).cpTime)").font(.subheadline)
                    } else if b.status == .booked {
                        Text(b.kind == .kids ? "Check in at \(club.shortName) by \(b.start.addingTimeInterval(15 * 60).cpTime) or we release the block." : "Free cancel until \(b.cancelCutoff().cpTime)").font(.subheadline)
                    }
                }
                Section {
                    if b.status == .booked {
                        row("Add to calendar", "calendar.badge.plus") { router.present(.calendar(b.id)) }
                        if b.kind == .court {
                            ShareLink(item: "\(b.title), \(b.start.cpLongDay) \(b.start.cpTime), \(club.fullName). Join me: https://app.cactuspeak.example/invite/court/\(b.id)") { Label("Invite a partner", systemImage: "person.badge.plus") }
                        }
                        if b.kind == .kids { row("Show pass", "qrcode") { router.present(.pass) } }
                    }
                    row("Get directions", "arrow.triangle.turn.up.right.diamond") { if let u = URL(string: "http://maps.apple.com/?daddr=\(club.latitude),\(club.longitude)") { openURL(u) } }
                    row("Call the club", "phone") { openURL(URL(string: "tel:\(club.phone.filter(\.isNumber))")!) }
                    row("Club details", "building.2") { router.push(.club(club.id)) }
                }
                if b.kind == .classSession && b.status == .booked {
                    @Bindable var model = model
                    Section { Toggle("Show on Lock Screen", isOn: $model.prefs.liveActivities) } footer: { Text("Appears 1 hour before class.") }
                }
                if b.status == .waitlisted { Section { Button("Leave waitlist", role: .destructive) { model.leaveWaitlist(b.id); router.goBack() } } }
                else if b.status == .booked { Section { Button("Cancel booking", role: .destructive) { router.requestCancel(b.id) } } }
            }
            .listStyle(.insetGrouped).scrollContentBackground(.hidden).background(Color.appBackground)
            .navigationTitle(b.status == .waitlisted ? "Waitlist" : "Booking").navigationBarTitleDisplayMode(.inline)
        } else {
            ContentUnavailableView("Booking not found", systemImage: "ticket", description: Text("It may have been cancelled."))
        }
    }

    private func title(_ b: Booking) -> String { b.kind == .kids ? "Kids club · \(b.detail)" : b.title }

    @ViewBuilder private func statusPill(_ b: Booking) -> some View {
        switch b.status {
        case .waitlisted: StatusPill(text: "On waitlist #\(b.waitlistPosition)", symbol: "clock", tone: .info)
        case .cancelled, .lateCancelled: StatusPill(text: "Cancelled", symbol: "xmark", tone: .neutral)
        case .attended: StatusPill(text: "Attended", symbol: "checkmark", tone: .success)
        default: StatusPill(text: "Booked", symbol: "checkmark", tone: .success)
        }
    }

    private func row(_ title: String, _ symbol: String, action: @escaping () -> Void) -> some View {
        Button(action: action) { Label(title, systemImage: symbol) }.foregroundStyle(Color.textPrimary)
    }
}
