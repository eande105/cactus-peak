import SwiftUI

/// Today is a List: Next up first, then coming up, club now, this week, for you. A held waitlist spot comes before all of it.
struct TodayView: View {
    @Environment(AppModel.self) private var model
    @Environment(AppRouter.self) private var router
    @Environment(\.openURL) private var openURL
    @Environment(\.dynamicTypeSize) private var dts
    @State private var loading = true

    var body: some View {
        TimelineView(.periodic(from: .now, by: 20)) { _ in
            let now = model.now
            let club = model.club(router.viewingClubID)
            List {
                if model.offline { Section { OfflineBanner(text: "You're offline. \(model.savedDataText)") }.listRowBackground(Color.clear) }
                statusSection
                if let hold = model.activeHold { Section { HoldCard(booking: hold) }.listRowBackground(Color.clear) }

                Section {
                    if model.isFrozen, let f = model.freeze {
                        FrozenRow(end: f.end)
                    } else {
                        NextUpCard(booking: model.nextBooking, now: now)
                    }
                }
                .listRowBackground(Color.clear).listRowSeparator(.hidden).listRowInsets(.init(top: 4, leading: 0, bottom: 10, trailing: 0))
                UpcomingSection(now: now)
                Section {
                    ClubNowRow(club: club, reading: model.busyness(club), values: model.popular(club), now: now)
                } header: { Text("Club now") }
                Section {
                    WeekRow()
                } header: { Text("This week") }
                ForYouSection()
                Section {
                    if let b = feedbackCandidate(now) { FeedbackCard(booking: b) }
                } footer: {
                    Label("Pool's 82° and the shade sails are up.", systemImage: "sun.max").font(.footnote).foregroundStyle(Color.textMuted)
                }
            }
            .listStyle(.insetGrouped)
            .scrollContentBackground(.hidden)
            .redacted(reason: loading ? .placeholder : [])
            .refreshable { try? await Task.sleep(for: .milliseconds(500)) }
        }
        .background(Color.appBackground)
        .task { try? await Task.sleep(for: .milliseconds(300)); loading = false }
        .navigationTitle(dts.isAccessibilitySize ? "Today" : "Morning, \(model.member.first).")
        .navigationSubtitle(model.now.cpFormat("EEEE, MMM d"))
        .toolbar { toolbar }
        .sensoryFeedback(.levelChange, trigger: model.busyness(model.club(router.viewingClubID)).level)
    }

    // MARK: Toolbar
    @ToolbarContentBuilder private var toolbar: some ToolbarContent {
        ToolbarItem(placement: .topBarLeading) {
            Button { router.present(.clubSwitcher(.viewing)) } label: {
                HStack(spacing: 4) { Text(model.club(router.viewingClubID).shortName); Image(systemName: "chevron.down").imageScale(.small) }
                    .font(.subheadline.weight(.semibold))
            }
            .accessibilityLabel("Club: \(model.club(router.viewingClubID).fullName). Change club")
        }
        ToolbarItem(placement: .topBarTrailing) {
            Button { router.push(.notifications) } label: { Image(systemName: model.unreadCount > 0 ? "bell.badge" : "bell") }
                .accessibilityLabel("Inbox").accessibilityValue(model.unreadCount > 0 ? "\(model.unreadCount) unread" : "")
        }
        ToolbarSpacer(.fixed, placement: .topBarTrailing)
        ToolbarItem(placement: .topBarPinnedTrailing) {
            Button { router.present(.pass) } label: { Image(systemName: model.checkedInToday ? "checkmark.circle" : "qrcode") }.accessibilityLabel("Show check-in pass").accessibilityValue(model.checkedInToday ? "Checked in" : "")
        }
        .visibilityPriority(.high)
    }

