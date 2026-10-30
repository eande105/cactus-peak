import SwiftUI
import Charts

struct ProgressScreen: View {
    @Environment(AppModel.self) private var model
    @Environment(AppRouter.self) private var router
    @State private var range = 12
    @State private var tableVisits = false
    @State private var tableCats = false
    @ScaledMetric(relativeTo: .body) private var chartH: CGFloat = 180

    var body: some View {
        let s = model.streak
        let weeks = model.weeklyCounts(range)
        ScrollView {
            VStack(alignment: .leading, spacing: 24) {
                if model.visits.isEmpty {
                    EmptyState(title: "Your first visit starts the streak", message: "Check in once and this page fills in.", symbol: "figure.walk", actionTitle: "Book a class") { router.selection = .book }
                } else {
                    summary(s)
                    visitsChart(weeks)
                    categoryChart
                    calendar
                    totals
                }
            }.padding(16)
        }
        .screenBackground()
        .navigationTitle("Progress").navigationBarTitleDisplayMode(.inline)
        .toolbar {
            ToolbarItem(placement: .topBarTrailing) {
                Menu { Picker("Range", selection: $range) { Text("4 weeks").tag(4); Text("12 weeks").tag(12); Text("1 year").tag(52) } } label: { Image(systemName: "calendar") }.accessibilityLabel("Range")
            }
        }
    }

    private func summary(_ s: StreakInfo) -> some View {
        let ws = model.weekStart(model.now)
        let dots: [Bool] = (0..<7).map { i in let d = ws.addingDays(i); return model.visits.contains { $0 >= d && $0 < d.addingDays(1) && $0 <= model.now } }
        return VStack(alignment: .leading, spacing: 16) {
            HStack(alignment: .firstTextBaseline, spacing: 12) {
                Text("\(s.weeks)").font(.archivoExtraBold(64, relativeTo: .largeTitle)).monospacedDigit()
                VStack(alignment: .leading) {
                    Label("weeks in a row", systemImage: "leaf.fill").font(.headline).foregroundStyle(Color.statusSuccess)
                    Text("Best: \(s.best) weeks").font(.subheadline).foregroundStyle(Color.textMuted)
                }
            }
            .accessibilityElement(children: .combine)
            ProgressRibs(value: s.thisWeek, goal: model.weeklyGoal, hero: true)
            Button { router.present(.goal) } label: { Label("Weekly goal: \(model.weeklyGoal)", systemImage: "target") }.linkAction()
            VisitStreakStrip(weeks: s.weeks, visited: dots, todayIndex: AZ.cal.dateComponents([.day], from: ws, to: model.now.startOfAZDay).day ?? 0, thisWeek: s.thisWeek, showHeader: false)
        }
        .cardStyle()
    }

    private func visitsChart(_ weeks: [(start: Date, count: Int)]) -> some View {
        let goal = model.weeklyGoal
        let avg = Double(weeks.map(\.count).reduce(0, +)) / Double(max(weeks.count, 1))
        let met = weeks.filter { $0.count >= goal }.count
        return VStack(alignment: .leading, spacing: 10) {
            Text("Visits per week").sectionHeader()
            if tableVisits {
                VStack(spacing: 0) { ForEach(weeks, id: \.start) { w in LabeledContent("Week of \(w.start.cpDayMonth)", value: "\(w.count)").padding(.vertical, 6); Divider() } }
            } else {
                Chart {
                    ForEach(weeks, id: \.start) { w in
                        BarMark(x: .value("Week", w.start, unit: .weekOfYear), y: .value("Visits", w.count))
                            .foregroundStyle(w.count >= goal ? Color.statusSuccess : Color.brandAccent)
                            .annotation(position: .top) { if w.count >= goal && weeks.count <= 12 { Image(systemName: "checkmark").font(.caption2.weight(.bold)).foregroundStyle(Color.statusSuccess) } }
                    }
                    RuleMark(y: .value("Goal", goal)).lineStyle(StrokeStyle(lineWidth: 1.5, dash: [4, 3])).foregroundStyle(Color.textMuted)
                        .annotation(position: .top, alignment: .leading) { Text("Goal \(goal)").font(.caption).foregroundStyle(Color.textMuted) }
                }
                .chartYScale(domain: 0...7)
                .chartXAxis { AxisMarks(values: .stride(by: .weekOfYear, count: weeks.count > 12 ? 8 : 2)) { _ in AxisValueLabel(format: .dateTime.month(.abbreviated).day()) } }
                .frame(height: chartH)
                .accessibilityChartDescriptor(VisitsDescriptor(weeks: weeks.map { ($0.start.cpDayMonth, $0.count) }, summary: String(format: "Average %.1f visits a week. Goal %d met in %d of %d weeks.", avg, goal, met, weeks.count)))
            }
            Button(tableVisits ? "View as chart" : "View as table") { tableVisits.toggle() }.linkAction().font(.subheadline)
        }
        .cardStyle()
    }

