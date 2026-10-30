import SwiftUI

// MARK: - Sheet host (one sheet at a time)

struct SheetHost: View {
    let sheet: AppSheet
    @Environment(\.dynamicTypeSize) private var dts
    var body: some View {
        Group {
            switch sheet {
            case .pass: PassView()
            case .cancel(let id): CancelSheet(bookingID: id)
            case .waitlist(let id): WaitlistSheet(sessionID: id)
            case .clubSwitcher(let m): ClubSwitcherSheet(mode: m)
            case .hours(let id): HoursSheet(clubID: id)
            case .invite(let id): InviteSheet(sessionID: id)
            case .feedback(let id): FeedbackSheet(bookingID: id)
            case .reserve(let r): ReserveSheet(request: r)
            case .filters: FiltersSheet()
            case .datePicker: DatePickerSheet()
            case .guestShare: GuestShareSheet()
            case .addFamily: AddFamilySheet()
            case .comparePlans: ComparePlansSheet()
            case .planConfirm(let p): PlanConfirmSheet(plan: p)
            case .freezeConfirm(let m): FreezeConfirmSheet(months: m)
            case .ptPicker(let c): PTPickerSheet(coachID: c)
            case .editProfile: EditProfileSheet()
            case .calendar(let id): CalendarSheet(bookingID: id)
            case .goal: GoalSheet()
            }
        }
        .presentationDetents(detents)
        .presentationDragIndicator(dragIndicator)
        .presentationBackgroundInteraction(backgroundInteraction)
        .tint(Color.brandAccent)
    }

    private var detents: Set<PresentationDetent> {
        let large: Set<PresentationDetent> = [.large]
        let both: Set<PresentationDetent> = [.medium, .large]
        let medium: Set<PresentationDetent> = [.medium]
        if dts.isAccessibilitySize { return large }
        switch sheet {
        case .pass, .addFamily, .comparePlans, .ptPicker, .editProfile, .calendar: return large
        case .clubSwitcher, .filters: return both
        case .reserve(let r): return r.kind == .kidsClub ? large : both
        default: return medium
        }
    }
    private var dragIndicator: Visibility {
        switch sheet { case .pass: .hidden; default: .visible }
    }
    private var backgroundInteraction: PresentationBackgroundInteraction {
        if case .reserve = sheet { return .enabled(upThrough: .medium) }
        return .automatic
    }
}

// MARK: - Cancel

struct CancelSheet: View {
    @Environment(AppModel.self) private var model
    @Environment(AppRouter.self) private var router
    let bookingID: BookingID
    @State private var reason: String?
    @State private var other = ""

    var body: some View {
        NavigationStack {
            if let b = model.booking(bookingID) {
                let p = model.cancelPreview(b)
                let alt = model.sameClassThisWeek(b)
                ScrollView {
                    VStack(alignment: .leading, spacing: 16) {
                        Text("Cancel \(b.title)?").font(.title3.bold()).accessibilityAddTraits(.isHeader)
                        Text("\(b.title.uppercased()) · \(b.start.cpWeekdayShort.uppercased()) \(b.start.cpTime.uppercased())").eyebrowStyle()
                        consequences(b, p)
                        VStack(spacing: 8) {
                            Button("Keep my spot") { router.dismissSheet() }.primaryAction(full: true)
                            if !alt.isEmpty, b.kind == .classSession {
                                Button("Reschedule instead") {
                                    router.dismissSheet()
                                    router.day = alt[0].start.startOfAZDay; router.segment = .classes
                                    router.viewingClubID = alt[0].clubID; router.selection = .book; router.paths[.book] = []
                                }.secondaryAction(full: true)
                            }
                            Button("Cancel booking") { confirm(b, p) }.linkAction(danger: true).frame(maxWidth: .infinity)
                        }
                        if !p.late { reasons }
                    }
                    .padding(16)
                }
                .toolbar { ToolbarItem(placement: .topBarLeading) { Button("Close") { router.dismissSheet() } } }
                .navigationBarTitleDisplayMode(.inline)
            } else {
                ContentUnavailableView("Booking not found", systemImage: "ticket")
            }
        }
    }