    // MARK: Status
    @ViewBuilder private var statusSection: some View {
        let phone = model.club(model.passClubID).phone
        Group {
            if model.paymentFailedDay >= 15 {
                Banner(tone: .danger, text: "See the front desk. Your pass will not scan until the balance is paid.", actionTitle: "Call \(phone)") { openURL(URL(string: "tel:\(phone.filter(\.isNumber))")!) }
            } else if model.paymentFailedDay >= 8 {
                Banner(tone: .danger, text: "New bookings are paused until you pay. Your pass still works.", actionTitle: "Update payment") { router.selection = .you; router.paths[.you] = [.membership] }
            } else if model.paymentFailedDay >= 1 {
                Banner(tone: .warning, text: "We could not charge your card. Retrying on day 3 and day 6.", actionTitle: "Update payment") { router.selection = .you; router.paths[.you] = [.membership] }
            }
            if let p = model.pauseUntil, p > model.now {
                Banner(tone: .warning, text: "New bookings are paused until \(p.cpWeekdayShort) \(p.cpDayMonth). Kids club, check-in and cancelling still work.", actionTitle: "How strikes work") { router.push(.strikes) }
            }
            if let d = model.membershipCancelOn {
                Banner(tone: .info, text: "Cancelling \(d.cpDayMonth). You keep full access until then.", actionTitle: "Reinstate") { model.reinstate() }
            }
        }
        .listRowBackground(Color.clear).listRowInsets(.init(top: 4, leading: 0, bottom: 4, trailing: 0))
    }

    private func feedbackCandidate(_ now: Date) -> Booking? {
        model.bookings.first { $0.status == .attended && $0.feedback == nil && $0.kind == .classSession && now.timeIntervalSince($0.end) < 24 * 3600 && now > $0.end }
    }
}

extension FreezeState { var restartText: String { end.addingDays(1).cpDayMonth } }

struct FrozenRow: View {
    @Environment(AppRouter.self) private var router
    var end: Date
    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            StatusPill(text: "Frozen until \(end.cpDayMonth)", symbol: "pause.fill", tone: .neutral)
            Text("Your bookings in the freeze were cancelled with no strikes. You can't check in until billing restarts on \(end.addingDays(1).cpDayMonth).").font(.subheadline)
            Button("View freeze") { router.selection = .you; router.paths[.you] = [.membership, .freeze] }.linkAction()
        }
    }
}

// MARK: - Hold

struct HoldCard: View {
    @Environment(AppModel.self) private var model
    @Environment(AppRouter.self) private var router
    var booking: Booking
    var body: some View {
        VStack(alignment: .leading, spacing: 10) {
            Label("A spot opened in \(booking.title)", systemImage: "bell.badge.fill").font(.headline)
            Text("\(booking.start.cpWeekdayShort) \(booking.start.cpTime) · \(model.club(booking.clubID).fullName). Confirm within 30 minutes or the spot goes to the next person.").font(.subheadline)
            BookingStateButton(state: .hold(booking.holdExpires ?? model.now), size: .large, action: {
                if model.confirmHold(booking.id) { model.announceBooked(model.booking(booking.id)) }
            }, onRelease: { model.releaseHold(booking.id) })
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(16)
        .background(Color.statusWarningSubtle, in: RoundedRectangle(cornerRadius: 20, style: .continuous))
        .sensoryFeedback(.warning, trigger: booking.id)
    }
}

// MARK: - Next up

struct NextUpCard: View {
    @Environment(AppModel.self) private var model
    @Environment(AppRouter.self) private var router
    @Environment(\.openURL) private var openURL
    @Environment(\.dynamicTypeSize) private var dts
    var booking: Booking?
    var now: Date

    var body: some View {
        if let b = booking { booked(b) } else { empty }
    }

