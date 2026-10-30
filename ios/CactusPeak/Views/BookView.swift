import SwiftUI

struct BookView: View {
    @Environment(AppModel.self) private var model
    @Environment(AppRouter.self) private var router
    @Environment(\.dynamicTypeSize) private var dts

    var body: some View {
        Group {
            switch router.segment {
            case .classes: ClassesList()
            case .courts: ReserveList(kind: .court)
            case .lanes: ReserveList(kind: .lane)
            case .kids: ReserveList(kind: .kidsClub)
            }
        }
        // At accessibility sizes the header scrolls with the list (see BookHeaderSection). Otherwise it is pinned.
        .safeAreaInset(edge: .top, spacing: 0) { if !dts.isAccessibilitySize { BookHeader() } }
        .navigationTitle("Book")
        .navigationSubtitle(router.segment == .classes ? model.club(router.viewingClubID).fullName : model.club(router.reserveClub[ReserveKind(from: router.segment) ?? .court] ?? model.member.homeClubID).fullName)
        .navigationBarTitleDisplayMode(.inline)
        .toolbar {
            if router.segment == .classes {
                ToolbarItem(placement: .topBarTrailing) {
                    Button { router.present(.filters) } label: {
                        Image(systemName: router.filters.activeCount > 0 ? "line.3.horizontal.decrease.circle.fill" : "line.3.horizontal.decrease.circle")
                    }
                    .accessibilityLabel("Filters")
                    .accessibilityValue(router.filters.activeCount > 0 ? "\(router.filters.activeCount) filters on" : "none on")
                }
                ToolbarSpacer(.fixed, placement: .topBarTrailing)
            }
            ToolbarItem(placement: .topBarTrailing) {
                Button { router.push(.myBookings, on: .book) } label: { Label("My bookings", systemImage: "ticket") }.labelStyle(.iconOnly)
            }
        }
    }
}

/// Segment picker and day strip. Pinned on iPhone at normal sizes, inside the list at accessibility sizes.
struct BookHeader: View {
    @Environment(AppModel.self) private var model
    @Environment(AppRouter.self) private var router
    @Environment(\.dynamicTypeSize) private var dts

    var body: some View {
        @Bindable var router = router
        VStack(spacing: 6) {
            if dts.isAccessibilitySize {
                Picker("Type", selection: $router.segment) { ForEach(BookSegment.allCases) { Text($0.rawValue).tag($0) } }.pickerStyle(.menu)
                Picker("Day", selection: $router.day) {
                    ForEach(days, id: \.self) { Text($0.cpFormat("EEEE, MMM d")).tag($0) }
                }.pickerStyle(.menu)
            } else {
                Picker("Type", selection: $router.segment) { ForEach(BookSegment.allCases) { Text($0.rawValue).tag($0) } }
                    .pickerStyle(.segmented).padding(.horizontal, 16).padding(.top, 4)
                    .sensoryFeedback(.selection, trigger: router.segment)
                ScheduleDayStrip(days: days, selected: Binding(get: { router.day }, set: { router.day = $0 }),
                                 counts: { dayCount($0) }, dimmed: { dayDimmed($0) }, onCalendar: { router.present(.datePicker) })
            }
        }
        .background(dts.isAccessibilitySize ? Color.clear : Color.appBackground)
    }

    private var days: [Date] {
        switch router.segment {
        case .classes, .lanes, .kids: model.reserveDays(.kidsClub)
        case .courts: model.reserveDays(.court)
        }
    }
    private func dayCount(_ d: Date) -> Int? {
        guard router.segment == .classes, router.filters.activeCount > 0 else { return nil }
        let ids = router.filters.clubs.isEmpty ? [router.viewingClubID] : Array(router.filters.clubs)
        return ids.reduce(0) { $0 + model.sessions(club: $1, day: d).count }
    }
    private func dayDimmed(_ d: Date) -> Bool {
        let kind: ReserveKind = router.segment == .courts ? .court : .kidsClub
        return model.reserveOpensAt(d, kind: kind) > model.now
    }
}

