import WidgetKit
import SwiftUI
import AppIntents
import ActivityKit

@main
struct CactusPeakWidgetBundle: WidgetBundle {
    var body: some Widget {
        NextClassWidget()
        ClubNowWidget()
        NextAndPassWidget()
        TodayWidget()
        WeeklyGoalWidget()
        KidsClubWidget()
        PassLockWidget()
        ShowPassControl()
        ClassLiveActivity()
    }
}

// MARK: - Timeline

struct SnapshotEntry: TimelineEntry {
    let date: Date
    let snap: WidgetSnapshot
    /// Rises in the hour before a class so the Smart Stack brings Next class to the top.
    var relevance: TimelineEntryRelevance? {
        guard let n = snap.next, n.start.timeIntervalSince(snap.generatedAt) < 3600 else { return nil }
        return TimelineEntryRelevance(score: 80, duration: 3600)
    }
}

struct SnapshotProvider: TimelineProvider {
    func placeholder(in context: Context) -> SnapshotEntry { SnapshotEntry(date: .now, snap: .sample) }
    func getSnapshot(in context: Context, completion: @escaping (SnapshotEntry) -> Void) { completion(SnapshotEntry(date: .now, snap: context.isPreview ? .sample : SnapshotStore.load())) }

    /// One entry per boundary: now, each class start, each class end. Each entry picks its own "next class",
    /// so the widget moves on after a class starts or ends without the app running. The snapshot clock is the app's
    /// sample clock, so boundaries are mapped onto the real clock by their offset from the snapshot time.
    func getTimeline(in context: Context, completion: @escaping (Timeline<SnapshotEntry>) -> Void) {
        let base = SnapshotStore.load()
        let anchor = base.generatedAt
        let list = base.nextList.isEmpty ? (base.next.map { [$0] } ?? []) : base.nextList
        var boundaries: [Date] = [anchor]
        for c in list { boundaries += [c.start.addingTimeInterval(-3600), c.start, c.end] }
        let sorted = Set(boundaries.filter { $0 >= anchor }).sorted()
        let now = Date()
        let entries: [SnapshotEntry] = sorted.map { b in
            var s = base
            s.next = list.first { $0.end > b }
            s.upcoming = base.upcoming.filter { $0.start >= b }
            return SnapshotEntry(date: now.addingTimeInterval(b.timeIntervalSince(anchor)), snap: s)
        }
        completion(Timeline(entries: entries, policy: .atEnd))
    }
}

private func link(_ path: String) -> URL { URL(string: "cactuspeak://\(path)")! }

// MARK: - Small pieces

/// Full colour gets the Surface fill. Tinted and clear modes get no fill, so the system can tint the content.
struct WidgetBG: View {
    @Environment(\.widgetRenderingMode) private var mode
    var body: some View { mode == .fullColor ? Color.surface : Color.clear }
}


struct Eyebrow: View {
    var text: String
    var body: some View { Text(text.uppercased()).font(.archivoSemiBold(10, relativeTo: .caption2)).tracking(1.6).foregroundStyle(.secondary) }
}

struct WidgetRibs: View {
    var value: Int
    var tone: RibTone = .neutral
    var size: RibSize = .md
    var body: some View { RibMeter(value: value, tone: tone, size: size, peak: size != .sm, emptyOpacity: 0.28).widgetAccentable() }
}

extension WidgetSnapshot.ClubNow {
    var tone: RibTone { switch level { case 1, 2: .success; case 3: .neutral; case 4: .warning; case 5: .danger; default: .neutral } }
}

// MARK: - Next class (small, lock screen)

struct NextClassWidget: Widget {
    var body: some WidgetConfiguration {
        StaticConfiguration(kind: "NextClass", provider: SnapshotProvider()) { e in
            NextClassView(snap: e.snap).containerBackground(for: .widget) { WidgetBG() }
        }
        .configurationDisplayName("Next class")
        .description("Your next booked class, its room and its intensity.")
        .supportedFamilies([.systemSmall, .accessoryRectangular, .accessoryInline])
    }
}

