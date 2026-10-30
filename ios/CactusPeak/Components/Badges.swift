import SwiftUI

// MARK: - CategoryBadge (icon + name, never colour alone)

struct CategoryBadge: View {
    enum Style { case tint, solid }
    var category: ClassCategory
    var style: Style = .tint
    var compact = false
    @Environment(\.colorScheme) private var scheme

    var body: some View {
        let tintOpacity = scheme == .dark ? 0.14 : 0.10
        Label {
            Text(category.title)
        } icon: {
            Image(systemName: category.symbol)
        }
        .labelStyle(BadgeLabelStyle())
        .font(compact ? .caption2.weight(.semibold) : .caption.weight(.semibold))
        .foregroundStyle(style == .solid ? (scheme == .dark ? Color.nightSurface.mix(with: .black, 0.2) : Color.white) : category.textColor)
        .padding(.horizontal, compact ? 6 : 8).padding(.vertical, compact ? 2 : 3)
        .background(
            RoundedRectangle(cornerRadius: 4, style: .continuous)       // 4 pt corner = static label
                .fill(style == .solid ? category.color : category.color.opacity(tintOpacity))
        )
        .accessibilityElement(children: .ignore)
        .accessibilityLabel(category.title)
    }
}

struct BadgeLabelStyle: LabelStyle {
    func makeBody(configuration: Configuration) -> some View {
        HStack(spacing: 4) { configuration.icon.imageScale(.small); configuration.title }
    }
}

// MARK: - Intensity ribs

enum Intensity {
    static func word(_ i: Int) -> String { ["", "Easy", "Light", "Moderate", "Hard", "All-out"][min(max(i, 1), 5)] }
}

struct IntensityRibs: View {
    var value: Int
    var category: ClassCategory?
    var size: RibSize = .sm
    var showWord = false
    @Environment(\.dynamicTypeSize) private var dts
    var body: some View {
        HStack(spacing: 6) {
            if !dts.isAccessibilitySize { RibMeter(value: value, tone: category.map { .category($0) } ?? .neutral, size: size, peak: false) }
            if showWord || dts.isAccessibilitySize {
                Text(dts.isAccessibilitySize ? "Intensity \(value) of 5 · \(Intensity.word(value))" : Intensity.word(value))
                    .font(.caption.weight(.medium)).foregroundStyle(Color.textMuted)
            }
        }
        .accessibilityElement(children: .ignore)
        .accessibilityLabel("Intensity \(value) of 5, \(Intensity.word(value))")
    }
}

// MARK: - Capacity

struct CapacityIndicator: View {
    var left: Int
    var capacity: Int
    var noun: String
    var waitlist: Int = 0
    var dropIn = false
    var large = false

    var body: some View {
        let low = left > 0 && left <= 5
        let filled = Int((Double(capacity - left) / Double(max(capacity, 1)) * 5).rounded(.up))
        HStack(spacing: 6) {
            if large {
                Text("\(left)").font(.archivoExtraBold(28, relativeTo: .title)).monospacedDigit()
                    .foregroundStyle(left == 0 ? Color.textMuted : (low ? Color.statusWarning : Color.textPrimary))
            } else {
                RibMeter(value: min(5, left == 0 ? 5 : filled), tone: low ? .warning : .neutral, size: .sm, peak: false)
            }
            VStack(alignment: .leading, spacing: 0) {
                if left == 0 {
                    Text(waitlist > 0 ? "Full · Waitlist \(waitlist)" : "Full").font(large ? .subheadline : .footnote.weight(.medium)).foregroundStyle(Color.textMuted)
                } else {
                    HStack(spacing: 3) {
                        if low { Image(systemName: "exclamationmark.triangle.fill").imageScale(.small).accessibilityHidden(true) }
                        Text(dropIn ? "Drop-in · \(left) \(left == 1 ? String(noun.dropLast()) : noun) left" : (large ? "\(noun) left" : "\(left) \(left == 1 && noun == "spots" ? "spot" : (left == 1 && noun == "bikes" ? "bike" : noun)) left"))
                            .font(large ? .subheadline : .footnote.weight(.medium))
                    }
                    .foregroundStyle(low ? Color.statusWarning : Color.textMuted)
                }
            }
        }
        .accessibilityElement(children: .ignore)
        .accessibilityLabel(left == 0 ? "Full\(waitlist > 0 ? ", \(waitlist) on the waitlist" : "")" : "\(left) of \(capacity) \(noun) left")
    }
}