    @ViewBuilder private func consequences(_ b: Booking, _ p: CancelPreview) -> some View {
        VStack(alignment: .leading, spacing: 8) {
            switch b.kind {
            case .kids: Text("Kids club has no late-cancel strikes.")
            case .pt:
                Text(p.late ? "Counts as a used session." : "Free until \(p.freeUntil.cpWeekdayShort) \(p.freeUntil.cpTime) (24 hours before).")
            default:
                if !p.late { Text("You can rebook until it fills.") }
                else {
                    if p.pausesBookings {
                        Label("This is your 3rd strike. New bookings pause for 3 days, until \(p.pauseEnds.cpWeekdayShort) \(p.pauseEnds.cpDayMonth).", systemImage: "xmark.circle.fill").foregroundStyle(Color.statusDanger)
                    } else {
                        Label("Counts as a strike (\(p.strikeNumber) of 3 in 30 days)", systemImage: "xmark.circle.fill").foregroundStyle(Color.statusDanger)
                    }
                    if b.kind == .classSession { Label("Your spot goes to the next person on the waitlist", systemImage: "xmark.circle.fill").foregroundStyle(Color.statusDanger) }
                    Text("3 strikes in 30 days pause new bookings for 3 days.").font(.footnote).foregroundStyle(Color.textMuted)
                }
            }
        }
        .font(.subheadline)
        .frame(maxWidth: .infinity, alignment: .leading)
    }

    private var reasons: some View {
        VStack(alignment: .leading, spacing: 4) {
            Text("Why are you cancelling?").font(.footnote.weight(.semibold)).foregroundStyle(Color.textMuted)
            ForEach(["Schedule changed", "Feeling unwell", "Booked by mistake", "Other reason"], id: \.self) { r in
                Button { reason = r } label: {
                    HStack { Image(systemName: reason == r ? "largecircle.fill.circle" : "circle").foregroundStyle(reason == r ? Color.brandAccent : Color.borderStrong)
                        Text(r).foregroundStyle(Color.textPrimary); Spacer() }
                    .frame(minHeight: 44).contentShape(Rectangle())
                }.buttonStyle(.plain).accessibilityAddTraits(reason == r ? .isSelected : [])
            }
            if reason == "Other reason" { TextField("Tell us more (optional)", text: $other).textFieldStyle(.roundedBorder) }
        }
    }

    private func confirm(_ b: Booking, _ p: CancelPreview) {
        let result = model.cancel(b.id, reason: reason == "Other reason" ? other : reason)
        router.dismissSheet()
        if let r = result, r.late { model.showToast(r.countsStrike ? "Cancelled. That counts as a late cancel." : "Cancelled.") }
        // Remove the detail page for a booking that is gone.
    }
}

// MARK: - Waitlist

struct WaitlistSheet: View {
    @Environment(AppModel.self) private var model
    @Environment(AppRouter.self) private var router
    let sessionID: SessionID
    @State private var agreed = false

    var body: some View {
        NavigationStack {
            if let s = model.session(sessionID) {
                Form {
                    Section {
                        Text(s.name).font(.headline)
                        if model.activeWaitlists >= 5 {
                            Banner(tone: .warning, text: "You are on 5 waitlists. Leave one to join another.", actionTitle: "See my waitlists") { router.dismissSheet(); router.push(.myBookings) }
                        } else {
                            Text("You are \(ordinal(model.waitlistCount(s) + 1)) in line. We add you until \(s.start.addingTimeInterval(-3600).cpTime) (1 hour before class). When a spot opens, you get a push and 30 minutes to confirm. Late cancels count as strikes.").font(.body)
                        }
                    }
                    if model.activeWaitlists < 5 {
                        Section {
                            Toggle("I understand the late-cancel rule.", isOn: $agreed)
                            if !model.notificationsAuthorized { Label("Alerts are off. Turn them on so you do not miss a spot.", systemImage: "bell.slash").font(.footnote).foregroundStyle(Color.textMuted) }
                        }
                        Section { Button("Pick another class") { router.dismissSheet() }.linkAction() }
                    }
                }
                .navigationTitle("Join waitlist").navigationBarTitleDisplayMode(.inline)
                .toolbar {
                    ToolbarItem(placement: .cancellationAction) { Button("Cancel") { router.dismissSheet() } }
                    ToolbarItem(placement: .confirmationAction) {
                        Button("Join") {
                            if let b = model.joinWaitlist(s) {
                                Task { _ = await NotificationSupport.shared.requestAuthorization() }
                                router.dismissSheet(); model.announceBooked(b)
                            }
                        }.disabled(!agreed || model.activeWaitlists >= 5).fontWeight(.semibold)
                    }
                }
            }
        }
    }
    private func ordinal(_ n: Int) -> String {
        let f = NumberFormatter(); f.numberStyle = .ordinal; return f.string(from: NSNumber(value: n)) ?? "\(n)th"
    }
}