struct NextClassView: View {
    @Environment(\.widgetFamily) private var family
    var snap: WidgetSnapshot
    var body: some View {
        Group {
            switch family {
            case .accessoryInline:
                if let n = snap.next { Text("\(n.category.title) \(n.start.cpTimeShort) · \(n.clubShort)") } else { Text("Nothing booked") }
            case .accessoryRectangular:
                VStack(alignment: .leading, spacing: 1) {
                    if let n = snap.next {
                        Text(n.name).font(.headline).widgetAccentable()
                        Text("\(n.start.cpTime) · \(n.clubShort)").font(.caption)
                        RibMeter(value: n.intensity, tone: .neutral, size: .sm, peak: false, emptyOpacity: 0.3)
                    } else { Text("Nothing booked").font(.headline); Text("Tap to book").font(.caption) }
                }.frame(maxWidth: .infinity, alignment: .leading)
            default: small
            }
        }
        .widgetURL(snap.next.map { link("book/class/\($0.sessionID)") } ?? link("book"))
    }

    private var small: some View {
        VStack(alignment: .leading, spacing: 4) {
            if let n = snap.next {
                HStack(spacing: 6) {
                    ClassGraphic(category: n.category, variant: .square).frame(width: 28, height: 28).clipShape(RoundedRectangle(cornerRadius: 6, style: .continuous))
                    Eyebrow(text: n.category.title)
                }.foregroundStyle(n.category.textColor)
                let (t, ap) = n.start.cpClock
                HStack(alignment: .firstTextBaseline, spacing: 2) {
                    Text(t).font(.archivoExtraBold(30, relativeTo: .title)).monospacedDigit().widgetAccentable()
                    Text(ap).font(.caption.weight(.semibold))
                }
                Text(n.name).font(.headline).lineLimit(2)
                Spacer(minLength: 0)
                Text("\(n.room) · \(n.clubShort)").font(.caption).foregroundStyle(.secondary).lineLimit(1)
                WidgetRibs(value: n.intensity, tone: .category(n.category), size: .sm)
            } else {
                Eyebrow(text: "Next up")
                Text("Nothing booked.").font(.headline)
                Text("Tap to book.").font(.subheadline).foregroundStyle(.secondary)
                Spacer()
            }
        }
        .frame(maxWidth: .infinity, alignment: .leading)
    }
}

// MARK: - Club now (medium, circular gauge)

struct ClubNowWidget: Widget {
    var body: some WidgetConfiguration {
        StaticConfiguration(kind: "ClubNow", provider: SnapshotProvider()) { e in
            ClubNowView(snap: e.snap).containerBackground(for: .widget) { WidgetBG() }
        }
        .configurationDisplayName("Club now")
        .description("How busy your club is, with typical hours.")
        .supportedFamilies([.systemMedium, .accessoryCircular])
    }
}

struct ClubNowView: View {
    @Environment(\.widgetFamily) private var family
    var snap: WidgetSnapshot
    var body: some View {
        let c = snap.club
        Group {
            if family == .accessoryCircular {
                Gauge(value: Double(c.level), in: 0...5) { Text("Busy") } currentValueLabel: { Text(c.level == 0 ? "–" : "\(c.level)") }
                    .gaugeStyle(.accessoryCircular).widgetAccentable()
            } else {
                HStack(alignment: .top, spacing: 16) {
                    VStack(alignment: .leading, spacing: 6) {
                        Eyebrow(text: "Club now")
                        Text(c.name).font(.headline).lineLimit(2)
                        if c.level > 0 { WidgetRibs(value: c.level, tone: c.tone, size: .lg) }
                        Text(c.level > 0 ? c.word : "Closed").font(.archivoExtraBold(22, relativeTo: .title2))
                    }
                    VStack(alignment: .leading, spacing: 6) {
                        Spacer(minLength: 0)
                        HourBars(values: c.hourly, now: c.hourIndex).frame(height: 54)
                        Text("Open until \(c.openUntil)").font(.caption.weight(.medium))
                        Text("as of \(c.updatedAt.cpTime)").font(.caption2).foregroundStyle(.secondary)
                    }
                }
            }
        }
        .widgetURL(link("clubs/\(c.slug)"))
    }
}

struct HourBars: View {
    var values: [Double]
    var now: Int
    var body: some View {
        GeometryReader { g in
            HStack(alignment: .bottom, spacing: 2) {
                ForEach(Array(values.enumerated()), id: \.offset) { i, v in
                    RoundedRectangle(cornerRadius: 1.5)
                        .fill(i == now ? Color.brandAccent : Color.brandSecondary.opacity(0.35))
                        .frame(height: max(3, g.size.height * v))
                }
            }.widgetAccentable()
        }
        .accessibilityHidden(true)
    }
}

