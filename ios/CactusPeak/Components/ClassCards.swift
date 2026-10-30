import SwiftUI

/// Everything a class row needs, so rows do not read the whole model.
struct ClassRowData: Identifiable, Hashable {
    var session: ClassSession
    var coach: Coach
    var clubShort: String
    var left: Int
    var waitlist: Int
    var state: BookingState
    var id: String { session.id }
}

extension AppModel {
    func rowData(_ s: ClassSession) -> ClassRowData {
        ClassRowData(session: s, coach: coach(s.coachID), clubShort: club(s.clubID).shortName, left: spotsLeft(s),
                     waitlist: waitlistCount(s), state: state(for: s))
    }
}

/// One schedule row: a 2-line timetable entry, about 68 pt. Time in Archivo, category stripe and symbol, coach and room,
/// intensity ribs, spots and the booking button on the row.
struct ClassRow: View {
    var data: ClassRowData
    var showClub = false
    var showDate = false
    var onAction: () -> Void
    var onLeave: () -> Void = {}
    @Environment(\.dynamicTypeSize) private var dts

    private var isPast: Bool { if case .started = data.state { return true } else { return false } }

    var body: some View {
        let s = data.session
        let (clock, ampm) = s.start.cpClock
        HStack(alignment: .center, spacing: 12) {
            RoundedRectangle(cornerRadius: 2).fill(s.category.color).frame(width: 4).accessibilityHidden(true)
            if dts.isAccessibilitySize {
                VStack(alignment: .leading, spacing: 6) {
                    timeText(clock, ampm)
                    titleLine(s)
                    detailLine(s)
                    capacity(s)
                    BookingStateButton(state: data.state, action: onAction, onLeave: onLeave)
                }
            } else {
                HStack(alignment: .center, spacing: 12) {
                    VStack(alignment: .leading, spacing: 0) {
                        if showDate { Text(s.start.cpFormat("EEE MMM d")).font(.caption2.weight(.semibold)).foregroundStyle(Color.textMuted) }
                        timeText(clock, ampm)
                        Text("\(s.durationMin) min").font(.caption).foregroundStyle(Color.textMuted)
                    }
                    .frame(width: 76, alignment: .leading)
                    VStack(alignment: .leading, spacing: 2) {
                        titleLine(s)
                        detailLine(s)
                    }
                    .accessibilityElement(children: .combine)
                    .accessibilityLabel(a11yLabel(s, clock, ampm))
                    Spacer(minLength: 4)
                    VStack(alignment: .trailing, spacing: 2) {
                        BookingStateButton(state: data.state, action: onAction, onLeave: onLeave)
                        capacity(s)
                    }
                }
            }
        }
        .padding(.vertical, 6)
        .frame(minHeight: 64)
        .opacity(isPast ? 0.55 : 1)
        .accessibilityElement(children: .contain)
    }

    private func timeText(_ clock: String, _ ampm: String) -> some View {
        HStack(alignment: .firstTextBaseline, spacing: 2) {
            Text(clock).font(.archivoSemiBold(20, relativeTo: .title3)).monospacedDigit()
            Text(ampm).font(.caption2.weight(.semibold)).foregroundStyle(Color.textMuted)
        }
        .lineLimit(1)
    }

    private func titleLine(_ s: ClassSession) -> some View {
        HStack(spacing: 6) {
            Image(systemName: s.category.symbol).imageScale(.small).foregroundStyle(s.category.textColor).accessibilityHidden(true)
            Text(s.name).font(.headline).lineLimit(2).fixedSize(horizontal: false, vertical: true)
        }
    }

    private func detailLine(_ s: ClassSession) -> some View {
        HStack(spacing: 6) {
            Text("\(data.coach.shortName) · \(s.room)\(showClub ? " · \(data.clubShort)" : "")")
                .font(.subheadline).foregroundStyle(Color.textMuted).lineLimit(1)
            RibMeter(value: s.intensity, tone: .category(s.category), size: .sm, peak: false)
        }
    }

    @ViewBuilder private func capacity(_ s: ClassSession) -> some View {
        if case .booked = data.state { EmptyView() }
        else if case .restricted(.notOpen(let d)) = data.state {
            Text("Opens \(d.cpWeekdayShort) \(d.cpTime)").font(.caption).foregroundStyle(Color.textMuted)
        } else {
            let dropIn: Bool = { if case .dropIn = data.state { return true } else { return false } }()
            let low = data.left > 0 && data.left <= 5
            HStack(spacing: 3) {
                if low { Image(systemName: "exclamationmark.triangle.fill").imageScale(.small).accessibilityHidden(true) }
                Text(data.left == 0 ? (data.waitlist > 0 ? "Full · Waitlist \(data.waitlist)" : "Full")
                     : (dropIn ? "Drop-in · \(data.left) left" : "\(data.left) \(data.left == 1 ? String(s.spotNoun.dropLast()) : s.spotNoun) left"))
                    .contentTransition(.numericText())
            }
            .font(.caption.weight(.medium)).foregroundStyle(low ? Color.statusWarning : Color.textMuted)
        }
    }

    private func a11yLabel(_ s: ClassSession, _ clock: String, _ ampm: String) -> String {
        "\(clock) \(ampm), \(s.durationMin) minutes. \(s.name). \(s.category.title). Intensity \(s.intensity) of 5. \(data.coach.shortName), \(s.room). "
        + (data.left == 0 ? "Full" : "\(data.left) \(s.spotNoun) left")
    }
}