struct BookHeaderSection: View {
    @Environment(\.dynamicTypeSize) private var dts
    var body: some View {
        if dts.isAccessibilitySize { Section { BookHeader() }.listRowBackground(Color.clear) }
    }
}

// MARK: - Classes

struct ClassesList: View {
    @Environment(AppModel.self) private var model
    @Environment(AppRouter.self) private var router
    @Environment(\.dynamicTypeSize) private var dts
    @State private var loading = true
    @Environment(\.colorScheme) private var scheme

    private var clubIDs: [ClubID] { router.filters.clubs.isEmpty ? [router.viewingClubID] : Array(router.filters.clubs).sorted() }

    private var sessions: [ClassSession] {
        let f = router.filters
        return clubIDs.flatMap { model.sessions(club: $0, day: router.day) }.filter { s in
            (f.categories.isEmpty || f.categories.contains(s.category))
            && (f.times.isEmpty || f.times.contains(TimeOfDay.of(s.start)))
            && s.intensity <= f.maxIntensity
            && (f.coachID == nil || s.coachID == f.coachID)
            && (!f.firstTimers || s.firstTimers)
            && (!f.spotsOnly || model.spotsLeft(s) > 0)
            && (!f.myBookings || model.booking(forSession: s.id) != nil)
        }.sorted { ($0.start <= model.now ? 1 : 0, $0.start) < ($1.start <= model.now ? 1 : 0, $1.start) }
    }

    var body: some View {
        let list = sessions
        let sections = Dictionary(grouping: list, by: { TimeOfDay.of($0.start) })
        List {
            BookHeaderSection()
            Section {
                filterChips
                if let r = model.bookingBlock, r != .offline { Banner(tone: .warning, text: "\(r.label). \(r.note)", actionTitle: nil, action: nil) }
                if model.offline { OfflineBanner(text: model.savedDataText) }
            }
            .listRowBackground(Color.clear).listRowSeparator(.hidden).listRowInsets(.init(top: 4, leading: 16, bottom: 4, trailing: 16))

            ForEach(TimeOfDay.allCases) { tod in
                if let items = sections[tod], !items.isEmpty {
                    Section {
                        ForEach(items.sorted { ($0.start <= model.now ? 1 : 0, $0.start) < ($1.start <= model.now ? 1 : 0, $1.start) }) { s in
                            let d = model.rowData(s)
                            NavigationLink(value: AppRoute.classSession(s.id)) {
                                ClassRow(data: d, showClub: clubIDs.count > 1, onAction: { ClassActions.primary(s, model: model, router: router) },
                                         onLeave: { if let b = model.booking(forSession: s.id) { model.leaveWaitlist(b.id) } })
                            }
                            .swipeActions(edge: .trailing) {
                                if d.state.isBookable { Button("Book") { ClassActions.primary(s, model: model, router: router) }.tint(Color.brandAccent) }
                                else if case .waitlist = d.state { Button("Join waitlist") { ClassActions.primary(s, model: model, router: router) }.tint(Color.brandSecondary) }
                            }
                            .accessibilityAction(named: "Book") { ClassActions.primary(s, model: model, router: router) }
                        }
                    } header: { Text(tod.rawValue).font(.footnote.weight(.semibold)).foregroundStyle(Color.textMuted).textCase(.uppercase) }
                }
            }
        }
        .listStyle(.plain)
        .scrollContentBackground(.hidden)
        .background(Color.appBackground)
        .redacted(reason: loading ? .placeholder : [])
        .task { try? await Task.sleep(for: .milliseconds(350)); loading = false }
        .overlay {
            if model.forceError {
                EmptyState(title: "Can't load classes", message: "Check your connection, then try again.", symbol: "wifi.exclamationmark", actionTitle: "Try again") { model.forceError = false }
                    .background(Color.appBackground)
            } else if list.isEmpty && !loading {
                EmptyState(title: "No classes \(router.day.cpFormat("EEE d"))",
                           message: "\(clubIDs.count == 1 ? model.club(clubIDs[0]).fullName : "These clubs") has no classes that match. Try \(nextDayWithClasses.map { $0.cpFormat("EEE d") } ?? "another day").",
                           symbol: "calendar.badge.exclamationmark",
                           actionTitle: nextDayWithClasses.map { "Go to \($0.cpFormat("EEE d"))" },
                           action: { if let d = nextDayWithClasses { router.day = d } },
                           secondaryTitle: router.filters.activeCount > 0 ? "Clear filters" : nil,
                           secondary: { router.filters = ScheduleFilters() })
                .background(Color.appBackground)
            }
        }
        .refreshable { try? await Task.sleep(for: .milliseconds(500)) }
    }