// MARK: - Next + pass (medium)

struct NextAndPassWidget: Widget {
    var body: some WidgetConfiguration {
        StaticConfiguration(kind: "NextAndPass", provider: SnapshotProvider()) { e in
            HStack(spacing: 12) {
                NextClassView(snap: e.snap)
                Link(destination: link("pass")) {
                    VStack(spacing: 8) {
                        Image(systemName: "qrcode").font(.system(size: 34)).foregroundStyle(Color.nightOnSurface)
                        Text("Show pass").font(.subheadline.weight(.semibold)).foregroundStyle(Color.nightOnSurface)
                    }
                    .frame(width: 96).frame(maxHeight: .infinity)
                    .background(Color.nightSurface, in: ContainerRelativeShape())
                }
            }
            .containerBackground(for: .widget) { WidgetBG() }
        }
        .configurationDisplayName("Next class and pass")
        .description("Your next class, with a one-tap pass.")
        .supportedFamilies([.systemMedium])
    }
}

// MARK: - Today (large)

struct TodayWidget: Widget {
    var body: some WidgetConfiguration {
        StaticConfiguration(kind: "Today", provider: SnapshotProvider()) { e in
            TodayWidgetView(snap: e.snap).containerBackground(for: .widget) { WidgetBG() }
        }
        .configurationDisplayName("Today")
        .description("Your next bookings, club busyness and your pass.")
        .supportedFamilies([.systemLarge])
    }
}

struct TodayWidgetView: View {
    var snap: WidgetSnapshot
    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            Eyebrow(text: "Coming up")
            ForEach(Array(snap.upcoming.prefix(3).enumerated()), id: \.offset) { _, u in
                HStack(spacing: 10) {
                    RoundedRectangle(cornerRadius: 2).fill((u.category ?? .cycle).color).frame(width: 4, height: 36)
                    VStack(alignment: .leading, spacing: 0) {
                        Text(u.title).font(.headline)
                        Text("\(u.start.cpFormat("EEE")) \(u.start.cpTime) · \(u.club)").font(.caption).foregroundStyle(.secondary)
                    }
                    Spacer()
                }
            }
            Divider()
            HStack {
                WidgetRibs(value: snap.club.level, tone: snap.club.tone, size: .md)
                VStack(alignment: .leading) { Text(snap.club.name).font(.subheadline.weight(.semibold)); Text("\(snap.club.word) · as of \(snap.club.updatedAt.cpTime)").font(.caption).foregroundStyle(.secondary) }
            }
            Spacer(minLength: 0)
            Link(destination: link("pass")) {
                Label("Show pass", systemImage: "qrcode").font(.headline).foregroundStyle(Color.nightOnSurface).frame(maxWidth: .infinity, minHeight: 44)
                    .background(Color.nightSurface, in: Capsule())
            }
        }
        .widgetURL(link("bookings"))
    }
}

// MARK: - Weekly goal (small)

struct WeeklyGoalWidget: Widget {
    var body: some WidgetConfiguration {
        StaticConfiguration(kind: "WeeklyGoal", provider: SnapshotProvider()) { e in
            let s = e.snap
            VStack(alignment: .leading, spacing: 8) {
                Eyebrow(text: "\(s.weekVisits) of \(s.goal) visits")
                WidgetRibs(value: s.weekVisits, tone: s.weekVisits >= s.goal ? .success : .brand, size: .lg)
                HStack(spacing: 4) {
                    ForEach(0..<7, id: \.self) { i in
                        Circle().fill(s.weekDots[i] ? Color.nightSurface : Color.clear).overlay(Circle().strokeBorder(Color.borderStrong, lineWidth: i == s.todayIndex ? 2 : 1)).frame(width: 14, height: 14)
                    }
                }.widgetAccentable()
                Label("\(s.streakWeeks)-week streak", systemImage: "leaf.fill").font(.caption.weight(.semibold)).foregroundStyle(Color.statusSuccess)
            }
            .frame(maxWidth: .infinity, alignment: .leading)
            .widgetURL(link("progress"))
            .containerBackground(for: .widget) { WidgetBG() }
        }
        .configurationDisplayName("Weekly goal")
        .description("Visits toward your weekly goal.")
        .supportedFamilies([.systemSmall])
    }
}

// MARK: - Kids club (small)