/// Compact card for "Today at this club" and "Also this week".
struct ClassCompactCard: View {
    var data: ClassRowData
    var showDate = false
    var body: some View {
        let s = data.session
        VStack(alignment: .leading, spacing: 6) {
            Text(showDate ? s.start.cpFormat("EEE") + " " + s.start.cpTime : s.start.cpTime).font(.headline).monospacedDigit()
            Text(s.name).font(.subheadline.weight(.semibold)).lineLimit(2).fixedSize(horizontal: false, vertical: true)
            CategoryBadge(category: s.category, compact: true)
            IntensityRibs(value: s.intensity, category: s.category)
            Text(data.left == 0 ? "Full" : "\(data.left) \(s.spotNoun) left").font(.caption).foregroundStyle(data.left > 0 && data.left <= 5 ? Color.statusWarning : Color.textMuted)
        }
        .frame(width: 168, alignment: .leading)
        .cardStyle(padding: 12)
        .overlay(alignment: .top) { Rectangle().fill(s.category.color).frame(height: 4).clipShape(UnevenRoundedRectangle(topLeadingRadius: 14, topTrailingRadius: 14)) }
        .accessibilityElement(children: .combine)
    }
}

/// 260 pt card for the "For you" strip.
struct ClassFeatureCard: View {
    var data: ClassRowData
    var body: some View {
        let s = data.session
        VStack(alignment: .leading, spacing: 0) {
            ClassGraphic(category: s.category)
                .frame(height: 96)
            VStack(alignment: .leading, spacing: 6) {
                Text("\(s.start.cpWeekdayShort) \(s.start.cpTime)").font(.subheadline.weight(.semibold)).monospacedDigit().foregroundStyle(Color.textMuted)
                Text(s.name).font(.headline).lineLimit(2).fixedSize(horizontal: false, vertical: true)
                CategoryBadge(category: s.category, compact: true)
                Text("\(data.coach.shortName) · \(data.clubShort)").font(.footnote).foregroundStyle(Color.textMuted)
                Text(data.left == 0 ? "Full · Waitlist \(data.waitlist)" : "\(data.left) \(s.spotNoun) left")
                    .font(.footnote.weight(.semibold)).foregroundStyle(data.left > 0 && data.left <= 5 ? Color.statusWarning : Color.textPrimary)
            }
            .padding(12)
        }
        .frame(width: 252)
        .background(Color.surface, in: RoundedRectangle(cornerRadius: 14, style: .continuous))
        .clipShape(RoundedRectangle(cornerRadius: 14, style: .continuous))
        .overlay(RoundedRectangle(cornerRadius: 14, style: .continuous).strokeBorder(Color.hairline, lineWidth: 1))
        .accessibilityElement(children: .combine)
    }
}

/// A booking row (class, court, lane, kids club, PT) in lists.
struct BookingRow: View {
    var booking: Booking
    var clubShort: String
    var statusText: String?
    var holdAction: (() -> Void)?
    @Environment(\.dynamicTypeSize) private var dts
    var body: some View {
        HStack(alignment: .top, spacing: 12) {
            RoundedRectangle(cornerRadius: 2).fill(booking.category.color).frame(width: 4).accessibilityHidden(true)
            let layout = dts.isAccessibilitySize ? AnyLayout(VStackLayout(alignment: .leading, spacing: 6)) : AnyLayout(HStackLayout(alignment: .top, spacing: 12))
            layout {
                Text(booking.start.cpTime).font(.headline).monospacedDigit().frame(minWidth: dts.isAccessibilitySize ? 0 : 78, alignment: .leading)
                VStack(alignment: .leading, spacing: 2) {
                    Text(booking.title).font(.headline).fixedSize(horizontal: false, vertical: true)
                    Text("\(clubShort)\(booking.detail.isEmpty ? "" : " · \(booking.detail)")").font(.footnote).foregroundStyle(Color.textMuted)
                    if let t = statusText { Text(t).font(.footnote.weight(.semibold)).foregroundStyle(Color.textPrimary) }
                }
                if !dts.isAccessibilitySize { Spacer(minLength: 0) }
            }
        }
        .frame(minHeight: 56)
        .padding(.vertical, 2)
        .accessibilityElement(children: .combine)
    }
}

// MARK: - Coach card

struct CoachCard: View {
    enum Variant { case row, card }
    var coach: Coach
    var variant: Variant = .row
    var body: some View {
        switch variant {
        case .row:
            HStack(spacing: 12) {
                CoachImage(name: coach.fullName, category: coach.category, size: 56)
                VStack(alignment: .leading, spacing: 2) {
                    Text(coach.fullName).font(.headline)
                    Text(coach.credential).font(.subheadline).foregroundStyle(Color.textMuted)
                }
            }
            .frame(minHeight: 56)
            .accessibilityElement(children: .combine)
        case .card:
            VStack(alignment: .leading, spacing: 8) {
                CoachImage(name: coach.fullName, category: coach.category, size: 64)
                Text(coach.shortName).font(.headline)
                Text(coach.credential).font(.footnote).foregroundStyle(Color.textMuted).lineLimit(2)
            }
            .frame(width: 150, alignment: .leading)
            .cardStyle(padding: 12)
            .accessibilityElement(children: .combine)
        }
    }
}
