import SwiftUI

/// Welcome, sign in and the five onboarding steps. Presented as a full-screen cover until both are done.
struct WelcomeFlow: View {
    @Environment(AppModel.self) private var model
    var body: some View {
        if !model.signedIn { WelcomeView() }
        else { OnboardingFlow() }
    }
}

struct WelcomeView: View {
    @Environment(AppModel.self) private var model
    @Environment(\.openURL) private var openURL
    @Environment(\.dynamicTypeSize) private var dts
    @State private var showSignIn = false
    @State private var demoBusy = false
    @State private var message: String?

    var body: some View {
        ZStack(alignment: .bottom) {
            // The dark appearance keeps the light sign-in text readable in both modes.
            ClubExteriorArt(slug: "mesa-red-mountain", variant: .tall)
                .environment(\.colorScheme, .dark)
                .ignoresSafeArea()
            ScrollView {
                VStack(alignment: .leading, spacing: 0) {
                    Spacer(minLength: dts.isAccessibilitySize ? 24 : 120)
                    VStack(alignment: .leading, spacing: 16) {
                        RibPeakShape().fill(Color.dawnCopper).frame(width: 56, height: 56).padding(.top, 8).accessibilityHidden(true)
                        Text("CACTUS PEAK ATHLETIC").eyebrowStyle(Color.nightOnSurface)
                        Text("Climb at your own pace.").font(.archivoExtraBold(34, relativeTo: .largeTitle)).foregroundStyle(Color.nightOnSurface)
                            .fixedSize(horizontal: false, vertical: true).accessibilityAddTraits(.isHeader)
                        VStack(spacing: 12) {
                            Button { showSignIn = true } label: {
                                Label("Sign in with email", systemImage: "envelope.fill")
                                    .font(.body.weight(.semibold)).foregroundStyle(Color.nightSurface).frame(maxWidth: .infinity, minHeight: 36)
                            }
                            .buttonStyle(.glassProminent).tint(Color.brandAccent)
                            #if DEBUG
                            if BackendConfig.current?.demoPassword != nil {
                                Menu {
                                    ForEach(DemoAccount.allCases) { acc in
                                        Button(acc.title) { signInDemo(acc) }
                                    }
                                } label: {
                                    HStack { if demoBusy { ProgressView() }; Text("Demo account") }
                                        .font(.body.weight(.semibold)).frame(maxWidth: .infinity, minHeight: 36)
                                }
                                .buttonStyle(.glass).foregroundStyle(Color.white).disabled(demoBusy)
                            }
                            #endif
                            if let message { Label(message, systemImage: "info.circle").font(.footnote).foregroundStyle(Color.nightOnSurface) }
                            Button { openURL(URL(string: "https://cactuspeak.example/try")!) } label: {
                                Text("Not a member yet? Try a 3-day pass").font(.subheadline).underline().foregroundStyle(Color.nightOnSurface).frame(minHeight: 44)
                            }.frame(maxWidth: .infinity)
                        }
                        .padding(.bottom, 8)
                    }
                    .padding(.horizontal, 16)
                    .padding(.bottom, 8)
                    .frame(maxWidth: .infinity)
                    .background(Color.nightSurface.opacity(0.8).ignoresSafeArea(edges: .bottom))
                }
            }
            .scrollBounceBehavior(.basedOnSize)
            .defaultScrollAnchor(.bottom)
        }
        .preferredColorScheme(.dark)
        .sheet(isPresented: $showSignIn) { PasswordSignInSheet() }
    }

    private func signInDemo(_ acc: DemoAccount) {
        demoBusy = true
        message = nil
        Task {
            do { try await model.signInDemo(acc) } catch { message = BackendError(error).localizedDescription }
            demoBusy = false
        }
    }
}

/// Email and password sign-in against Supabase Auth. Wrong details and network failures read differently.
struct PasswordSignInSheet: View {
    @Environment(AppModel.self) private var model
    @Environment(\.dismiss) private var dismiss
    @State private var email = ""
    @State private var password = ""
    @State private var busy = false
    @State private var error: String?
    @FocusState private var focus: Field?
    enum Field { case email, password }

    private var canSubmit: Bool { email.contains("@") && !password.isEmpty && !busy }