struct KidsClubWidget: Widget {
    var body: some WidgetConfiguration {
        StaticConfiguration(kind: "KidsClub", provider: SnapshotProvider()) { e in
            VStack(alignment: .leading, spacing: 6) {
                HStack(spacing: 6) {
                    SpaceGraphic(id: .kidsClub).frame(width: 28, height: 28).clipShape(RoundedRectangle(cornerRadius: 6, style: .continuous))
                    Eyebrow(text: "Kids club")
                }.foregroundStyle(ClassCategory.youth.textColor)
                if let k = e.snap.kids {
                    Text(k.names).font(.headline)
                    Text("\(k.start.cpFormat("EEE")) \(k.start.cpTimeShort)").font(.archivoBold(22, relativeTo: .title3)).widgetAccentable()
                    Spacer(minLength: 0)
                    Text("Check in by \(k.checkInBy.cpTime)").font(.caption.weight(.medium))
                } else { Text("No block booked.").font(.headline); Spacer() }
            }
            .frame(maxWidth: .infinity, alignment: .leading)
            .widgetURL(link("bookings"))
            .containerBackground(for: .widget) { WidgetBG() }
        }
        .configurationDisplayName("Kids club")
        .description("The next kids club block and when to check in.")
        .supportedFamilies([.systemSmall])
    }
}

// MARK: - Lock Screen pass

struct PassLockWidget: Widget {
    var body: some WidgetConfiguration {
        StaticConfiguration(kind: "PassLock", provider: SnapshotProvider()) { _ in
            ZStack {
                AccessoryWidgetBackground()
                Image(systemName: "qrcode").font(.title2).widgetAccentable()
            }
            .widgetURL(link("pass"))
            .containerBackground(.clear, for: .widget)
            .accessibilityLabel("Show check-in pass")
        }
        .configurationDisplayName("Check-in pass")
        .description("Opens your pass. No name, number or code shows on the Lock Screen.")
        .supportedFamilies([.accessoryCircular])
    }
}

// MARK: - Control Center

struct ShowPassControl: ControlWidget {
    var body: some ControlWidgetConfiguration {
        StaticControlConfiguration(kind: "ShowPassControl") {
            ControlWidgetButton(action: OpenURLIntent(link("pass"))) {
                Label("Show pass", systemImage: "qrcode")
            }
        }
        .displayName("Show pass")
        .description("Opens your check-in pass.")
    }
}

// MARK: - Live Activity

struct ClassLiveActivity: Widget {
    var body: some WidgetConfiguration {
        ActivityConfiguration(for: ClassActivityAttributes.self) { context in
            LockScreenActivity(attrs: context.attributes, state: context.state)
                .activityBackgroundTint(Color.nightSurface)
                .activitySystemActionForegroundColor(Color.dawnCopper)
                .widgetURL(link("book/class/\(context.attributes.sessionID)"))
        } dynamicIsland: { context in
            DynamicIsland {
                DynamicIslandExpandedRegion(.leading) {
                    ClassGraphic(category: context.attributes.category, variant: .square).frame(width: 36, height: 36).clipShape(RoundedRectangle(cornerRadius: 8, style: .continuous))
                        .environment(\.colorScheme, .dark)
                }
                DynamicIslandExpandedRegion(.trailing) { Text(context.state.startLabel).font(.headline.weight(.semibold)).monospacedDigit() }
                DynamicIslandExpandedRegion(.center) {
                    Text(context.attributes.className).font(.headline).lineLimit(1)
                }
                DynamicIslandExpandedRegion(.bottom) {
                    HStack {
                        VStack(alignment: .leading) {
                            Text("\(context.attributes.room) · \(context.attributes.clubShort)").font(.caption.weight(.medium))
                            thirdValue(context.state)
                        }
                        Spacer()
                        Link(destination: link("pass")) { Text("Show pass").font(.subheadline.weight(.semibold)).padding(.horizontal, 14).padding(.vertical, 8).background(Color.dawnCopper, in: Capsule()).foregroundStyle(Color.nightSurface) }
                    }
                }
            } compactLeading: {
                Image(systemName: context.attributes.category.symbol).foregroundStyle(Color.dawnCopper)
            } compactTrailing: {
                Text(timerInterval: Date.now...max(context.state.startsAt, Date.now.addingTimeInterval(1)), pauseTime: nil, countsDown: true, showsHours: false)
                    .font(.caption.weight(.semibold)).monospacedDigit().frame(maxWidth: 60).minimumScaleFactor(0.8)
            } minimal: {
                Image(systemName: context.attributes.category.symbol).foregroundStyle(Color.dawnCopper)
            }
            .keylineTint(Color.dawnCopper)
        }
    }