    private func booked(_ b: Booking) -> some View {
        let session = b.sessionID.flatMap { model.session($0) }
        let club = model.club(b.clubID)
        let secs = max(0, b.start.timeIntervalSince(now))
        let inProgress = now >= b.start
        let (clock, ampm) = b.start.cpClock
        return VStack(alignment: .leading, spacing: 12) {
            Button { if let id = b.sessionID { router.push(.classSession(id)) } else { router.push(.myBookings) } } label: {
                VStack(alignment: .leading, spacing: 8) {
                    let eyebrowLayout = dts.isAccessibilitySize ? AnyLayout(VStackLayout(alignment: .leading, spacing: 2)) : AnyLayout(HStackLayout(spacing: 4))
                    eyebrowLayout {
                        Label(inProgress ? "IN PROGRESS · ENDS \(b.end.cpTime.uppercased())" : "NEXT UP ·", systemImage: b.category.symbol).labelStyle(.titleAndIcon)
                        if !inProgress {
                            Text(secs < 5400 ? "STARTS IN" : b.start.cpWeekdayShort.uppercased())
                            if secs < 5400 {
                                Text(timerInterval: Date.now...Date.now.addingTimeInterval(max(secs, 1)), countsDown: true, showsHours: false).monospacedDigit()
                            }
                        }
                    }
                    .eyebrowStyle(Color.linkText)
                    HStack(alignment: .firstTextBaseline, spacing: 6) {
                        Text(clock).font(.archivoExtraBold(56, relativeTo: .largeTitle)).tracking(-1).monospacedDigit()
                        Text(ampm).font(.title3.weight(.semibold))
                    }
                    Text(b.title).font(.title2.bold()).fixedSize(horizontal: false, vertical: true)
                    HStack(spacing: 8) {
                        if let c = b.coachID.map({ model.coach($0) }) { Text("\(c.shortName) · \(session?.room ?? b.detail) · \(club.shortName)") }
                        else { Text("\(b.detail.isEmpty ? "" : "\(b.detail) · ")\(club.shortName)") }
                        if let s = session { RibMeter(value: s.intensity, tone: .category(s.category), size: .sm, peak: false) }
                    }
                    .font(.subheadline).foregroundStyle(Color.textMuted)
                }
                .frame(maxWidth: .infinity, alignment: .leading)
                .foregroundStyle(Color.textPrimary)
                .contentShape(Rectangle())
            }
            .buttonStyle(.plain)
            actions(b, club)
        }
        .padding(.vertical, 4)
        .accessibilityElement(children: .contain)
        .accessibilityLabel("Next up. \(b.title), \(b.start.cpTime), \(inProgress ? "in progress" : "starts in \(max(Int(secs / 60), 1)) minutes"), \(b.coachID.map { model.coach($0).shortName } ?? ""), \(session?.room ?? b.detail), \(club.fullName).\(session.map { " Intensity \($0.intensity) of 5." } ?? "")")
    }

    private func actions(_ b: Booking, _ club: Club) -> some View {
        let pass = Group {
            if model.checkedInToday {
                Button {} label: { Label("Checked in", systemImage: "checkmark").lineLimit(1).fixedSize() }.buttonStyle(.glass).controlSize(.regular).disabled(true)
            } else {
                Button { router.present(.pass) } label: { HStack(spacing: 6) { Image(systemName: "qrcode"); Text("Show pass") }.foregroundStyle(Color.brandOnAccent).lineLimit(1).fixedSize() }
                    .buttonStyle(.glassProminent).tint(Color.brandAccent).controlSize(.regular)
            }
        }
        let dir = Button { openMaps(club) } label: { Text("Directions").lineLimit(1).fixedSize() }
            .buttonStyle(.glass).controlSize(.regular)
        let more = Menu {
            if b.kind == .classSession { Button { router.present(.calendar(b.id)) } label: { Label("Add to calendar", systemImage: "calendar.badge.plus") } }
            Button(role: .destructive) { router.requestCancel(b.id) } label: { Label("Cancel booking", systemImage: "xmark") }
        } label: { Label("More", systemImage: "ellipsis").labelStyle(.iconOnly) }
            .buttonStyle(.glass).controlSize(.regular)
        return GlassEffectContainer(spacing: 10) {
            // Three across when they fit, stacked when they do not (large text, small phones).
            ViewThatFits(in: .horizontal) {
                HStack(spacing: 10) { pass; dir; more }
                VStack(alignment: .leading, spacing: 10) { pass; dir; more }
            }
        }
    }

