import SwiftUI

// MARK: - Card, flow layout, small helpers

extension View {
    /// Card = Surface fill, 14 pt continuous corner, 1 pt hairline, no shadow. Used only for real objects the member picks.
    func cardStyle(padding: CGFloat = 16, radius: CGFloat = 14, fill: Color = .surface) -> some View {
        self.padding(padding)
            .background(fill, in: RoundedRectangle(cornerRadius: radius, style: .continuous))
            .overlay(RoundedRectangle(cornerRadius: radius, style: .continuous).strokeBorder(Color.hairline, lineWidth: 1))
    }
    func nightCard(padding: CGFloat = 16, radius: CGFloat = 14) -> some View {
        self.padding(padding).background(Color.nightSurface, in: RoundedRectangle(cornerRadius: radius, style: .continuous))
    }
    func screenBackground() -> some View { self.background(Color.appBackground.ignoresSafeArea()) }
    func sectionHeader() -> some View { self.font(.title3.bold()).foregroundStyle(Color.textPrimary).accessibilityAddTraits(.isHeader) }
}

/// Wraps children onto rows. Measure and place use the same width rule, so a row never reports a different height
/// than it draws. (The old version measured with an unbounded width when the parent proposed none, then placed with the
/// real width. That left a tall empty gap in list rows.)
struct FlowLayout: Layout {
    var spacing: CGFloat = 8

    private func rows(_ subviews: Subviews, width: CGFloat) -> (sizes: [CGSize], origins: [CGPoint], total: CGSize) {
        var sizes: [CGSize] = [], origins: [CGPoint] = []
        var x: CGFloat = 0, y: CGFloat = 0, rowH: CGFloat = 0, maxX: CGFloat = 0
        for s in subviews {
            var sz = s.sizeThatFits(ProposedViewSize(width: width, height: nil))
            sz.width = min(sz.width, width)
            if x > 0, x + sz.width > width { x = 0; y += rowH + spacing; rowH = 0 }
            sizes.append(sz); origins.append(CGPoint(x: x, y: y))
            x += sz.width + spacing; rowH = max(rowH, sz.height); maxX = max(maxX, x - spacing)
        }
        return (sizes, origins, CGSize(width: maxX, height: y + rowH))
    }
    func sizeThatFits(proposal: ProposedViewSize, subviews: Subviews, cache: inout ()) -> CGSize {
        let w = proposal.width.flatMap { $0.isFinite ? $0 : nil } ?? 10_000
        return rows(subviews, width: w).total
    }
    func placeSubviews(in bounds: CGRect, proposal: ProposedViewSize, subviews: Subviews, cache: inout ()) {
        let r = rows(subviews, width: bounds.width)
        for (i, s) in subviews.enumerated() {
            s.place(at: CGPoint(x: bounds.minX + r.origins[i].x, y: bounds.minY + r.origins[i].y), proposal: ProposedViewSize(r.sizes[i]))
        }
    }
}

// MARK: - System button styles with the brand tint
// Primary = prominent capsule in Copper. The label is forced to BrandOnAccent: white on Arizona Copper (4.95:1)
// and Night on Dawn Copper in dark mode (6.22:1). Secondary = bordered capsule. Links = borderless with the Link colour.

extension View {
    func primaryAction(full: Bool = false) -> some View {
        self.buttonStyle(.borderedProminent).buttonBorderShape(.capsule).controlSize(.large)
            .tint(Color.brandAccent).foregroundStyle(Color.brandOnAccent)
            .frame(maxWidth: full ? .infinity : nil)
    }
    func secondaryAction(full: Bool = false, destructive: Bool = false) -> some View {
        self.buttonStyle(.bordered).buttonBorderShape(.capsule).controlSize(.large)
            .tint(destructive ? Color.statusDanger : Color.brandSecondary)
            .frame(maxWidth: full ? .infinity : nil)
    }
    func linkAction(danger: Bool = false) -> some View {
        self.buttonStyle(.borderless).tint(danger ? Color.statusDanger : Color.linkText).frame(minHeight: 44)
    }
}