// MARK: - Chips

struct AmenityChip: View {
    var label: String
    var symbol: String?
    var isSelected = false
    var warn = false
    var body: some View {
        HStack(spacing: 5) {
            if let symbol { Image(systemName: symbol).imageScale(.small).accessibilityHidden(true) }
            Text(label).lineLimit(1)
        }
        .font(.footnote.weight(.medium))
        .foregroundStyle(warn ? Color.statusWarning : (isSelected ? Color.brandOnAccent : Color.textPrimary))
        .padding(.horizontal, 12).padding(.vertical, 7)
        .background(warn ? Color.statusWarningSubtle : (isSelected ? Color.brandSecondary : Color.surfaceMuted), in: Capsule())
    }
}

struct FilterChip: View {
    var title: String
    var symbol: String?
    var active = false
    var action: () -> Void
    var body: some View {
        Button(action: action) {
            HStack(spacing: 5) {
                if let symbol { Image(systemName: symbol).imageScale(.small) }
                Text(title)
                Image(systemName: "chevron.down").imageScale(.small).font(.caption2.weight(.bold)).opacity(0.7)
            }
            .font(.subheadline.weight(.medium))
            .foregroundStyle(active ? Color.brandOnAccent : Color.textPrimary)
            .padding(.horizontal, 14).frame(minHeight: 44)
            .background(active ? Color.brandSecondary : Color.surface, in: Capsule())
            .overlay(Capsule().strokeBorder(active ? Color.clear : Color.borderStrong, lineWidth: 1))
        }
        .buttonStyle(.plain)
        .accessibilityAddTraits(active ? .isSelected : [])
    }
}

struct InstructorChip: View {
    var coach: Coach
    var large = false
    var showCredential = false
    var body: some View {
        HStack(spacing: large ? 12 : 8) {
            CoachImage(name: coach.fullName, category: coach.category, size: large ? 56 : 28)
            VStack(alignment: .leading, spacing: 0) {
                Text(large ? "with \(coach.fullName)" : coach.shortName).font(large ? .headline : .subheadline)
                if showCredential { Text(coach.credential).font(.subheadline).foregroundStyle(Color.textMuted) }
            }
        }
        .accessibilityElement(children: .combine)
    }
}

struct OpenStatus: View {
    var club: Club
    var now: Date
    var body: some View {
        let open = club.isOpen(at: now)
        HStack(spacing: 5) {
            Image(systemName: open ? "circle.fill" : "moon.fill").imageScale(.small).foregroundStyle(open ? Color.statusSuccess : Color.textMuted)
                .font(.caption2).accessibilityHidden(true)
            Text(open ? "Open until \(club.openUntilText(on: now))" : "Closed · opens \(club.opensText(now))")
                .font(.footnote.weight(.medium)).foregroundStyle(open ? Color.statusSuccess : Color.textMuted)
        }
    }
}

struct LateCancelNotice: View {
    var freeUntil: Date
    var body: some View {
        Label("Free cancel ended \(freeUntil.cpTime) Cancelling now counts as a late cancel.", systemImage: "exclamationmark.triangle.fill")
            .font(.footnote).foregroundStyle(Color.statusWarning)
    }
}

struct FactLabel: View {
    var label: String
    var body: some View { Text(label.uppercased()).eyebrowStyle() }
}
