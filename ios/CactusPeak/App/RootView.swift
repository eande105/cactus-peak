import SwiftUI

struct RootView: View {
    @Environment(AppModel.self) private var model
    @Environment(AppRouter.self) private var router
    @State private var accessoryHiddenUntil: Date?
    @Environment(\.dynamicTypeSize) private var dts
    @Environment(\.accessibilityReduceMotion) private var reduceMotion

    var body: some View {
        @Bindable var router = router
        TabView(selection: $router.selection) {
            Tab("Today", systemImage: "sun.horizon", value: AppTab.today) {
                NavigationStack(path: router.binding(for: .today)) { TodayView().appDestinations() }.safeAreaInset(edge: .top, spacing: 0) { toastBar }
            }
            Tab("Book", systemImage: "calendar", value: AppTab.book) {
                NavigationStack(path: router.binding(for: .book)) { BookView().appDestinations() }.safeAreaInset(edge: .top, spacing: 0) { toastBar }
            }
            Tab("Clubs", systemImage: "mappin.and.ellipse", value: AppTab.clubs) {
                NavigationStack(path: router.binding(for: .clubs)) { ClubsView().appDestinations() }.safeAreaInset(edge: .top, spacing: 0) { toastBar }
            }
            Tab("You", systemImage: "person.crop.circle", value: AppTab.you) {
                NavigationStack(path: router.binding(for: .you)) { YouView().appDestinations() }.safeAreaInset(edge: .top, spacing: 0) { toastBar }
            }
            Tab("Search", systemImage: "magnifyingglass", value: AppTab.search, role: .search) {
                NavigationStack(path: router.binding(for: .search)) { SearchView().appDestinations() }
            }
        }
        .tabViewStyle(.sidebarAdaptable)
        .tabBarMinimizeBehavior(.onScrollDown)
        .tabViewSearchActivation(.searchTabSelection)
        .tabViewBottomAccessory(isEnabled: shouldOfferPass && onRoot && router.selection == .book && !dts.isAccessibilitySize && !model.isFrozen) {
            PassAccessory(clubName: model.nextBooking.map { "\($0.title) \($0.start.cpTimeShort)" } ?? model.club(model.passClubID).shortName) {
                router.present(.pass)
            } onClose: {
                accessoryHiddenUntil = model.now.addingTimeInterval(4 * 3600)
            }
        }
        .sheet(item: $router.sheet) { s in SheetHost(sheet: s) }
        .fullScreenCover(isPresented: Binding(get: { !model.signedIn || (model.householdLoaded && !model.onboarded) }, set: { _ in })) {
            WelcomeFlow()
        }
        .animation(reduceMotion ? nil : .snappy(duration: 0.3), value: model.toast)
        .onAppear { router.rootReady = true }
        .alert("Time clash", isPresented: Binding(get: { router.clash != nil }, set: { if !$0 { router.clash = nil } }), presenting: router.clash) { c in
            Button("Keep both") {
                if let s = model.session(c.id), case .ok(let b) = model.book(s, force: true) { model.announceBooked(model.booking(b.id)) }
                router.clash = nil
            }
            Button("Cancel", role: .cancel) { router.clash = nil }
        } message: { c in Text(c.message) }
        .confirmationDialog("Cancel this booking?", item: $router.lateCancelID, titleVisibility: .visible) { id in
            if let b = model.booking(id) {
                Button("Cancel booking", role: .destructive) {
                    let r = model.cancel(id)
                    if r?.late == true { model.showToast(r?.pausesBookings == true ? "Cancelled. New bookings are paused." : "Cancelled. That counts as a late cancel.") }
                }
                if let alt = model.sameClassThisWeek(b).first, b.kind == .classSession {
                    Button("Reschedule") {
                        router.day = alt.start.startOfAZDay; router.segment = .classes; router.viewingClubID = alt.clubID
                        router.selection = .book; router.paths[.book] = []
                    }
                }
                Button("Keep booking", role: .cancel) {}
            }
        } message: { id in
            if let b = model.booking(id) {
                let p = model.cancelPreview(b)
                if b.kind == .kids { Text("Kids club has no late-cancel strikes.") }
                else if b.kind == .pt { Text(p.late ? "Counts as a used session." : "Free cancel. You can reschedule or rebook.") }
                else if !p.late { Text("Free cancel. You can rebook until it fills.") }
                else if p.pausesBookings { Text("This is a late cancel and your 3rd strike. New bookings pause for 3 days.") }
                else if p.countsStrike { Text("This is a late cancel. It counts as strike \(p.strikeNumber) of 3 in 30 days.") }
            }
        }
        .sensoryFeedback(.warning, trigger: model.lastLateCancelID)
        .sensoryFeedback(.success, trigger: model.lastBookedID)
        .onOpenURL { router.open($0) }
        .onContinueUserActivity(NSUserActivityTypeBrowsingWeb) { a in if let u = a.webpageURL { router.open(u) } }
    }