struct StatusPill: View {
    enum Tone { case success, warning, danger, neutral, info }
    var text: String
    var symbol: String
    var tone: Tone = .neutral
    var body: some View {
        let (fg, bg): (Color, Color) = switch tone {
        case .success: (.statusSuccess, .statusSuccessSubtle)
        case .warning: (.statusWarning, .statusWarningSubtle)
        case .danger: (.statusDanger, .statusDangerSubtle)
        case .neutral: (.textPrimary, .surfaceMuted)
        case .info: (.textPrimary, .surfaceMuted)
        }
        Label(text, systemImage: symbol)
            .font(.footnote.weight(.semibold))
            .foregroundStyle(fg)
            .padding(.horizontal, 10).padding(.vertical, 5)
            .background(bg, in: Capsule())
    }
}

/// Inline banner: icon, sentence, optional action. Warnings always carry the triangle and a sentence.
struct Banner: View {
    enum Tone { case warning, danger, info, success }
    var tone: Tone
    var text: String
    var actionTitle: String?
    var action: (() -> Void)?
    var body: some View {
        let (fg, bg, icon): (Color, Color, String) = switch tone {
        case .warning: (.statusWarning, .statusWarningSubtle, "exclamationmark.triangle.fill")
        case .danger: (.statusDanger, .statusDangerSubtle, "xmark.octagon.fill")
        case .info: (.textPrimary, .surfaceMuted, "info.circle.fill")
        case .success: (.statusSuccess, .statusSuccessSubtle, "checkmark.circle.fill")
        }
        VStack(alignment: .leading, spacing: 8) {
            HStack(alignment: .firstTextBaseline, spacing: 10) {
                Image(systemName: icon).foregroundStyle(fg).accessibilityHidden(true)
                Text(text).font(.subheadline).foregroundStyle(Color.textPrimary).fixedSize(horizontal: false, vertical: true)
            }
            if let actionTitle, let action {
                Button(actionTitle, action: action).linkAction().padding(.leading, 28)
            }
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(14)
        .background(bg, in: RoundedRectangle(cornerRadius: 14, style: .continuous))
        .accessibilityElement(children: .combine)
    }
}

struct OfflineBanner: View {
    var text: String
    var body: some View {
        Label(text, systemImage: "wifi.slash")
            .font(.footnote.weight(.medium))
            .foregroundStyle(Color.textPrimary)
            .frame(maxWidth: .infinity, alignment: .leading)
            .padding(12)
            .background(Color.surfaceMuted, in: RoundedRectangle(cornerRadius: 12, style: .continuous))
    }
}

struct EmptyState: View {
    var title: String
    var message: String
    var symbol: String = "square.dashed"
    var actionTitle: String?
    var action: (() -> Void)?
    var secondaryTitle: String?
    var secondary: (() -> Void)?
    var body: some View {
        ContentUnavailableView {
            Label(title, systemImage: symbol)
        } description: {
            Text(message)
        } actions: {
            if let actionTitle, let action { Button(actionTitle, action: action).primaryAction() }
            if let secondaryTitle, let secondary { Button(secondaryTitle, action: secondary).linkAction() }
        }
    }
}

/// Five hollow ribs. Used by empty states in place of an SF Symbol.
struct EmptyRibs: View {
    var body: some View { RibMeter(value: 0, tone: .neutral, size: .lg).accessibilityHidden(true) }
}

struct ToastView: View {
    var toast: ToastMessage
    var undo: () -> Void
    var calendar: () -> Void = {}
    var body: some View {
        HStack(spacing: 12) {
            Text(toast.text).font(.subheadline.weight(.semibold)).foregroundStyle(Color.textPrimary)
            if toast.undoID != nil {
                Button("Undo", action: undo).font(.subheadline.weight(.bold)).foregroundStyle(Color.linkText).frame(minHeight: 44)
            }
            if toast.calendarID != nil {
                Button("Add to calendar", action: calendar).font(.subheadline.weight(.bold)).foregroundStyle(Color.linkText).frame(minHeight: 44)
            }
        }
        .padding(.horizontal, 16).padding(.vertical, 4)
        .glassEffect(.regular, in: .capsule)
        .accessibilityElement(children: .combine)
    }
}
