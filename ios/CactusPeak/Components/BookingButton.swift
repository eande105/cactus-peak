import SwiftUI

/// Every state of the shared BookingStateButton, drawn with system button styles.
/// Row size: `.bordered` / `.borderedProminent` capsules (regular control size, 44 pt hit area).
/// Large size: `.glassProminent` for the one primary action and `.glass` for the rest.
struct BookingStateButton: View {
    enum Size { case row, large }
    var state: BookingState
    var size: Size = .row
    var action: () -> Void
    var onLeave: (() -> Void)? = nil
    var onRelease: (() -> Void)? = nil

    @Environment(\.dynamicTypeSize) private var dts
    private var large: Bool { size == .large }

    var body: some View {
        Group {
            switch state {
            case .book, .dropIn:
                prominent { Text("Book") }
            case .booking:
                prominent { HStack(spacing: 8) { ProgressView(); Text("Booking…") } }.disabled(true)
            case .checking:
                plain { ProgressView().accessibilityLabel("Checking your bookings") }.disabled(true)
            case .booked(let late):
                plain {
                    HStack(spacing: 6) {
                        Image(systemName: "checkmark.circle.fill").foregroundStyle(Color.statusSuccess)
                        Text("Booked")
                        if late { Image(systemName: "exclamationmark.triangle.fill").foregroundStyle(Color.statusWarning).accessibilityLabel("Late cancel applies") }
                    }
                }
            case .waitlist:
                plain { Text("Join waitlist") }
            case .waitlisted(let n):
                Menu {
                    Button("Leave waitlist", role: .destructive) { onLeave?() }
                } label: {
                    HStack(spacing: 6) { Text("On waitlist #\(n)"); Image(systemName: "chevron.down").imageScale(.small) }
                }
                .buttonStyle(.bordered).buttonBorderShape(.capsule).tint(Color.brandSecondary).controlSize(large ? .large : .regular)
            case .hold(let until):
                VStack(spacing: 4) {
                    prominent {
                        // Text(timerInterval:) counts down without a view refresh.
                        HStack(spacing: 4) {
                            Text("Confirm spot ·")
                            Text(timerInterval: Date.now...max(Date.now.addingTimeInterval(1), until.addingTimeInterval(Date().timeIntervalSince(AppModel.shared.now))), countsDown: true, showsHours: false)
                                .monospacedDigit()
                        }
                    }
                    if let onRelease { Button("Release spot", action: onRelease).linkAction().font(.footnote) }
                }
            case .full(let reason):
                VStack(alignment: .trailing, spacing: 2) {
                    plain { Text("Full") }.disabled(true)
                    if large { Text(reason).font(.footnote).foregroundStyle(Color.textMuted) }
                }
            case .started:
                plain { Text("Started") }.disabled(true)
            case .restricted(let r):
                VStack(alignment: .trailing, spacing: 2) {
                    plain { Text(r.label).multilineTextAlignment(.center) }.opacity(0.9)
                    if large { Text(r.note).font(.footnote).foregroundStyle(Color.textMuted).multilineTextAlignment(.trailing) }
                }
            case .error:
                plain { Text("Try again") }.tint(Color.statusDanger)
            }
        }
        .fixedSize(horizontal: size == .row && !dts.isAccessibilitySize, vertical: false)
    }

    @ViewBuilder private func prominent<L: View>(@ViewBuilder _ label: () -> L) -> some View {
        if large {
            Button(action: action) { label().foregroundStyle(Color.brandOnAccent).frame(maxWidth: .infinity) }
                .buttonStyle(.glassProminent).tint(Color.brandAccent).controlSize(.large)
        } else {
            // In a list a solid copper pill on every row is too loud. Rows get a tinted fill with Link-colour text.
            Button(action: action) { label().foregroundStyle(Color.linkText).fontWeight(.semibold) }
                .buttonStyle(.bordered).buttonBorderShape(.capsule).tint(Color.brandAccent).controlSize(.regular)
        }
    }

    @ViewBuilder private func plain<L: View>(@ViewBuilder _ label: () -> L) -> some View {
        if large {
            Button(action: action) { label().frame(maxWidth: .infinity) }.buttonStyle(.glass).controlSize(.large)
        } else {
            Button(action: action) { label() }.buttonStyle(.bordered).buttonBorderShape(.capsule).tint(Color.brandSecondary).controlSize(.regular)
        }
    }
}