// MARK: - Reserve (courts, lanes, kids club)

struct ReserveSheet: View {
    @Environment(AppModel.self) private var model
    @Environment(AppRouter.self) private var router
    let request: ReserveRequest
    @State private var duration = 90
    @State private var court = 0           // 0 = any
    @State private var lane = 0
    @State private var chosenKids: Set<PersonID> = []
    @State private var note = ""
    @State private var error: String?
    @State private var reserved = false

    private var club: Club { model.club(request.clubID) }
    private var req: ReserveRequest {
        var r = request; r.duration = request.kind == .court ? duration : request.duration; return r
    }

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(alignment: .leading, spacing: 16) {
                    holdBanner
                    Text(summary).font(.headline)
                    switch request.kind {
                    case .court: courtBody
                    case .lane: laneBody
                    case .kidsClub: kidsBody
                    }
                    if let error { Label(error, systemImage: "xmark.circle.fill").font(.subheadline).foregroundStyle(Color.statusDanger) }
                    reserveButton
                }
                .padding(16)
            }
            .navigationTitle(request.kind == .court ? "Reserve court" : (request.kind == .lane ? "Reserve lane" : "Kids club"))
            .navigationBarTitleDisplayMode(.inline)
            .toolbar { ToolbarItem(placement: .topBarLeading) { Button("Cancel") { router.dismissSheet() } } }
        }
        .onAppear { reserved = false; duration = request.duration == 60 ? 60 : (request.kind == .court ? request.duration : 90); model.beginHold(req, label: summary) }
        .onDisappear { if !reserved { model.endHold() } }
        .onChange(of: duration) { _, _ in model.beginHold(req, label: summary) }
    }

    private var summary: String {
        switch request.kind {
        case .court: "\(request.sport?.title ?? "Court") · \(request.start.cpFormat("EEE MMM d")) · \(club.fullName)"
        case .lane: "Lap swim · \(request.start.cpFormat("EEE MMM d")), \(request.start.cpTime) · \(club.fullName)"
        case .kidsClub: "\(club.fullName) · \(request.start.cpFormat("EEE MMM d")), \(request.start.cpTimeShort)–\(request.start.addingTimeInterval(7200).cpTimeShort)"
        }
    }

    // Hold banner: 5 minutes, one extension
    @ViewBuilder private var holdBanner: some View {
        TimelineView(.periodic(from: .now, by: 1)) { _ in
            if let h = model.hold, h.expires > model.now {
                let secs = Int(h.expires.timeIntervalSince(model.now))
                ViewThatFits(in: .horizontal) {
                    HStack {
                        Label("Holding \(holdName) for \(secs / 60):\(String(format: "%02d", secs % 60))", systemImage: "timer").font(.subheadline.weight(.semibold)).monospacedDigit()
                        Spacer()
                        if !h.extended { Button("Add 5 minutes") { model.extendHold() }.linkAction().font(.subheadline) }
                    }
                    VStack(alignment: .leading, spacing: 4) {
                        Label("Holding \(holdName) for \(secs / 60):\(String(format: "%02d", secs % 60))", systemImage: "timer").font(.subheadline.weight(.semibold)).monospacedDigit()
                        if !h.extended { Button("Add 5 minutes") { model.extendHold() }.linkAction().font(.subheadline) }
                    }
                }
                .padding(12).background(Color.statusWarningSubtle, in: RoundedRectangle(cornerRadius: 12, style: .continuous))
            } else if !reserved {
                // Only a real expiry shows this. A successful reserve clears the hold too, and must not look like a failure.
                Banner(tone: .danger, text: "Your hold ended. Pick the time again.", actionTitle: "Hold again") { model.beginHold(req, label: summary) }
            }
        }
        .sensoryFeedback(.error, trigger: model.holdExpiredCount)
    }
    private var holdName: String {
        switch request.kind {
        case .court: court == 0 ? "a court" : "Court \(court)"
        case .lane: lane == 0 ? "a lane" : "Lane \(lane)"
        case .kidsClub: "this block"
        }
    }

    // Courts
    @ViewBuilder private var courtBody: some View {
        let sport = request.sport ?? .pickleball
        let slot = model.courtSlots(club: club, sport: sport, day: request.start.startOfAZDay, duration: duration).first { $0.start == request.start }
        DurationChips(options: [60, 90], selected: $duration)
        VStack(alignment: .leading, spacing: 4) {
            Text("Court").font(.subheadline.weight(.semibold))
            ChoiceList(selection: $court, options: [(0, "Any court", nil)] + (1...max(club.courts(for: sport), 1)).map { c in
                (c, "Court \(c)", (slot?.free.contains(c) ?? false) ? nil : "Taken") })
        }
        Text("Add a partner after you reserve.").font(.footnote).foregroundStyle(Color.textMuted)
        Text("Included with \(model.member.plan.name)").font(.subheadline.weight(.medium))
        Text("Free cancel until \(request.start.addingTimeInterval(-7200).cpTime) Later is a late cancel.").font(.footnote).foregroundStyle(Color.textMuted)
    }

    @ViewBuilder private var laneBody: some View {
        let slot = model.laneSlots(club: club, day: request.start.startOfAZDay).first { $0.start == request.start }
        LabeledContent("Length", value: "45 min").font(.subheadline)
        ChoiceList(selection: $lane, options: [(0, "Any lane", nil)] + (1...max(club.lanes, 1)).map { l in
            let sw = slot?.swimmers[l - 1] ?? 2
            return (l, "Lane \(l)", sw == 1 ? "1 of 2 swimmers" : (sw >= 2 ? "Full" : nil)) })
        Text("Free cancel until \(request.start.addingTimeInterval(-7200).cpTime)").font(.footnote).foregroundStyle(Color.textMuted)
    }

    @ViewBuilder private var kidsBody: some View {
        let blk = model.kidsBlocks(club: club, day: request.start.startOfAZDay).first { $0.index == request.block }
        VStack(alignment: .leading, spacing: 0) {
            Text("Children").font(.subheadline.weight(.semibold)).padding(.bottom, 4)
            ForEach(model.kidsEligible) { c in
                Button { if chosenKids.contains(c.id) { chosenKids.remove(c.id) } else { chosenKids.insert(c.id) } } label: {
                    HStack { Text("\(c.first), \(c.age)").foregroundStyle(Color.textPrimary); Spacer()
                        Image(systemName: chosenKids.contains(c.id) ? "checkmark.circle.fill" : "circle").foregroundStyle(chosenKids.contains(c.id) ? Color.brandAccent : Color.borderStrong) }
                    .frame(minHeight: 48).contentShape(Rectangle())
                }.buttonStyle(.plain).accessibilityAddTraits(chosenKids.contains(c.id) ? .isSelected : [])
                Divider()
            }
            if model.kidsEligible.isEmpty { Text("No children aged 6 months to 12 years on your plan.").font(.subheadline).foregroundStyle(Color.textMuted) }
        }
        TextField("Allergies or notes (140 characters)", text: $note, axis: .vertical).textFieldStyle(.roundedBorder)
            .onChange(of: note) { _, n in if n.count > 140 { note = String(n.prefix(140)) } }
        if let blk { CapacityIndicator(left: blk.spotsLeft, capacity: blk.capacity, noun: "spots") }
        Text("Up to 2 blocks per child a day.").font(.footnote).foregroundStyle(Color.textMuted)
        Text("Check in at \(club.fullName) by \(request.start.addingTimeInterval(15 * 60).cpTime) or we release the block.").font(.footnote).foregroundStyle(Color.textMuted)
        Text("Kids club has no strikes.").font(.footnote).foregroundStyle(Color.textMuted)
    }

    private var reserveButton: some View {
        let blk = model.kidsBlocks(club: club, day: request.start.startOfAZDay).first { $0.index == request.block }
        let kidsFull = request.kind == .kidsClub && (blk?.spotsLeft ?? 1) == 0
        let title: String = switch request.kind {
        case .court: court == 0 ? "Reserve court" : "Reserve Court \(court)"
        case .lane: lane == 0 ? "Reserve lane" : "Reserve Lane \(lane)"
        case .kidsClub: kidsFull ? "Join waitlist" : (chosenKids.isEmpty ? "Reserve spots" : "Reserve \(chosenKids.count) spot\(chosenKids.count == 1 ? "" : "s")")
        }
        return Button(title) {
            error = nil
            let result: ReserveResult
            switch request.kind {
            case .court: result = model.reserveCourt(req, court: court == 0 ? nil : court)
            case .lane: result = model.reserveLane(req, lane: lane == 0 ? nil : lane)
            case .kidsClub:
                let kids = model.kidsEligible.filter { chosenKids.contains($0.id) }
                if kidsFull { if let b = model.joinKidsWaitlist(req, children: kids) { reserved = true; router.dismissSheet(); model.announceBooked(model.booking(b.id)) }; return }
                result = model.reserveKids(req, children: kids, note: note)
            }
            switch result {
            case .ok(let b): reserved = true; router.dismissSheet(); model.announceBooked(model.booking(b.id))
            case .failed(let m): error = m
            }
        }
        .primaryAction(full: true)
        .disabled(request.kind == .kidsClub && chosenKids.isEmpty)
    }
}

