import SwiftUI
import Charts

// MARK: - Busyness

extension BusynessReading {
    var tone: RibTone {
        switch level { case 1, 2: .success; case 3: .neutral; case 4: .warning; default: .danger }
    }
}

struct BusynessMeter: View {
    enum Variant { case inline, compact, card, hero }
    var reading: BusynessReading
    var variant: Variant = .inline
    var now: Date

    private var unavailable: Bool { reading.stale }
    private var valueText: String {
        if reading.closed { return "Closed · opens \(reading.opensText)" }
        if reading.stale { return "Busyness unavailable" }
        return reading.word
    }
    private var a11y: String {
        if reading.closed { return "Closed. Opens \(reading.opensText)" }
        if reading.stale { return "Busyness unavailable. Last update \(Int(now.timeIntervalSince(reading.updatedAt) / 60)) minutes ago." }
        return "Busyness \(reading.word), \(reading.level) of 5. Updated \(reading.updatedAt.cpTime)"
    }

    var body: some View {
        Group {
            switch variant {
            case .inline:
                HStack(spacing: 6) {
                    if !reading.closed { RibMeter(value: reading.level, tone: reading.tone, size: .sm, peak: false, unavailable: unavailable) }
                    Text(valueText).font(.footnote.weight(.semibold)).foregroundStyle(Color.textPrimary)
                }
            case .compact:
                HStack(spacing: 6) {
                    if !reading.closed { RibMeter(value: reading.level, tone: reading.tone, size: .sm, unavailable: unavailable) }
                    Text(reading.closed ? "Closed" : (unavailable ? "Unavailable" : reading.word)).font(.caption.weight(.medium)).foregroundStyle(Color.textMuted).lineLimit(1).fixedSize()
                }
            case .card:
                HStack(alignment: .center, spacing: 14) {
                    if !reading.closed { RibMeter(value: reading.level, tone: reading.tone, size: .lg, unavailable: unavailable) }
                    VStack(alignment: .leading, spacing: 2) {
                        Text(reading.closed || unavailable ? valueText : "\(reading.word) now").font(.headline)
                        Text(unavailable ? "Last update \(Int(now.timeIntervalSince(reading.updatedAt) / 60)) min ago." : "Updated \(reading.updatedAt.cpTime)")
                            .font(.footnote).foregroundStyle(Color.textMuted)
                    }
                }
            case .hero:
                HStack(alignment: .bottom, spacing: 16) {
                    if !reading.closed { RibMeter(value: reading.level, tone: reading.tone, size: .xl, unavailable: unavailable) }
                    VStack(alignment: .leading, spacing: 2) {
                        Text(reading.closed || unavailable ? valueText : "\(reading.word) now")
                            .font(.archivoExtraBold(26, relativeTo: .title)).foregroundStyle(Color.textPrimary).fixedSize(horizontal: false, vertical: true)
                        if !reading.closed && !unavailable {
                            Text(reading.level == reading.usual ? "About usual" : (reading.level > reading.usual ? "Busier than usual" : "Quieter than usual"))
                                .font(.subheadline.weight(.medium)).foregroundStyle(Color.textMuted)
                        }
                        Text(unavailable ? "Busyness unavailable. Last update \(Int(now.timeIntervalSince(reading.updatedAt) / 60)) min ago." : "Updated \(reading.updatedAt.cpTime)")
                            .font(.caption).foregroundStyle(Color.textMuted)
                    }
                }
            }
        }
        .accessibilityElement(children: .ignore)
        .accessibilityLabel(a11y)
        .accessibilityAddTraits(.updatesFrequently)
    }
}

// MARK: - Progress ribs (weekly visit goal)