    var body: some View {
        NavigationStack {
            Form {
                Section {
                    TextField("Email", text: $email)
                        .textContentType(.username).keyboardType(.emailAddress).textInputAutocapitalization(.never).autocorrectionDisabled()
                        .focused($focus, equals: .email).submitLabel(.next).onSubmit { focus = .password }
                    SecureField("Password", text: $password)
                        .textContentType(.password).focused($focus, equals: .password).submitLabel(.go).onSubmit { submit() }
                } footer: {
                    Text("Use the email on your membership.")
                }
                if let error {
                    Section { Label(error, systemImage: "xmark.circle.fill").foregroundStyle(Color.statusDanger) }
                }
            }
            .navigationTitle("Sign in").navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) { Button("Cancel") { dismiss() } }
                ToolbarItem(placement: .confirmationAction) {
                    if busy { ProgressView() } else { Button("Sign in") { submit() }.disabled(!canSubmit) }
                }
            }
            .onAppear { focus = .email }
        }
        .presentationDetents([.medium, .large])
    }

    private func submit() {
        guard canSubmit else { return }
        busy = true
        error = nil
        Task {
            do {
                try await model.signIn(email: email, password: password)
                dismiss()
            } catch {
                self.error = BackendError(error).localizedDescription
                password = ""
                focus = .password
            }
            busy = false
        }
    }
}

// MARK: - Onboarding

struct OnboardingFlow: View {
    @Environment(AppModel.self) private var model
    @Environment(AppRouter.self) private var router
    @AppStorage("cp.onboardStep") private var step = 1
    @State private var selectedClub: ClubID?
    @State private var alertsAsked = false

    var body: some View {
        @Bindable var model = model
        NavigationStack {
            VStack(spacing: 0) {
                VStack(alignment: .leading, spacing: 6) {
                    RibMeter(value: step, tone: .brand, size: .md, peak: false)
                    Text("Step \(step) of 5").font(.footnote).foregroundStyle(Color.textMuted)
                }
                .frame(maxWidth: .infinity, alignment: .leading).padding(.horizontal, 16).padding(.vertical, 8)
                .accessibilityElement(children: .combine)
                Group {
                    switch step {
                    case 1: homeClub
                    case 2: interests
                    case 3: alerts
                    case 4: wallet
                    default: ready
                    }
                }
            }
            .screenBackground()
            .toolbar {
                if step > 1 { ToolbarItem(placement: .topBarLeading) { Button { step -= 1 } label: { Label("Back", systemImage: "chevron.left") } } }
            }
            .safeAreaInset(edge: .bottom) { bottomBar }
            .navigationBarTitleDisplayMode(.inline)
        }
        .onAppear { selectedClub = model.member.homeClubID }
    }

    // Steps
    private var homeClub: some View {
        List {
            Section {
                Text("Pick your home club").font(.archivoExtraBold(28, relativeTo: .title)).listRowBackground(Color.clear).accessibilityAddTraits(.isHeader)
                Text("You can change this any time.").foregroundStyle(Color.textMuted).listRowBackground(Color.clear)
                Button { selectedClub = model.clubs.min { $0.distanceMiles < $1.distanceMiles }?.id } label: { Label("Use my location", systemImage: "location") }.secondaryAction().listRowBackground(Color.clear)
            }
            Section {
                ForEach(model.clubs.sorted { $0.distanceMiles < $1.distanceMiles }) { c in
                    Button { selectedClub = c.id } label: {
                        ClubCard(club: c, reading: model.busyness(c), now: model.now, variant: .listRow, closest: c.distanceMiles == model.clubs.map(\.distanceMiles).min(), selected: selectedClub == c.id)
                    }.buttonStyle(.plain)
                    .listRowBackground(Color.surface)
                    .overlay(RoundedRectangle(cornerRadius: 8).strokeBorder(selectedClub == c.id ? Color.brandAccent : .clear, lineWidth: 2))
                }
            } footer: { Text("Trailhead covers one home club. You can change it once per billing cycle. Ridge and Summit cover all 5.") }
        }
        .listStyle(.insetGrouped).scrollContentBackground(.hidden)
    }

    private var interests: some View {
        List {
            Section {
                ForEach(ClassCategory.allCases) { c in
                    let on = model.prefs.interests.contains(c)
                    Button { if on { model.prefs.interests.remove(c) } else { model.prefs.interests.insert(c) } } label: {
                        HStack(alignment: .top) {
                            // At large text the icon stacks above the name, so a word is never split across lines.
                            ViewThatFits(in: .horizontal) {
                                Label { Text(c.title).foregroundStyle(Color.textPrimary).fixedSize() } icon: { Image(systemName: c.symbol).foregroundStyle(c.textColor) }
                                VStack(alignment: .leading, spacing: 4) {
                                    Image(systemName: c.symbol).foregroundStyle(c.textColor)
                                    Text(c.title).foregroundStyle(Color.textPrimary).minimumScaleFactor(0.6)
                                }
                            }
                            Spacer()
                            if on { Image(systemName: "checkmark").foregroundStyle(Color.brandAccent).fontWeight(.bold) }
                        }.frame(minHeight: 44).contentShape(Rectangle())
                    }
                    .buttonStyle(.plain).accessibilityAddTraits(on ? .isSelected : [])
                }
            } header: {
                VStack(alignment: .leading, spacing: 4) {
                    Text("What do you like?").font(.archivoExtraBold(28, relativeTo: .title)).foregroundStyle(Color.textPrimary).textCase(nil)
                    Text("Pick as many as you want.").font(.body).foregroundStyle(Color.textMuted).textCase(nil)
                }.padding(.bottom, 8)
            }
        }
        .listStyle(.insetGrouped).scrollContentBackground(.hidden)
    }