    @ViewBuilder private func thirdValue(_ s: ClassActivityAttributes.ContentState) -> some View {
        switch s.phase {
        case .upcoming: Text("Starts in \(Text(timerInterval: Date.now...max(s.startsAt, Date.now.addingTimeInterval(1)), countsDown: true, showsHours: false))")
        case .checkInDue: Text("Check in open").font(.caption.weight(.semibold))
        case .inProgress: Text("Ends \(s.endLabel)").font(.caption.weight(.semibold))
        case .ended: Text("Class finished").font(.caption.weight(.semibold))
        }
    }
}

struct LockScreenActivity: View {
    var attrs: ClassActivityAttributes
    var state: ClassActivityAttributes.ContentState
    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack(alignment: .center) {
                ClassGraphic(category: attrs.category, variant: .square).frame(width: 32, height: 32).clipShape(RoundedRectangle(cornerRadius: 8, style: .continuous))
                    .environment(\.colorScheme, .dark)
                Text(attrs.className).font(.archivoSemiBold(20, relativeTo: .title3)).foregroundStyle(Color.nightOnSurface).lineLimit(1)
                Spacer()
                chip
            }
            Text(state.startLabel).font(.archivoExtraBold(34, relativeTo: .largeTitle)).monospacedDigit().foregroundStyle(Color.nightOnSurface)
            HStack {
                Text("\(attrs.clubShort) · \(attrs.room) · \(third)").font(.subheadline.weight(.medium)).foregroundStyle(Color.nightOnSurface).lineLimit(2)
                Spacer()
                Link(destination: link("pass")) { Text("Show pass").font(.subheadline.weight(.semibold)).foregroundStyle(Color.nightSurface).padding(.horizontal, 12).padding(.vertical, 6).background(Color.dawnCopper, in: Capsule()) }
            }
        }
        .padding(14)
    }
    private var third: String {
        switch state.phase { case .upcoming: "Booked"; case .checkInDue: "Check in open"; case .inProgress: "Ends \(state.endLabel)"; case .ended: "Class finished" }
    }
    @ViewBuilder private var chip: some View {
        if state.phase == .upcoming || state.phase == .checkInDue {
            Text(timerInterval: Date.now...max(state.startsAt, Date.now.addingTimeInterval(1)), countsDown: true, showsHours: false)
                .font(.subheadline.weight(.bold)).monospacedDigit().foregroundStyle(Color.nightSurface)
                .padding(.horizontal, 10).padding(.vertical, 5).background(Color.dawnCopper, in: Capsule()).frame(maxWidth: 110)
        }
    }
}

// MARK: - Previews (render each family without a device)

#Preview("Next class, small", as: .systemSmall) { NextClassWidget() } timeline: { SnapshotEntry(date: .now, snap: .sample) }
#Preview("Next class, lock rectangular", as: .accessoryRectangular) { NextClassWidget() } timeline: { SnapshotEntry(date: .now, snap: .sample) }
#Preview("Club now, medium", as: .systemMedium) { ClubNowWidget() } timeline: { SnapshotEntry(date: .now, snap: .sample) }
#Preview("Club now, lock circular", as: .accessoryCircular) { ClubNowWidget() } timeline: { SnapshotEntry(date: .now, snap: .sample) }
#Preview("Next + pass, medium", as: .systemMedium) { NextAndPassWidget() } timeline: { SnapshotEntry(date: .now, snap: .sample) }
#Preview("Today, large", as: .systemLarge) { TodayWidget() } timeline: { SnapshotEntry(date: .now, snap: .sample) }
#Preview("Weekly goal, small", as: .systemSmall) { WeeklyGoalWidget() } timeline: { SnapshotEntry(date: .now, snap: .sample) }
#Preview("Kids club, small", as: .systemSmall) { KidsClubWidget() } timeline: { SnapshotEntry(date: .now, snap: .sample) }
#Preview("Pass, lock circular", as: .accessoryCircular) { PassLockWidget() } timeline: { SnapshotEntry(date: .now, snap: .sample) }