    private func openMaps(_ c: Club) {
        if let u = URL(string: "http://maps.apple.com/?daddr=\(c.latitude),\(c.longitude)&q=\(c.fullName.addingPercentEncoding(withAllowedCharacters: .urlQueryAllowed) ?? "")") { openURL(u) }
    }

    @ViewBuilder private var empty: some View {
        VStack(alignment: .leading, spacing: 10) {
            Text("Nothing booked today.").font(.archivoExtraBold(24, relativeTo: .title2))
            if let u = model.usualSession {
                let d = model.rowData(u)
                let day = AZ.cal.isDate(u.start, inSameDayAs: now) ? "Today" : (AZ.cal.isDate(u.start, inSameDayAs: now.addingDays(1)) ? "Tomorrow" : u.start.cpWeekdayShort)
                Text("Your usual: \(u.name), \(day) \(u.start.cpTime) · \(d.left) \(u.spotNoun) left").font(.subheadline).foregroundStyle(Color.textMuted)
                HStack {
                    BookingStateButton(state: d.state, action: { ClassActions.primary(u, model: model, router: router) })
                    Button("Browse classes") { router.selection = .book }.linkAction()
                }
            } else {
                Button("Browse classes") { router.selection = .book }.primaryAction()
            }
        }
        .frame(maxWidth: .infinity, alignment: .leading)
    }
}

extension AppModel {
    /// The most-attended class name at the home club, next time it runs.
    var usualSession: ClassSession? {
        let counts = Dictionary(grouping: bookings.filter { $0.status == .attended }, by: \.title).mapValues(\.count)
        guard let name = counts.max(by: { $0.value < $1.value })?.key else { return nil }
        return sessions.first { $0.name == name && $0.clubID == member.homeClubID && $0.start > now && booking(forSession: $0.id) == nil && visible($0) }
    }
}

// MARK: - Club now (one row; the full chart lives on Club detail)

struct ClubNowRow: View {
    @Environment(AppModel.self) private var model
    @Environment(AppRouter.self) private var router
    @Environment(\.dynamicTypeSize) private var dts
    var club: Club
    var reading: BusynessReading
    var values: [Double]
    var now: Date