// MARK: - Club switcher

struct ClubSwitcherSheet: View {
    @Environment(AppModel.self) private var model
    @Environment(AppRouter.self) private var router
    let mode: SwitcherMode
    @State private var query = ""

    var body: some View {
        NavigationStack {
            List {
                ForEach(clubs) { c in
                    let reason = disabledReason(c)
                    Button { select(c) } label: {
                        HStack(spacing: 12) {
                            VStack(alignment: .leading, spacing: 2) {
                                Text(c.fullName).font(.body.weight(.semibold)).foregroundStyle(reason == nil ? Color.textPrimary : Color.textMuted)
                                Text(reason ?? "\(c.kind) · \(String(format: "%.1f mi", c.distanceMiles))").font(.footnote).foregroundStyle(Color.textMuted)
                            }
                            Spacer()
                            if isSelected(c) { Image(systemName: "checkmark").foregroundStyle(Color.brandAccent).fontWeight(.bold) }
                        }
                        .frame(minHeight: 48).contentShape(Rectangle())
                    }
                    .buttonStyle(.plain).disabled(reason != nil)
                    .accessibilityAddTraits(isSelected(c) ? .isSelected : [])
                }
            }
            .searchable(text: $query, prompt: "Club or city")
            .navigationTitle(title).navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) { Button("Done") { router.dismissSheet() }.fontWeight(.semibold) }
                if case .filter = mode { ToolbarItem(placement: .topBarLeading) { Button("Reset") { router.filters.clubs = [] } } }
            }
        }
    }

    private var title: String {
        switch mode { case .pass: "Check in at"; case .filter: "Clubs"; case .viewing: "Club"; case .reserve(let k): k.title }
    }
    private var clubs: [Club] {
        model.clubs.filter { query.isEmpty || $0.fullName.localizedCaseInsensitiveContains(query) || $0.zip.contains(query) }
    }
    private func isSelected(_ c: Club) -> Bool {
        switch mode {
        case .viewing: router.viewingClubID == c.id
        case .pass: model.passClubID == c.id
        case .filter: router.filters.clubs.contains(c.id)
        case .reserve(let k): router.reserveClub[k] == c.id
        }
    }
    private func disabledReason(_ c: Club) -> String? {
        if model.member.plan == .trailhead, c.id != model.member.homeClubID, mode != .viewing { if case .pass = mode { return nil }; return "Ridge only" }
        if case .reserve(let k) = mode {
            switch k { case .court: if !c.hasCourts { return "No courts here" }
            case .lane: if !c.hasPool { return "No pool here" }
            case .kidsClub: if !c.hasKids { return "No kids club here" } }
        }
        return nil
    }
    private func select(_ c: Club) {
        switch mode {
        case .viewing: router.viewingClubID = c.id; router.dismissSheet()
        case .pass: model.passClubID = c.id; router.dismissSheet()
        case .filter: if router.filters.clubs.contains(c.id) { router.filters.clubs.remove(c.id) } else { router.filters.clubs.insert(c.id) }
        case .reserve(let k): router.reserveClub[k] = c.id; if k == .court, c.courts(for: router.sport) == 0, let sp = c.courtSports.first { router.sport = sp }; router.dismissSheet()
        }
    }
}