    private var categoryChart: some View {
        let data = model.attendedByCategory(weeks: range)
        return VStack(alignment: .leading, spacing: 10) {
            Text("What you do").sectionHeader()
            if data.isEmpty { Text("Classes you attend show here.").font(.subheadline).foregroundStyle(Color.textMuted) }
            else if tableCats {
                ForEach(data, id: \.0) { LabeledContent($0.0.title, value: "\($0.1)") }
            } else {
                Chart(data, id: \.0) { c in
                    BarMark(x: .value("Classes", c.1), y: .value("Category", c.0.title))
                        .foregroundStyle(c.0.color)
                        .annotation(position: .trailing) { HStack(spacing: 4) { Image(systemName: c.0.symbol).imageScale(.small); Text("\(c.1)").monospacedDigit() }.font(.caption.weight(.semibold)).foregroundStyle(Color.textPrimary) }
                }
                .chartXAxis(.hidden)
                .frame(height: max(chartH * 0.9, CGFloat(data.count) * 44))
                .accessibilityChartDescriptor(VisitsDescriptor(weeks: data.map { ($0.0.title, $0.1) }, summary: "Classes attended by category."))
            }
            Button(tableCats ? "View as chart" : "View as table") { tableCats.toggle() }.linkAction().font(.subheadline)
        }
        .cardStyle()
    }

    private var calendar: some View {
        let visitDays = Set(model.visits.filter { $0 <= model.now }.map(\.cpDayKey))
        let classDays = Set(model.bookings.filter { $0.status == .attended }.map { $0.start.cpDayKey })
        return VisitMonthGrid(month: model.now, visitDays: visitDays, classDays: classDays).cardStyle()
    }

    private var totals: some View {
        let from = model.weekStart(model.now).addingDays(-7 * 11)
        let visits = model.visits.filter { $0 >= from && $0 <= model.now }.count
        let classes = model.bookings.filter { $0.status == .attended && $0.start >= from }
        let fav = Dictionary(grouping: classes, by: \.title).max { $0.value.count < $1.value.count }?.key ?? "None yet"
        let favClub = Dictionary(grouping: classes, by: \.clubID).max { $0.value.count < $1.value.count }.map { model.club($0.key).shortName } ?? "None yet"
        return Grid(horizontalSpacing: 12, verticalSpacing: 12) {
            GridRow { tile("Visits", "\(visits)"); tile("Classes", "\(classes.count)") }
            GridRow { tile("Favourite class", fav); tile("Favourite club", favClub) }
        }
    }
    private func tile(_ label: String, _ value: String) -> some View {
        VStack(alignment: .leading, spacing: 4) {
            Text(label.uppercased()).eyebrowStyle()
            Text(value).font(.archivoBold(22, relativeTo: .title2)).lineLimit(2).fixedSize(horizontal: false, vertical: true)
        }
        .frame(maxWidth: .infinity, alignment: .leading).cardStyle(padding: 14)
        .accessibilityElement(children: .combine)
    }
}

struct VisitsDescriptor: AXChartDescriptorRepresentable {
    var weeks: [(String, Int)]
    var summary: String
    func makeChartDescriptor() -> AXChartDescriptor {
        let x = AXCategoricalDataAxisDescriptor(title: "Week starting", categoryOrder: weeks.map(\.0))
        let maxV = Double(max(weeks.map(\.1).max() ?? 1, 1))
        let y = AXNumericDataAxisDescriptor(title: "Visits", range: 0...maxV, gridlinePositions: []) { String(format: "%.0f", $0) }
        let series = AXDataSeriesDescriptor(name: "Visits per week", isContinuous: false, dataPoints: weeks.map { AXDataPoint(x: $0.0, y: Double($0.1)) })
        return AXChartDescriptor(title: "Visits per week", summary: summary, xAxis: x, yAxis: y, additionalAxes: [], series: [series])
    }
    func updateChartDescriptor(_ descriptor: AXChartDescriptor) {}
}