struct ProgressRibs: View {
    var value: Int
    var goal: Int
    var hero = false
    var body: some View {
        let met = value >= goal
        VStack(alignment: .leading, spacing: 6) {
            HStack(alignment: .bottom, spacing: 14) {
                VStack(spacing: 4) {
                    RibMeter(value: min(5, value), tone: met ? .success : .brand, size: hero ? .lg : .md)
                    // tick under the goal rib
                    GeometryReader { g in
                        let step = g.size.width / 5
                        Image(systemName: "arrowtriangle.up.fill").font(.system(size: 8)).foregroundStyle(Color.textMuted)
                            .position(x: step * (CGFloat(min(goal, 5)) - 0.5), y: 5)
                    }
                    .frame(height: 10)
                }
                .fixedSize()
                VStack(alignment: .leading, spacing: 0) {
                    Text("\(value) of \(goal) visits").font(.archivoBold(hero ? 24 : 18, relativeTo: .title2)).monospacedDigit()
                    Text(met ? "Goal met this week." : "\(goal - value) more to reach your goal.").font(.subheadline).foregroundStyle(Color.textMuted)
                }
            }
        }
        .accessibilityElement(children: .ignore)
        .accessibilityLabel("\(value) of \(goal) visits this week. \(met ? "Goal met." : "\(goal - value) more to reach your goal.")")
    }
}

// MARK: - Popular times chart (Swift Charts, with an audio-graph descriptor)

struct HourPoint: Identifiable, Hashable { var id: Int; var hour: Int; var value: Double
    var label: String { let h12 = hour % 12 == 0 ? 12 : hour % 12; return "\(h12) \(hour < 12 ? "a.m." : "p.m.")" } }

struct PopularTimesChart: View {
    var values: [Double]      // 18 values from 4 a.m.
    var nowHour: Int?
    var compact = true
    @ScaledMetric(relativeTo: .body) private var baseHeight: CGFloat = 1

    var body: some View {
        let pts = values.enumerated().map { HourPoint(id: $0.offset, hour: $0.offset + 4, value: $0.element) }
        Chart(pts) { p in
            BarMark(x: .value("Hour", p.hour), y: .value("Busyness", max(p.value, 0.03)), width: .fixed(compact ? 9 : 12))
                .foregroundStyle(p.hour == nowHour ? Color.brandAccent : Color.brandSecondary.opacity(0.35))
                .cornerRadius(2)
        }
        .chartYScale(domain: 0...1)
        .chartYAxis(.hidden)
        .chartXAxis {
            AxisMarks(values: [6, 12, 18]) { v in
                AxisValueLabel {
                    if let h = v.as(Int.self) { Text(h == 12 ? "12 p.m." : (h < 12 ? "\(h) a.m." : "\(h - 12) p.m.")).font(.caption2) }
                }
            }
        }
        .frame(height: (compact ? 56 : 120) * min(baseHeight, 1.8))
        .accessibilityChartDescriptor(HourlyDescriptor(points: pts))
    }
}

struct HourlyDescriptor: AXChartDescriptorRepresentable {
    var points: [HourPoint]
    func makeChartDescriptor() -> AXChartDescriptor {
        let x = AXCategoricalDataAxisDescriptor(title: "Hour", categoryOrder: points.map(\.label))
        let y = AXNumericDataAxisDescriptor(title: "Busyness", range: 0...5, gridlinePositions: [1, 2, 3, 4, 5]) { String(format: "%.0f of 5", $0) }
        let series = AXDataSeriesDescriptor(name: "Typical busyness", isContinuous: false,
                                            dataPoints: points.map { AXDataPoint(x: $0.label, y: Double(Occupancy.level(for: $0.value))) })
        return AXChartDescriptor(title: "Typical busyness by hour", summary: "Busiest around 5 to 7 p.m.", xAxis: x, yAxis: y, additionalAxes: [], series: [series])
    }
    func updateChartDescriptor(_ descriptor: AXChartDescriptor) {}
}

extension AppModel {
    func popularCaption(_ club: Club) -> String {
        let v = popular(club)
        let busiest = (0..<(v.count - 1)).max { v[$0] + v[$0 + 1] < v[$1] + v[$1 + 1] } ?? 13
        func h(_ i: Int) -> String { let hr = i + 4; let h12 = hr % 12 == 0 ? 12 : hr % 12; return "\(h12)" }
        let end = busiest + 6
        let suffix = end >= 12 ? "p.m." : "a.m."
        let quiet = (3..<12).min { v[$0] < v[$1] }.map { q in "\(q + 4 > 12 ? q + 4 - 12 : q + 4) \(q + 4 >= 12 ? "p.m." : "a.m.")" } ?? "mid-morning"
        return "Usually busiest \(h(busiest)) to \(h(busiest + 2)) \(suffix) Quietest around \(quiet)".endingSentence
    }
}