// MARK: - Hours

struct HoursSheet: View {
    @Environment(AppModel.self) private var model
    @Environment(AppRouter.self) private var router
    @Environment(\.openURL) private var openURL
    let clubID: ClubID
    var body: some View {
        let club = model.club(clubID)
        NavigationStack {
            List {
                Section("Hours") { HoursTable(club: club, now: model.now) }
                Section {
                    Text("6:00 a.m.–8:00 p.m.").monospacedDigit()
                } header: { Text("Desk staffed") } footer: { Text("Door readers work whenever the club is open.") }
                if club.hasKids {
                    Section("Kids club") {
                        Text("Mon–Sat 8:00–10:00 a.m., 10:00 a.m.–12:00 p.m., 4:00–6:00 p.m., 6:00–8:00 p.m.")
                        Text("Ages 6 months to 12 years.").foregroundStyle(Color.textMuted)
                    }
                }
                if club.hasPool { Section("Pool") { Text("Closes 30 minutes before the club.") } }
                Section("Holiday hours") { Text("Thanksgiving, Nov 26: 6:00 a.m.–2:00 p.m.") }
                Section { Button { openURL(URL(string: "tel:\(club.phone.filter(\.isNumber))")!) } label: { Label("Call the club · \(club.phone)", systemImage: "phone") } }
            }
            .navigationTitle(club.fullName).navigationBarTitleDisplayMode(.inline)
            .toolbar { ToolbarItem(placement: .topBarTrailing) { Button("Done") { router.dismissSheet() }.fontWeight(.semibold) } }
        }
    }
}

