import SwiftUI
import CoreImage.CIFilterBuiltins

enum QR {
    static let context = CIContext()
    static func image(_ text: String) -> UIImage {
        let f = CIFilter.qrCodeGenerator()
        f.message = Data(text.utf8)
        f.correctionLevel = "M"
        guard let out = f.outputImage?.transformed(by: CGAffineTransform(scaleX: 12, y: 12)),
              let cg = context.createCGImage(out, from: out.extent) else { return UIImage() }
        return UIImage(cgImage: cg)
    }
}

/// The pass card. Night surface in both modes. The QR sits on pure white with a 16 pt quiet zone.
struct CheckInPassCard: View {
    var name: String
    var plan: String
    var number: String
    var clubName: String
    var code: String
    var codeHidden: Bool
    var checkedInText: String?
    var onChangeClub: () -> Void
    @Environment(\.dynamicTypeSize) private var dts
    @Environment(\.accessibilityReduceMotion) private var reduceMotion
    @ScaledMetric(relativeTo: .body) private var qrSize: CGFloat = 248

    var body: some View {
        VStack(alignment: .leading, spacing: 14) {
            HStack(alignment: .center) {
                Image("LogoHorizontalReversed").resizable().scaledToFit().frame(height: 26).accessibilityHidden(true)
                Spacer()
                Text(plan).font(.footnote.weight(.bold)).foregroundStyle(Color.nightSurface)
                    .padding(.horizontal, 10).padding(.vertical, 4).background(Color.dawnCopper, in: Capsule())
            }
            Text(name).font(.archivoSemiBold(24, relativeTo: .title2)).foregroundStyle(Color.nightOnSurface).fixedSize(horizontal: false, vertical: true)
            VStack(alignment: .leading, spacing: 2) {
                Text("MEMBER NUMBER").eyebrowStyle(Color.nightOnSurface.opacity(0.75))
                Text(number).font(.archivoBold(36, relativeTo: .largeTitle)).monospacedDigit().foregroundStyle(Color.nightOnSurface)
                    .accessibilityLabel(number.map { String($0) }.joined(separator: " "))
            }
            ZStack {
                RoundedRectangle(cornerRadius: 10, style: .continuous).fill(Color.white)
                if let checkedInText {
                    VStack(spacing: 8) {
                        Image(systemName: "checkmark.circle").symbolRenderingMode(.hierarchical).font(.largeTitle).foregroundStyle(Color.statusSuccess)
                        Text(checkedInText).font(.archivoBold(26, relativeTo: .title2)).foregroundStyle(Color(hex: 0x1D1B17)).multilineTextAlignment(.center)
                    }.padding(16)
                } else if codeHidden {
                    Text("Code hidden").font(.headline).foregroundStyle(Color(hex: 0x6B6457)).padding(16)
                } else {
                    Image(uiImage: QR.image(code)).interpolation(.none).resizable().scaledToFit().padding(16)
                        .accessibilityLabel("Check-in code for \(name). Show it to the scanner at the front desk.")
                }
            }
            .frame(width: min(max(qrSize + 32, 240), 300), height: min(max(qrSize + 32, 240), 300))
            .frame(maxWidth: .infinity)
            VStack(alignment: .leading, spacing: 4) {
                Text(checkedInText != nil ? "Scan accepted" : "Scan at the front desk").font(.subheadline.weight(.semibold)).foregroundStyle(Color.nightOnSurface)
                    .frame(maxWidth: .infinity)
                    .multilineTextAlignment(.center)
                if checkedInText == nil {
                    ViewThatFits(in: .horizontal) {
                        HStack { Text("Checking in at \(clubName)"); changeButton }
                        VStack(alignment: .leading) { Text("Checking in at \(clubName)"); changeButton }
                    }
                    .font(.subheadline).foregroundStyle(Color.nightOnSurface)
                    .frame(maxWidth: .infinity)
                } else {
                    Text(clubName).font(.subheadline).foregroundStyle(Color.nightOnSurface).frame(maxWidth: .infinity)
                }
            }
            if checkedInText == nil {
                Text(reduceMotion ? "Refreshes every minute" : "Code refreshes every minute").font(.caption).foregroundStyle(Color.nightOnSurface.opacity(0.7))
                    .frame(maxWidth: .infinity).accessibilityHidden(true)
            }
        }
        .padding(24)
        .background(Color.nightSurface, in: RoundedRectangle(cornerRadius: 28, style: .continuous))
        .accessibilityElement(children: .contain)
    }

