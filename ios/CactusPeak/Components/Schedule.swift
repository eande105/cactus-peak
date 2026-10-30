import SwiftUI

struct ScheduleDayStrip: View {
    var days: [Date]
    @Binding var selected: Date
    var counts: (Date) -> Int?
    var dimmed: (Date) -> Bool
    var onCalendar: (() -> Void)?
    @Environment(\.dynamicTypeSize) private var dts
    @Environment(\.colorScheme) private var scheme
    @State private var tick = 0

    var body: some View {
        HStack(spacing: 4) {
            ScrollViewReader { proxy in
                ScrollView(.horizontal) {
                    HStack(spacing: 6) {
                        ForEach(days, id: \.self) { d in chip(d).id(d) }
                    }
                }
                .contentMargins(.horizontal, 16, for: .scrollContent)
                .scrollTargetBehavior(.viewAligned)
                .scrollIndicators(.hidden)
                .onAppear { proxy.scrollTo(selected, anchor: .center) }
                .onChange(of: selected) { _, new in withAnimation(.snappy(duration: 0.3)) { proxy.scrollTo(new, anchor: .center) } }
            }
            if let onCalendar {
                Button(action: onCalendar) { Image(systemName: "calendar").frame(width: 44, height: 44) }
                    .buttonStyle(.plain).foregroundStyle(Color.textPrimary).accessibilityLabel("Pick a date").padding(.trailing, 8)
            }
        }
        .sensoryFeedback(.selection, trigger: selected)
    }

    private func chip(_ d: Date) -> some View {
        let isSel = AZ.cal.isDate(d, inSameDayAs: selected)
        let dim = dimmed(d)
        let isToday = d == AppModel.shared.now.startOfAZDay
        let n = counts(d)
        return Button { selected = d } label: {
            VStack(spacing: 2) {
                Text(isToday ? "Today" : d.cpWeekdayShort).font(.caption2.weight(.semibold))
                Text(d.cpFormat("d")).font(.archivoBold(18, relativeTo: .title3)).monospacedDigit()
                if let n { Text("\(n)").font(.caption2.weight(.medium)).monospacedDigit().opacity(0.8) }
            }
            .frame(minWidth: dts.isAccessibilitySize ? 88 : 48, minHeight: dts.isAccessibilitySize ? 0 : 54)
            .padding(.horizontal, dts.isAccessibilitySize ? 8 : 0).padding(.vertical, dts.isAccessibilitySize ? 10 : 0)
            .foregroundStyle(isSel ? (scheme == .dark ? Color.nightSurface : Color.nightOnSurface) : Color.textPrimary)
            .background(isSel ? (scheme == .dark ? Color.nightOnSurface : Color.nightSurface) : Color.clear, in: Capsule())
                        .opacity(dim && !isSel ? 0.5 : 1)
        }
        .buttonStyle(.plain)
        .accessibilityElement(children: .ignore)
        .accessibilityLabel("\(d.cpFormat("EEEE MMMM d"))\(n.map { ", \($0) \($0 == 1 ? "option" : "options")" } ?? "")")
        .accessibilityAddTraits(isSel ? [.isSelected, .isButton] : .isButton)
    }
}

struct DurationChips: View {
    var options: [Int]
    @Binding var selected: Int
    var disabled: Set<Int> = []
    @Environment(\.dynamicTypeSize) private var dts
    var body: some View {
        Group {
            if dts.isAccessibilitySize {
                Picker("Duration", selection: $selected) { ForEach(options, id: \.self) { Text("\($0) min").tag($0) } }.pickerStyle(.menu)
            } else {
                Picker("Duration", selection: $selected) { ForEach(options, id: \.self) { Text("\($0) min").tag($0) } }.pickerStyle(.segmented)
            }
        }
        .sensoryFeedback(.selection, trigger: selected)
    }
}

/// A time row used by courts, lanes and personal training.
struct SlotRow: View {
    var time: String
    var text: String
    var detail: String?
    var full = false
    var past = false
    var selected = false
    var body: some View {
        HStack(spacing: 12) {
            Text(time).font(.headline).monospacedDigit().frame(minWidth: 84, alignment: .leading)
            VStack(alignment: .leading, spacing: 2) {
                Text(text).font(.body).foregroundStyle(full || past ? Color.textMuted : Color.textPrimary)
                if let detail { Text(detail).font(.footnote).foregroundStyle(Color.textMuted) }
            }
            Spacer(minLength: 0)
            if !full && !past { Image(systemName: "chevron.right").font(.footnote.weight(.semibold)).foregroundStyle(Color.textMuted).accessibilityHidden(true) }
        }
        .frame(minHeight: 48)
        .opacity(past ? 0.55 : 1)
        .accessibilityElement(children: .combine)
        .accessibilityAddTraits(selected ? .isSelected : [])
    }
}