    private var nextDayWithClasses: Date? {
        (1...6).map { router.day.addingDays($0) }.first { d in clubIDs.contains { !model.sessions(club: $0, day: d).isEmpty } && d <= model.lastBookableDay }
    }

    /// Filters live in the toolbar sheet. Active ones show as one summary row with a clear button.
    @ViewBuilder private var filterChips: some View {
        if router.filters.activeCount > 0 {
            HStack {
                Label("\(router.filters.activeCount) filter\(router.filters.activeCount == 1 ? "" : "s") on", systemImage: "line.3.horizontal.decrease.circle.fill").font(.subheadline.weight(.medium))
                Spacer()
                Button("Clear") { router.filters = ScheduleFilters() }.linkAction()
            }
        }
    }
}

// MARK: - Courts, lanes and kids club

struct ReserveList: View {
    @Environment(AppModel.self) private var model
    @Environment(AppRouter.self) private var router
    @Environment(\.dynamicTypeSize) private var dts
    let kind: ReserveKind

    private var club: Club { model.club(router.reserveClub[kind] ?? model.homeClub.id) }
    private var plan: PlanTier { model.member.plan }

    var body: some View {
        @Bindable var router = router
        let day = router.day
        let opens = model.reserveOpensAt(day, kind: kind)
        List {
            BookHeaderSection()
            // One compact control row. The rules go in the footer, so slots start high on the screen.
            Section {
                if let r = model.bookingBlock, kind != .kidsClub, r != .offline { Banner(tone: .warning, text: "\(r.label). \(r.note)", actionTitle: nil, action: nil) }
                controlRow
            } footer: { Text(rule + " Times are Arizona time.") }
            .listRowBackground(Color.clear).listRowSeparator(.hidden).listRowInsets(.init(top: 2, leading: 16, bottom: 2, trailing: 16))

            if let blocker = restriction {
                Section { blocker }.listRowBackground(Color.clear)
            } else if opens > model.now {
                Section {
                    Text("\(kind.title) for \(day.cpFormat("EEE MMM d")) open \(opens.cpWeekdayShort) at \(opens.cpTime)").font(.subheadline)
                    if kind == .court { Text("Courts can be booked 3 days ahead.").font(.footnote).foregroundStyle(Color.textMuted) }
                }
            } else {
                switch kind {
                case .court: courtRows(day)
                case .lane: laneRows(day)
                case .kidsClub: kidsRows(day)
                }
            }
        }
        .listStyle(.insetGrouped).scrollContentBackground(.hidden).background(Color.appBackground)
    }

    // MARK: Controls
    private var clubMenu: some View {
        let clubs = model.clubsFor(kind)
        return Menu {
            Picker("Club", selection: Binding(get: { club.id }, set: { newID in router.reserveClub[kind] = newID
                if kind == .court, let c = model.clubs.first(where: { $0.id == newID }), c.courts(for: router.sport) == 0, let sp = c.courtSports.first { router.sport = sp } })) {
                ForEach(clubs) { Text($0.fullName).tag($0.id) }
            }
        } label: { Label(club.shortName, systemImage: "mappin.and.ellipse").lineLimit(2).fixedSize(horizontal: false, vertical: true) }
            .buttonStyle(.bordered).buttonBorderShape(dts.isAccessibilitySize ? .roundedRectangle(radius: 12) : .capsule).tint(Color.brandSecondary)
            .accessibilityLabel("Club: \(club.fullName)")
    }