    private var changeButton: some View {
        Button("Change", action: onChangeClub).font(.subheadline.weight(.semibold)).foregroundStyle(Color.dawnCopper).frame(minHeight: 44)
    }
}

/// Compact pass row for the You tab: name, number, club and a Show pass button. No QR.
struct CheckInPassCompact: View {
    var name: String
    var number: String
    var clubName: String
    var action: () -> Void
    var body: some View {
        HStack(spacing: 14) {
            RibPeakShape().fill(Color.dawnCopper).frame(width: 34, height: 34).padding(8)
                .background(Color.nightSurface, in: RoundedRectangle(cornerRadius: 12, style: .continuous)).accessibilityHidden(true)
            VStack(alignment: .leading, spacing: 2) {
                Text("Check-in pass").font(.headline).lineLimit(1)
                Text(number).font(.subheadline).foregroundStyle(Color.textMuted).monospacedDigit()
            }
            Spacer(minLength: 8)
            Button(action: action) { Text("Show pass").lineLimit(1).fixedSize() }.primaryAction()
        }
        .accessibilityElement(children: .combine)
        .accessibilityAction(named: "Show pass", action)
    }
}

// MARK: - Visit streak

struct VisitStreakStrip: View {
    var weeks: Int
    var visited: [Bool]
    var todayIndex: Int
    var thisWeek: Int
    var showHeader = true
    private let letters = ["M", "T", "W", "T", "F", "S", "S"]
    var body: some View {
        VStack(alignment: .leading, spacing: 10) {
            if showHeader { HStack {
                Label {
                    Text(weeks == 0 ? "Your first visit starts the streak" : "\(weeks)-week streak").font(.headline).monospacedDigit()
                } icon: { Image(systemName: "leaf.fill").foregroundStyle(Color.statusSuccess) }
                Spacer()
                Text("\(thisWeek) visit\(thisWeek == 1 ? "" : "s") this week").font(.footnote).foregroundStyle(Color.textMuted)
            } }
            HStack(spacing: 0) {
                ForEach(0..<7, id: \.self) { i in
                    VStack(spacing: 4) {
                        Text(letters[i]).font(.caption2.weight(.semibold)).foregroundStyle(Color.textMuted)
                        dot(i)
                    }.frame(maxWidth: .infinity)
                }
            }
        }
        .accessibilityElement(children: .ignore)
        .accessibilityLabel("\(weeks)-week streak. \(thisWeek) visits this week. " + zip(["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"], visited).filter { $0.1 }.map(\.0).joined(separator: ", ") )
    }
    @ViewBuilder private func dot(_ i: Int) -> some View {
        let v = visited[i]
        ZStack {
            if v {
                Circle().fill(Color.nightSurface)
                Image(systemName: "checkmark").font(.caption.weight(.bold)).foregroundStyle(Color.nightOnSurface)
            } else if i == todayIndex {
                Circle().strokeBorder(Color.brandAccent, lineWidth: 2)
            } else {
                Circle().strokeBorder(Color.hairline, lineWidth: i < todayIndex ? 1.5 : 1)
            }
        }
        .frame(width: 32, height: 32)
    }
}

struct VisitMonthGrid: View {
    var month: Date
    var visitDays: Set<String>
    var classDays: Set<String>
    private let letters = ["M", "T", "W", "T", "F", "S", "S"]
    var body: some View {
        let first = AZ.cal.date(from: AZ.cal.dateComponents([.year, .month], from: month))!
        let range = AZ.cal.range(of: .day, in: .month, for: first)!
        let offset = (AZ.cal.component(.weekday, from: first) + 5) % 7
        VStack(alignment: .leading, spacing: 6) {
            Text(month.cpFormat("MMMM yyyy")).font(.headline)
            Grid(horizontalSpacing: 4, verticalSpacing: 4) {
                GridRow { ForEach(0..<7, id: \.self) { Text(letters[$0]).font(.caption2.weight(.semibold)).foregroundStyle(Color.textMuted).frame(maxWidth: .infinity) } }
                ForEach(0..<6, id: \.self) { row in
                    GridRow {
                        ForEach(0..<7, id: \.self) { col in
                            let day = row * 7 + col - offset + 1
                            if range.contains(day), let d = AZ.cal.date(byAdding: .day, value: day - 1, to: first) {
                                let key = d.cpDayKey
                                ZStack {
                                    if visitDays.contains(key) { Circle().strokeBorder(Color.brandSecondary, lineWidth: 2) }
                                    Text("\(day)").font(.footnote).monospacedDigit()
                                    if classDays.contains(key) { Circle().fill(Color.brandAccent).frame(width: 5, height: 5).offset(y: 12) }
                                }
                                .frame(maxWidth: .infinity, minHeight: 34)
                                .accessibilityElement(children: .ignore)
                                .accessibilityLabel("\(d.cpFormat("MMMM d")), \(visitDays.contains(key) ? "visited" : "no visit")")
                            } else { Color.clear.frame(height: 34) }
                        }
                    }
                }
            }
        }
    }
}

