import SwiftUI

struct PassView: View {
    @Environment(AppModel.self) private var model
    @Environment(AppRouter.self) private var router
    @Environment(\.scenePhase) private var scenePhase
    @Environment(\.openURL) private var openURL
    @State private var savedBrightness: CGFloat?
    @State private var walletAlert = false
    @State private var showClubPicker = false

    var body: some View {
        NavigationStack {
            TimelineView(.periodic(from: .now, by: 1)) { _ in
                let st = model.passState
                ScrollView {
                    VStack(alignment: .leading, spacing: 20) {
                        stateStrip(st)
                        CheckInPassCard(
                            name: model.member.name, plan: model.member.isTeen ? "Teen pass" : model.member.plan.name,
                            number: model.member.memberNumber, clubName: model.club(model.passClubID).fullName, code: model.passCode(),
                            codeHidden: hidden(st), checkedInText: checkedText(st),
                            onChangeClub: { showClubPicker = true })
                        if !model.member.isTeen { wallet }
                        kidsToday
                        HStack {
                            BusynessMeter(reading: model.busyness(model.club(model.passClubID)), variant: .inline, now: model.now)
                            Spacer()
                            Text(model.club(model.passClubID).fullName).font(.footnote).foregroundStyle(Color.textMuted)
                        }
                        .padding(.horizontal, 4)
                        more
                    }
                    .padding(16)
                }
            }
            .screenBackground()
            .navigationTitle("Check-in pass").navigationBarTitleDisplayMode(.inline)
            .toolbar { ToolbarItem(placement: .confirmationAction) { Button("Done") { router.dismissSheet() }.fontWeight(.semibold) } }
            .sheet(isPresented: $showClubPicker) { ClubSwitcherSheet(mode: .pass).presentationDetents([.medium, .large]) }
            .alert("Wallet pass not available in this build", isPresented: $walletAlert) {
                Button("OK", role: .cancel) {}
            } message: { Text("A Wallet pass needs a signing certificate and a pass type ID. The button, layout and pass design are final.") }
        }
        .onAppear { boost(true) }
        .onDisappear { boost(false) }
        .onChange(of: scenePhase) { _, p in if p != .active { boost(false) } else { boost(true) } }
        .sensoryFeedback(.success, trigger: model.checkedInAt)
        .onChange(of: model.checkedInAt) { _, v in
            if let v { AccessibilityNotification.Announcement("Checked in at \(v.cpTime)").post(); boost(false) }
        }
    }

    private func hidden(_ st: AppModel.PassState) -> Bool {
        switch st { case .frozen, .seeDesk, .closed, .wrongClub: true; default: false }
    }
    private func checkedText(_ st: AppModel.PassState) -> String? {
        if case .checkedIn(let d) = st { return "Checked in · \(d.cpTime)" }
        return nil
    }

    // MARK: State strip
    @ViewBuilder private func stateStrip(_ st: AppModel.PassState) -> some View {
        switch st {
        case .frozen(let end):
            VStack(alignment: .leading, spacing: 8) {
                StatusPill(text: "Frozen until \(end.cpDayMonth)", symbol: "pause.fill", tone: .neutral)
                Button("View freeze") { router.dismissSheet(); router.selection = .you; router.paths[.you] = [.membership, .freeze] }.linkAction()
            }
        case .paymentWarning: Banner(tone: .warning, text: "Payment failed. Update your card.", actionTitle: "Update payment") { router.dismissSheet(); router.selection = .you; router.paths[.you] = [.membership] }
        case .paymentPaused: Banner(tone: .danger, text: "New bookings are paused until you pay. Your pass still works.", actionTitle: nil, action: nil)
        case .seeDesk:
            VStack(alignment: .leading, spacing: 8) {
                Text("See the front desk.").font(.title3.bold()).foregroundStyle(Color.statusDanger)
                Button("Call the front desk · \(model.club(model.passClubID).phone)") { openURL(URL(string: "tel:\(model.club(model.passClubID).phone.filter(\.isNumber))")!) }.primaryAction()
            }
        case .wrongClub(let home): Banner(tone: .warning, text: "Your Trailhead plan covers \(home). A day pass here is $20.", actionTitle: "See plans") { router.dismissSheet(); router.selection = .you; router.paths[.you] = [.membership, .plans] }
        case .closed(let opens): Banner(tone: .info, text: "\(model.club(model.passClubID).fullName) opens at \(opens)", actionTitle: nil, action: nil)
        case .beforeDesk: Banner(tone: .info, text: "Desk opens at 6:00 a.m. Scan at the door reader.", actionTitle: nil, action: nil)
        default:
            if model.offline { StatusPill(text: "Offline code", symbol: "wifi.slash", tone: .neutral) }
        }
    }