    @ViewBuilder private var controlRow: some View {
        @Bindable var router = router
        let sports = club.courtSports
        let layout = dts.isAccessibilitySize ? AnyLayout(VStackLayout(alignment: .leading, spacing: 8)) : AnyLayout(HStackLayout(spacing: 10))
        layout {
            clubMenu
            if kind == .court {
                if sports.count > 1 { Picker("Sport", selection: $router.sport) { ForEach(sports) { Text($0.title).tag($0) } }.pickerStyle(.segmented) }
                else if let only = sports.first { Label(only.title, systemImage: "figure.pickleball").font(.subheadline.weight(.semibold)) }
            }
            if kind == .lane { BusynessMeter(reading: model.busyness(club), variant: .inline, now: model.now) }
        }
        if kind == .court { DurationChips(options: [60, 90], selected: $router.duration) }
    }

    private var laneStatus: some View {
        HStack(spacing: 12) {
            Label(club.hasPool ? "\(club.lanes) lanes" : "No pool", systemImage: "figure.pool.swim").font(.subheadline.weight(.medium))
            BusynessMeter(reading: model.busyness(club), variant: .inline, now: model.now)
        }
    }

    private var rule: String {
        switch kind {
        case .court: "60 or 90 minutes. Book up to 3 days ahead. 1 court a day, 2 active at most. Included with Ridge and Summit."
        case .lane: "45-minute slots. Pool closes 30 minutes before the club. Up to 2 swimmers share a lane."
        case .kidsClub: "Ages 6 months to 12 years. 2-hour blocks. Up to 2 blocks per child a day. You check in at the same club."
        }
    }

    // MARK: Restrictions
    private var restriction: AnyView? {
        if kind == .court && !plan.courtsIncluded {
            return AnyView(EmptyState(title: "Courts come with Ridge", message: "Ridge includes courts, 3 days ahead, at all 5 clubs.", symbol: "figure.pickleball",
                                      actionTitle: "See plans", action: { router.selection = .you; router.paths[.you] = [.membership, .plans] }))
        }
        if kind == .court && model.isTeen && model.currentPerson?.courtsAllowed != true {
            return AnyView(EmptyState(title: "Ask a parent to turn on courts", message: "\(model.member.ownerFirst) can allow courts in Family settings.", symbol: "lock"))
        }
        if kind == .lane && model.isTeen && !(model.currentPerson?.lanesAllowed == true && model.member.age >= 14) {
            return AnyView(EmptyState(title: "Ask a parent to turn on lap lanes", message: "Lanes are for ages 14 and up, with a parent's OK.", symbol: "lock"))
        }
        if kind == .kidsClub && model.isTeen {
            return AnyView(EmptyState(title: "Kids club is for ages 12 and under", message: "Teens 13 to 17 can book Youth classes.", symbol: "face.smiling"))
        }
        let ok: Bool = switch kind { case .court: club.hasCourts; case .lane: club.hasPool; case .kidsClub: club.hasKids }
        if !ok {
            let what = kind == .court ? "courts" : (kind == .lane ? "lap lanes" : "a kids club")
            return AnyView(EmptyState(title: "No \(what) at \(club.fullName)", message: "These clubs have \(what).", symbol: "mappin.slash"))
        }
        if kind == .court && club.courts(for: router.sport) == 0 {
            return AnyView(EmptyState(title: "No \(router.sport.title.lowercased()) here", message: "Pick another sport.", symbol: "figure.pickleball"))
        }
        if model.member.plan == .trailhead && club.id != model.member.homeClubID {
            return AnyView(EmptyState(title: "Your Trailhead plan covers \(model.homeClub.fullName)", message: "Ridge adds all 5 clubs.", symbol: "mappin.slash",
                                      actionTitle: "See plans", action: { router.selection = .you; router.paths[.you] = [.membership, .plans] }))
        }
        return nil
    }