// MARK: - Invite a friend

struct InviteSheet: View {
    @Environment(AppModel.self) private var model
    @Environment(AppRouter.self) private var router
    let sessionID: SessionID
    @State private var copied = false
    var body: some View {
        let link = "https://app.cactuspeak.example/invite/class/\(sessionID.suffix(24))"
        NavigationStack {
            VStack(alignment: .leading, spacing: 16) {
                if let s = model.session(sessionID) { Text("Invite a friend to \(s.name)").font(.title3.bold()) }
                Text(link).font(.footnote.monospaced()).padding(12).frame(maxWidth: .infinity, alignment: .leading)
                    .background(Color.surfaceMuted, in: RoundedRectangle(cornerRadius: 10))
                HStack {
                    Button(copied ? "Copied" : "Copy link") { UIPasteboard.general.string = link; copied = true }.secondaryAction()
                    ShareLink(item: link) { Label("Share", systemImage: "square.and.arrow.up") }.primaryAction()
                }
                Text("Guest passes left this month: \(model.guestPassesLeft)").font(.subheadline).foregroundStyle(Color.textMuted)
                Spacer()
            }
            .padding(16)
            .navigationBarTitleDisplayMode(.inline)
            .toolbar { ToolbarItem(placement: .topBarTrailing) { Button("Done") { router.dismissSheet() }.fontWeight(.semibold) } }
        }
    }
}

// MARK: - Private feedback

struct FeedbackSheet: View {
    @Environment(AppModel.self) private var model
    @Environment(AppRouter.self) private var router
    let bookingID: BookingID
    @State private var choice: String?
    @State private var note = ""
    var body: some View {
        NavigationStack {
            Form {
                if let b = model.booking(bookingID) { Section { Text("How was \(b.title)?").font(.headline) } }
                Section {
                    Picker("Answer", selection: $choice) {
                        ForEach(["Great", "Okay", "Not for me"], id: \.self) { Text($0).tag(Optional($0)) }
                    }.pickerStyle(.inline).labelsHidden()
                }
                Section { TextField("Add a note (optional)", text: $note, axis: .vertical) } footer: { Text("Only the club sees this.") }
            }
            .navigationTitle("Feedback").navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .topBarLeading) { Button("Cancel") { router.dismissSheet() } }
                ToolbarItem(placement: .confirmationAction) {
                    Button("Send") { model.giveFeedback(bookingID, choice ?? "Okay"); router.dismissSheet(); model.showToast("Thanks. Only the club sees this.") }.disabled(choice == nil)
                }
            }
        }
    }
}

/// Inline single-choice list with a checkmark. Disabled rows say why.
struct ChoiceList: View {
    @Binding var selection: Int
    var options: [(Int, String, String?)]
    var body: some View {
        VStack(spacing: 0) {
            ForEach(options, id: \.0) { o in
                let off = o.2 == "Taken" || o.2 == "Full"
                Button { selection = o.0 } label: {
                    HStack {
                        Text(o.1).foregroundStyle(off ? Color.textMuted : Color.textPrimary)
                        if let n = o.2 { Text(n).font(.footnote).foregroundStyle(Color.textMuted) }
                        Spacer()
                        if selection == o.0 { Image(systemName: "checkmark").foregroundStyle(Color.brandAccent).fontWeight(.bold) }
                    }.frame(minHeight: 44).contentShape(Rectangle())
                }
                .buttonStyle(.plain).disabled(off)
                .accessibilityAddTraits(selection == o.0 ? .isSelected : [])
                Divider()
            }
        }
    }
}
