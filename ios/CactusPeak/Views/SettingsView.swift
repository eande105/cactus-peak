import SwiftUI

struct SettingsView: View {
    @Environment(AppModel.self) private var model
    @Environment(AppRouter.self) private var router
    @State private var confirmSignOut: Bool? = nil
    @State private var confirmReset: Bool? = nil

    var body: some View {
        @Bindable var model = model
        Form {
            Section("Account") {
                LabeledContent("Name", value: model.member.name)
                LabeledContent("Email", value: model.member.email)
                LabeledContent("Member number", value: model.member.memberNumber)
                Button("Sign out", role: .destructive) { confirmSignOut = true }
            }
            Section {
                Picker("Home club", selection: Binding(get: { model.member.homeClubID }, set: { model.setHomeClub($0) })) {
                    ForEach(model.clubs) { Text($0.fullName).tag($0.id) }
                }
                .disabled(model.isTeen || !model.canChangeHomeClub)
            } header: { Text("Home club") } footer: {
                if model.member.plan == .trailhead { Text("You can change your home club once per billing cycle.") }
            }
            Section("Notifications") {
                if !model.notificationsAuthorized { Label("Alerts are off in iOS Settings.", systemImage: "bell.slash").foregroundStyle(Color.statusWarning) }
                Toggle("Waitlist spots", isOn: $model.prefs.notifWaitlist)
                Toggle("Class reminders", isOn: $model.prefs.notifReminders)
                if model.prefs.notifReminders {
                    Picker("Lead time", selection: $model.prefs.reminderLead) { Text("30 min").tag(30); Text("60 min").tag(60); Text("120 min").tag(120) }
                }
                Toggle("Booking changes", isOn: $model.prefs.notifBookingChanges)
                Toggle("Club news", isOn: $model.prefs.notifClubNews)
                Toggle("Billing", isOn: $model.prefs.notifBilling)
                Toggle("Family", isOn: $model.prefs.notifFamily)
                Toggle("Live Activities", isOn: $model.prefs.liveActivities)
                    .onChange(of: model.prefs.liveActivities) { _, _ in LiveActivityManager.shared.sync(model: model) }
            }
            Section {
                Toggle("Keep pass shortcut on", isOn: $model.prefs.keepPassShortcut)
                Toggle("Auto brightness boost", isOn: $model.prefs.brightnessBoost)
                Button("Reset my codes") { model.showToast("New codes made. Old codes stop working.") }
            } header: { Text("Pass") } footer: { Text("The shortcut shows a Show pass bar above the tab bar on every tab.") }
            Section {
                LabeledContent("App icon", value: "Peak")
                Toggle("Haptics", isOn: $model.prefs.haptics)
                LabeledContent("Theme", value: "Matches iOS")
            } header: { Text("Appearance") } footer: { Text("Alternate app icons (Sand, Night, Copper) are not built yet.") }
            Section("Privacy") {
                Button("Location: open iOS Settings") { if let u = URL(string: UIApplication.openSettingsURLString) { UIApplication.shared.open(u) } }
                Toggle("Share usage data", isOn: $model.prefs.shareUsage)
                Button("Download my data") { model.showToast("We'll email a link within a day.") }
            }
            Section("Support") {
                Link("Help", destination: URL(string: "https://app.cactuspeak.example/help")!)
                Link("Contact", destination: URL(string: "tel:4805550100")!)
                Link("Terms", destination: URL(string: "https://app.cactuspeak.example/terms")!)
                Link("Privacy policy", destination: URL(string: "https://app.cactuspeak.example/privacy")!)
            }
            Section {
                LabeledContent("Version", value: "1.0 (1)")
                Text("Archivo and Inter are licensed under the SIL Open Font License 1.1.").font(.footnote).foregroundStyle(Color.textMuted)
            } header: { Text("About") }
            #if DEBUG
            demo
            #endif
        }
        .navigationTitle("Settings").navigationBarTitleDisplayMode(.inline)
        .confirmationDialog("Sign out?", item: $confirmSignOut, titleVisibility: .visible) { _ in
            Button("Sign out", role: .destructive) {
                Task { await model.signOut(); router.paths = [:]; router.selection = .today }
            }
        } message: { _ in Text("This removes your saved bookings and pass codes from this iPhone.") }
    }

    /// Prototype controls so every state in the spec can be reached without a backend.
    private var demo: some View {
        @Bindable var model = model
        return Section {
            Picker("Signed in as", selection: Binding(get: { DemoAccount(email: model.member.email) }, set: { acc in
                guard let acc else { return }
                router.paths = [:]; router.selection = .today
                Task {
                    do { try await model.signInDemo(acc) } catch { model.showToast(BackendError(error).localizedDescription) }
                }
            })) {
                ForEach(DemoAccount.allCases) { Text($0.title).tag(Optional($0)) }
            }
            Toggle("Offline", isOn: $model.offline)
            Toggle("Force a load error", isOn: $model.forceError)
            Toggle("Stale busyness (22 min old)", isOn: $model.staleBusyness)
            Picker("Payment", selection: $model.paymentFailedDay) {
                Text("Paid").tag(0); Text("Failed · day 2").tag(2); Text("Failed · day 9").tag(9); Text("Failed · day 16").tag(16)
            }
            Button("Add a strike (3 pause bookings)") { model.addStrike(); model.showToast("Strikes in 30 days: \(model.strikesIn30)") }
            Button("Clear strikes and pause") { model.strikes = []; model.pauseUntil = nil }
            Button("A spot opens on my waitlist") { model.simulatePromotion() }
            Button("Advance clock 30 minutes") { model.jumpClock(by: 30 * 60) }
            Button("Advance clock 1 day") { model.jumpClock(by: 86400) }
            Button("Reset clock to Tue 5:40 a.m.") { model.restartClock() }
            Button("Reset sample data") { Task { await model.resetDemoHousehold() } }
            Button("Refresh from server") { Task { await model.refreshAll() } }
        } header: { Text("Demo controls") } footer: { Text("Signing in uses the demo password from Secrets.xcconfig. Reset puts this household back to the seeded rows on the server. Clock controls move the demo time for every device of this household, web included. Strikes, payment and offline controls change this iPhone only.") }
    }
}