    // MARK: Rows
    @ViewBuilder private func courtRows(_ day: Date) -> some View {
        let slots = model.courtSlots(club: club, sport: router.sport, day: day, duration: router.duration)
        let blocked = model.bookingBlock != nil
        ForEach(TimeOfDay.allCases.filter { $0 != .early }, id: \.self) { tod in
            let items = slots.filter { TimeOfDay.of($0.start) == tod || (tod == .morning && TimeOfDay.of($0.start) == .early) }
            if !items.isEmpty {
                Section(tod == .morning ? "Morning" : tod.rawValue) {
                    ForEach(items) { s in
                        Button {
                            guard !s.past, !s.free.isEmpty, !blocked else { return }
                            router.present(.reserve(ReserveRequest(kind: .court, clubID: club.id, start: s.start, sport: router.sport, duration: router.duration)))
                        } label: {
                            SlotRow(time: s.start.cpTime, text: blocked ? "Booking paused" : model.courtListText(s.free), full: s.free.isEmpty || blocked, past: s.past)
                        }
                        .buttonStyle(.plain).disabled(s.past || s.free.isEmpty || blocked)
                    }
                }
            }
        }
    }

    @ViewBuilder private func laneRows(_ day: Date) -> some View {
        let slots = model.laneSlots(club: club, day: day)
        let blocked = model.bookingBlock != nil
        ForEach([TimeOfDay.early, .morning, .midday, .evening], id: \.self) { tod in
            let items = slots.filter { TimeOfDay.of($0.start) == tod }
            if !items.isEmpty {
                Section(tod.rawValue) {
                    ForEach(items) { s in
                        Button {
                            guard !s.past, s.bookable > 0, !blocked else { return }
                            router.present(.reserve(ReserveRequest(kind: .lane, clubID: club.id, start: s.start, sport: nil, duration: 45)))
                        } label: {
                            SlotRow(time: s.start.cpTime, text: blocked ? "Booking paused" : model.laneRowText(s, total: club.lanes),
                                    detail: s.bookable == 0 && !s.past ? "Lap lanes have no waitlist. Try a later time." : nil, full: s.bookable == 0 || blocked, past: s.past)
                        }
                        .buttonStyle(.plain).disabled(s.past || s.bookable == 0 || blocked)
                    }
                }
            }
        }
    }

    @ViewBuilder private func kidsRows(_ day: Date) -> some View {
        if AZ.cal.component(.weekday, from: day) == 1 {
            Section { Label("Kids club is closed on Sundays.", systemImage: "moon.zzz") }
        } else {
            let blocks = model.kidsBlocks(club: club, day: day)
            Section("Blocks") {
                ForEach(blocks) { b in
                    Button {
                        guard !b.past else { return }
                        if b.spotsLeft == 0 { router.present(.reserve(ReserveRequest(kind: .kidsClub, clubID: club.id, start: b.start, sport: nil, duration: 120, block: b.index))) }
                        else { router.present(.reserve(ReserveRequest(kind: .kidsClub, clubID: club.id, start: b.start, sport: nil, duration: 120, block: b.index))) }
                    } label: {
                        HStack(spacing: 12) {
                            RoundedRectangle(cornerRadius: 2).fill(ClassCategory.youth.color).frame(width: 4).accessibilityHidden(true)
                            VStack(alignment: .leading, spacing: 4) {
                                Text("\(b.start.cpTimeShort)–\(b.end.cpTimeShort)").font(.headline).monospacedDigit()
                                CapacityIndicator(left: b.spotsLeft, capacity: b.capacity, noun: "spots", waitlist: 0)
                            }
                            Spacer()
                            if b.spotsLeft == 0 && !b.past { Text("Join waitlist").font(.subheadline.weight(.semibold)).foregroundStyle(Color.linkText) }
                            else if !b.past { Image(systemName: "chevron.right").foregroundStyle(Color.textMuted).font(.footnote.weight(.semibold)) }
                        }
                        .frame(minHeight: 64).opacity(b.past ? 0.5 : 1)
                    }
                    .buttonStyle(.plain)
                    .accessibilityElement(children: .combine)
                }
            }
        }
    }
}