// MARK: - Plan card

struct PlanCard: View {
    enum Variant { case plain, current, change(delta: Int, upgrade: Bool) }
    var plan: PlanTier
    var variant: Variant
    var highlighted = false
    var frozenUntil: Date?
    var note: String?
    var action: () -> Void = {}
    @Environment(\.colorScheme) private var scheme

    private func priceText(_ fg: Color) -> some View {
        HStack(alignment: .firstTextBaseline, spacing: 2) {
            Text("$\(plan.price)").font(.archivoBold(36, relativeTo: .largeTitle)).monospacedDigit()
            Text("/mo").font(.subheadline)
        }.foregroundStyle(fg).lineLimit(1)
    }

    var body: some View {
        let night = highlighted
        let fg: Color = night ? .nightOnSurface : .textPrimary
        let muted: Color = night ? .nightOnSurface.opacity(0.78) : .textMuted
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                if case .current = variant { StatusPill(text: "Current plan", symbol: "checkmark", tone: .info) }
                else if plan == .ridge { Text("MOST POPULAR").eyebrowStyle(night ? Color.dawnCopper : Color.linkText) }
                Spacer()
                if let frozenUntil { StatusPill(text: "Frozen until \(frozenUntil.cpDayMonth)", symbol: "pause.fill", tone: .neutral) }
            }
            ViewThatFits(in: .horizontal) {
                HStack(alignment: .firstTextBaseline) {
                    Text(plan.name).font(.archivoExtraBold(28, relativeTo: .title)).foregroundStyle(fg).lineLimit(1)
                    Spacer(minLength: 8)
                    priceText(fg)
                }
                VStack(alignment: .leading, spacing: 2) {
                    Text(plan.name).font(.archivoExtraBold(28, relativeTo: .title)).foregroundStyle(fg)
                    priceText(fg)
                }
            }
            if case .change(let delta, let up) = variant {
                Text(up ? "+$\(delta)/mo" : "−$\(abs(delta))/mo").font(.subheadline.weight(.semibold)).foregroundStyle(night ? Color.dawnCopper : Color.linkText)
            }
            VStack(alignment: .leading, spacing: 6) {
                ForEach(plan.perks, id: \.self) { p in
                    Label { Text(p).foregroundStyle(fg) } icon: { Image(systemName: "checkmark").foregroundStyle(night ? Color.dawnCopper : Color.statusSuccess) }
                        .font(.subheadline)
                }
            }
            switch variant {
            case .current:
                Label("Your plan", systemImage: "checkmark").font(.subheadline.weight(.semibold)).foregroundStyle(Color.textMuted)
            case .change(_, let up):
                if up { Button("Switch to \(plan.name)", action: action).secondaryAction(full: true) }
                else { Button("Switch to \(plan.name)", action: action).secondaryAction(full: true) }
            case .plain: EmptyView()
            }
            if let note { Text(note).font(.footnote).foregroundStyle(muted) }
        }
        .padding(18)
        .background(night ? Color.nightSurface : Color.surface, in: RoundedRectangle(cornerRadius: 14, style: .continuous))
        .overlay(RoundedRectangle(cornerRadius: 14, style: .continuous).strokeBorder(
            { if case .current = variant, !night { return Color.brandAccent } else { return night ? Color.clear : Color.hairline } }(), lineWidth: { if case .current = variant, !night { return 1.5 } else { return 1 } }()))
        .accessibilityElement(children: .contain)
    }
}