    /// The pass shortcut shows when a booking starts within 90 min (or ended within 15) and the member has not checked in,
    /// or when the member turned the shortcut on in Settings. Location is not used in this build.
    /// Toast sits under the status bar and pushes content down, so it never covers a row or the pass bar.
    @ViewBuilder private var toastBar: some View {
        if let t = model.toast {
            ToastView(toast: t, undo: { if let id = t.undoID { model.undoCancel(id) } },
                      calendar: { if let id = t.calendarID { model.toast = nil; router.present(.calendar(id)) } })
                .padding(.horizontal, 16).padding(.bottom, 6)
                .transition(reduceMotion ? .opacity : .move(edge: .top).combined(with: .opacity))
        }
    }

    /// The pass bar shows on root screens only, so it never stacks with a pushed screen's action bar.
    private var onRoot: Bool { (router.paths[router.selection] ?? []).isEmpty && router.selection != .search }

    private var shouldOfferPass: Bool {
        if let h = accessoryHiddenUntil, h > model.now { return false }
        if model.checkedInToday { return false }
        if model.prefs.keepPassShortcut { return true }
        return model.bookings.contains {
            $0.status == .booked && $0.start.timeIntervalSince(model.now) <= 90 * 60 && model.now.timeIntervalSince($0.end) <= 15 * 60
        }
    }
}

struct PassAccessory: View {
    var clubName: String
    var onTap: () -> Void
    var onClose: () -> Void
    @Environment(\.tabViewBottomAccessoryPlacement) private var placement
    var body: some View {
        HStack(spacing: 10) {
            Button(action: onTap) {
                HStack(spacing: 10) {
                    Image(systemName: "qrcode").imageScale(.large)
                    Text(placement == .inline ? "Show pass" : "Show pass · \(clubName)").font(.subheadline.weight(.semibold)).lineLimit(1)
                    Spacer(minLength: 0)
                }
                .contentShape(Rectangle())
            }
            .buttonStyle(.plain)
            if placement != .inline {
                Button(action: onClose) { Image(systemName: "xmark").font(.footnote.weight(.bold)).frame(width: 44, height: 44) }
                    .buttonStyle(.plain).accessibilityLabel("Hide for 4 hours")
            }
        }
        .padding(.horizontal, 16)
        .accessibilityElement(children: .contain)
    }
}

// MARK: - Routes

extension View {
    func appDestinations() -> some View {
        navigationDestination(for: AppRoute.self) { RouteView(route: $0) }
    }
}

struct RouteView: View {
    let route: AppRoute
    var body: some View {
        switch route {
        case .classSession(let id): ClassDetailView(sessionID: id)
        case .bookingConfirmed(let id): SuccessView(bookingID: id, fresh: false)
        case .bookingDetail(let id): SuccessView(bookingID: id, fresh: false)
        case .myBookings: MyBookingsView()
        case .progress: ProgressScreen()
        case .notifications: InboxView()
        case .club(let id): ClubDetailView(clubID: id)
        case .coach(let id): CoachProfileView(coachID: id)
        case .coachList(let id): CoachListView(clubID: id)
        case .reserve(let kind, let club): ReserveRouteView(kind: kind, clubID: club)
        case .membership: MembershipView()
        case .plans: PlansView()
        case .freeze: FreezeView()
        case .cancelMembership: CancelMembershipView()
        case .billingHistory: BillingHistoryView()
        case .family: FamilyView()
        case .familyMember(let id): FamilyMemberView(personID: id)
        case .guestPasses: GuestPassesView()
        case .settings: SettingsView()
        case .strikes: StrikesView()
        case .clubClasses(let id): ClubClassesView(clubID: id)
        }
    }
}