    // MARK: Wallet
    @ViewBuilder private var wallet: some View {
        VStack(spacing: 4) {
            if model.walletAdded { Label("In Apple Wallet", systemImage: "checkmark.circle.fill").font(.subheadline.weight(.semibold)).foregroundStyle(Color.statusSuccess).frame(minHeight: 44) }
            else {
                WalletButton { walletAlert = true }.frame(height: 48).frame(maxWidth: .infinity)
                    .accessibilityLabel("Add to Apple Wallet").accessibilityAddTraits(.isButton)
            }
        }
    }

    @ViewBuilder private var kidsToday: some View {
        let kids = model.upcomingBookings.filter { $0.kind == .kids && AZ.cal.isDate($0.start, inSameDayAs: model.now) }
        if let k = kids.first {
            VStack(alignment: .leading, spacing: 4) {
                Text("Kids club today: \(k.detail) · \(k.start.cpTimeShort)–\(k.end.cpTimeShort)").font(.subheadline.weight(.semibold))
                Text("Show this pass at the kids club desk.").font(.footnote).foregroundStyle(Color.textMuted)
            }.cardStyle(padding: 14)
        }
    }

    private var more: some View {
        VStack(spacing: 0) {
            if model.guestPassesLeft > 0 || !model.member.isTeen {
                Button { router.dismissSheet(); router.selection = .you; router.paths[.you] = [.guestPasses] } label: {
                    HStack { Label("Guest pass", systemImage: "person.badge.plus"); Spacer(); Image(systemName: "chevron.right").font(.footnote.weight(.semibold)).foregroundStyle(Color.textMuted) }.frame(minHeight: 48).contentShape(Rectangle())
                }.buttonStyle(.plain)
                Divider()
            }
            Button { router.dismissSheet(); router.selection = .you; router.paths[.you] = [.settings] } label: {
                HStack { Label("Pass settings", systemImage: "gearshape"); Spacer(); Image(systemName: "chevron.right").font(.footnote.weight(.semibold)).foregroundStyle(Color.textMuted) }.frame(minHeight: 48).contentShape(Rectangle())
            }.buttonStyle(.plain)
            #if DEBUG
            Divider()
            Button { model.checkIn() } label: {
                HStack { Label("Demo: simulate a desk scan", systemImage: "dot.radiowaves.left.and.right"); Spacer() }.frame(minHeight: 48).contentShape(Rectangle()).foregroundStyle(Color.textMuted)
            }.buttonStyle(.plain)
            #endif
        }
        .padding(.horizontal, 16).background(Color.surface, in: RoundedRectangle(cornerRadius: 14, style: .continuous))
        .overlay(RoundedRectangle(cornerRadius: 14, style: .continuous).strokeBorder(Color.hairline, lineWidth: 1))
    }

    // MARK: Brightness and idle timer
    private func boost(_ on: Bool) {
        let scene = UIApplication.shared.connectedScenes.compactMap { $0 as? UIWindowScene }.first
        guard let screen = scene?.screen else { return }
        if on, model.prefs.brightnessBoost, !model.checkedInToday {
            if savedBrightness == nil { savedBrightness = screen.brightness }
            screen.brightness = 1.0
            UIApplication.shared.isIdleTimerDisabled = true
        } else {
            if let s = savedBrightness { screen.brightness = s; savedBrightness = nil }
            UIApplication.shared.isIdleTimerDisabled = false
        }
    }
}