    private var alerts: some View {
        @Bindable var model = model
        return Form {
            Section { Text("Alerts").font(.archivoExtraBold(28, relativeTo: .title)).listRowBackground(Color.clear) }
            Section {
                Toggle("Waitlist spots", isOn: $model.prefs.notifWaitlist)
                Toggle("Class reminders · \(model.prefs.reminderLead) min before", isOn: $model.prefs.notifReminders)
                Toggle("Club news", isOn: $model.prefs.notifClubNews)
                Toggle("Show next class on Lock Screen", isOn: $model.prefs.liveActivities)
            } footer: { Text("Waitlist spot? You get 30 minutes to confirm.") }
        }
        .scrollContentBackground(.hidden)
    }

    private var wallet: some View {
        ScrollView {
            VStack(spacing: 20) {
                Text("Your pass, ready").font(.archivoExtraBold(28, relativeTo: .title)).frame(maxWidth: .infinity, alignment: .leading).accessibilityAddTraits(.isHeader)
                VStack(alignment: .leading, spacing: 6) {
                    Image("LogoHorizontalReversed").resizable().scaledToFit().frame(height: 22).accessibilityHidden(true)
                    Text(model.member.name).font(.archivoSemiBold(20, relativeTo: .title3)).foregroundStyle(Color.nightOnSurface)
                    Text(model.member.memberNumber).font(.archivoBold(28, relativeTo: .title)).monospacedDigit().foregroundStyle(Color.nightOnSurface)
                }.frame(maxWidth: .infinity, alignment: .leading).nightCard(padding: 20, radius: 24)
                WalletButton { model.walletAdded = false }.frame(height: 50)
                Text("Open your pass from the Lock Screen. No app needed.").font(.subheadline).foregroundStyle(Color.textMuted)
            }.padding(16)
        }
    }

    private var ready: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 16) {
                Text("You're set").font(.archivoExtraBold(28, relativeTo: .title)).accessibilityAddTraits(.isHeader)
                VStack(spacing: 0) {
                    LabeledContent("Home club", value: model.club(selectedClub ?? model.member.homeClubID).fullName).padding(.vertical, 10); Divider()
                    LabeledContent("Interests", value: model.prefs.interests.isEmpty ? "All" : model.prefs.interests.map(\.title).sorted().joined(separator: ", ")).padding(.vertical, 10); Divider()
                    LabeledContent("Alerts", value: model.prefs.notifWaitlist ? "On" : "Off").padding(.vertical, 10)
                }
                .padding(.horizontal, 16).background(Color.surface, in: RoundedRectangle(cornerRadius: 14))
                if let s = suggestion {
                    Text("Try this tomorrow").sectionHeader()
                    ClassFeatureCard(data: model.rowData(s))
                }
            }.padding(16)
        }
    }
    private var suggestion: ClassSession? {
        let d = model.now.startOfAZDay.addingDays(1)
        return model.sessions(club: selectedClub ?? model.member.homeClubID, day: d).first { model.prefs.interests.contains($0.category) } ?? model.sessions(club: selectedClub ?? model.member.homeClubID, day: d).first
    }

    @ViewBuilder private var bottomBar: some View {
        VStack(spacing: 4) {
            Button(primaryTitle) { advance() }.primaryAction(full: true).disabled(step == 1 && selectedClub == nil)
            if step > 1 && step < 5 { Button(step == 3 ? "Not now" : (step == 4 ? "Maybe later" : "Skip")) { step += 1 }.linkAction() }
        }
        .padding(.horizontal, 16).padding(.top, 8).padding(.bottom, 8).background(.bar)
    }
    private var primaryTitle: String { switch step { case 1, 2: "Continue"; case 3: "Turn on alerts"; case 4: "Continue"; default: "Go to Today" } }
    private func advance() {
        switch step {
        case 1: if let c = selectedClub { model.setHomeClub(c); router.viewingClubID = model.member.homeClubID }; step = 2
        case 3: Task { model.notificationsAuthorized = await NotificationSupport.shared.requestAuthorization(); step = 4 }
        case 5:
            model.onboarded = true; step = 1; router.selection = .today
            model.publishSnapshot()
        default: step += 1
        }
    }
}