    var body: some View {
        Button { router.push(.club(club.id)) } label: {
            HStack(spacing: 12) {
                VStack(alignment: .leading, spacing: 4) {
                    BusynessMeter(reading: reading, variant: .hero, now: now)
                    Text(club.isOpen(at: now) ? "\(club.fullName) · open until \(club.openUntilText(on: now))" : "\(club.fullName) · closed, opens \(club.opensText(now))")
                        .font(.subheadline).foregroundStyle(Color.textMuted)
                }
                Spacer(minLength: 0)
                Image(systemName: "chevron.right").font(.footnote.weight(.semibold)).foregroundStyle(Color.textMuted).accessibilityHidden(true)
            }
            .frame(minHeight: 56).contentShape(Rectangle())
        }
        .buttonStyle(.plain)
        .accessibilityHint("Opens club details")
    }
}

// MARK: - This week

struct WeekRow: View {
    @Environment(AppModel.self) private var model
    @Environment(AppRouter.self) private var router
    var body: some View {
        let streak = model.streak
        let ws = model.weekStart(model.now)
        let dots: [Bool] = (0..<7).map { i in
            let d = ws.addingDays(i)
            return model.visits.contains { $0 >= d && $0 < d.addingDays(1) && $0 <= model.now }
        }
        let todayIdx = AZ.cal.dateComponents([.day], from: ws, to: model.now.startOfAZDay).day ?? 0
        Button { router.push(.progress, on: .today) } label: {
            VStack(alignment: .leading, spacing: 14) {
                if model.visits.isEmpty { Text("Your first visit starts the streak.").font(.headline) }
                else { VisitStreakStrip(weeks: streak.weeks, visited: dots, todayIndex: todayIdx, thisWeek: streak.thisWeek) }
                ProgressRibs(value: streak.thisWeek, goal: model.weeklyGoal, hero: false)
            }
            .frame(maxWidth: .infinity, alignment: .leading)
            .contentShape(Rectangle())
        }
        .buttonStyle(.plain)
    }
}

// MARK: - Coming up

struct UpcomingSection: View {
    @Environment(AppModel.self) private var model
    @Environment(AppRouter.self) private var router
    var now: Date
    var body: some View {
        let list = Array(model.upcomingBookings.filter { $0.id != model.nextBooking?.id }.prefix(3))
        if !list.isEmpty {
            Section {
                ForEach(list) { b in
                    Button {
                        if let s = b.sessionID { router.push(.classSession(s), on: .today) } else { router.push(.myBookings, on: .today) }
                    } label: {
                        HStack {
                            BookingRow(booking: b, clubShort: model.club(b.clubID).shortName,
                                       statusText: b.status == .waitlisted ? "On waitlist #\(b.waitlistPosition)" : (b.kind == .kids ? b.detail : "Booked"))
                            Image(systemName: "chevron.right").font(.footnote.weight(.semibold)).foregroundStyle(Color.textMuted).accessibilityHidden(true)
                        }.contentShape(Rectangle())
                    }
                    .buttonStyle(.plain)
                    .swipeActions(edge: .trailing) {
                        if b.status == .waitlisted { Button("Leave") { model.leaveWaitlist(b.id) }.tint(.red) }
                        else { Button("Cancel") { router.requestCancel(b.id) }.tint(.red) }
                    }
                }
            } header: {
                HStack { Text("Coming up"); Spacer(); Button("See all") { router.push(.myBookings, on: .today) }.linkAction().font(.subheadline).textCase(nil) }
            }
        }
    }
}

// MARK: - For you

struct ForYouSection: View {
    @Environment(AppModel.self) private var model
    @Environment(AppRouter.self) private var router
    var body: some View {
        let picks = suggestions()
        if !picks.isEmpty {
            Section {
                ScrollView(.horizontal) {
                    LazyHStack(spacing: 12) {
                        ForEach(picks) { d in
                            Button { router.push(.classSession(d.session.id), on: .today) } label: { ClassFeatureCard(data: d) }.buttonStyle(.plain)
                        }
                    }
                    .scrollTargetLayout().padding(.horizontal, 16)
                }
                .scrollTargetBehavior(.viewAligned).scrollIndicators(.hidden)
                .listRowInsets(.init()).listRowBackground(Color.clear)
            } header: { Text("For you") }
        }
    }
    private func suggestions() -> [ClassRowData] {
        let tomorrow = model.now.startOfAZDay.addingDays(1)
        let interests = model.prefs.interests
        var out: [ClassSession] = []
        for off in 0..<3 {
            out += model.sessions(club: model.member.homeClubID, day: tomorrow.addingDays(off))
                .filter { interests.contains($0.category) && model.state(for: $0).isBookable && model.booking(forSession: $0.id) == nil }
        }
        return out.sorted { $0.start < $1.start }.prefix(3).map { model.rowData($0) }
    }
}

// MARK: - Feedback

struct FeedbackCard: View {
    @Environment(AppModel.self) private var model
    @Environment(AppRouter.self) private var router
    var booking: Booking
    var body: some View {
        VStack(alignment: .leading, spacing: 10) {
            Text("How was \(booking.title)?").font(.headline)
            HStack(spacing: 8) {
                ForEach(["Great", "Okay", "Not for me"], id: \.self) { a in Button(a) { model.giveFeedback(booking.id, a) }.buttonStyle(.bordered).buttonBorderShape(.capsule) }
            }
            HStack {
                Text("Only the club sees this.").font(.footnote).foregroundStyle(Color.textMuted)
                Spacer()
                Button("Add a note") { router.present(.feedback(booking.id)) }.linkAction().font(.subheadline)
            }
        }
    }
}
