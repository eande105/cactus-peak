import SwiftUI
import PhotosUI

// MARK: - Filters

struct FiltersSheet: View {
    @Environment(AppModel.self) private var model
    @Environment(AppRouter.self) private var router
    var body: some View {
        @Bindable var router = router
        let ids = router.filters.clubs.isEmpty ? [router.viewingClubID] : Array(router.filters.clubs)
        let count = liveCount(ids)
        NavigationStack {
            Form {
                Section("Club") {
                    ForEach(model.clubs) { c in
                        let locked = model.member.plan == .trailhead && c.id != model.member.homeClubID
                        Button {
                            if router.filters.clubs.contains(c.id) { router.filters.clubs.remove(c.id) } else { router.filters.clubs.insert(c.id) }
                        } label: {
                            HStack { VStack(alignment: .leading) { Text(c.fullName).foregroundStyle(locked ? Color.textMuted : Color.textPrimary)
                                if locked { Text("Ridge only").font(.footnote).foregroundStyle(Color.textMuted) } }
                                Spacer(); if router.filters.clubs.contains(c.id) { Image(systemName: "checkmark").foregroundStyle(Color.brandAccent) } }
                            .frame(minHeight: 44).contentShape(Rectangle())
                        }.buttonStyle(.plain).disabled(locked)
                    }
                }
                Section("Category") {
                    ForEach(ClassCategory.allCases) { c in
                        Button { toggle(c) } label: {
                            HStack { Label { Text(c.title).foregroundStyle(Color.textPrimary) } icon: { Image(systemName: c.symbol).foregroundStyle(c.textColor) }
                                Spacer(); if router.filters.categories.contains(c) { Image(systemName: "checkmark").foregroundStyle(Color.brandAccent) } }
                            .frame(minHeight: 44).contentShape(Rectangle())
                        }.buttonStyle(.plain).accessibilityAddTraits(router.filters.categories.contains(c) ? .isSelected : [])
                    }
                }
                Section("Time of day") {
                    ForEach(TimeOfDay.allCases) { t in
                        Toggle(isOn: Binding(get: { router.filters.times.contains(t) }, set: { on in if on { router.filters.times.insert(t) } else { router.filters.times.remove(t) } })) {
                            VStack(alignment: .leading) { Text(t.rawValue); Text(t.detail).font(.footnote).foregroundStyle(Color.textMuted) }
                        }
                    }
                }
                Section {
                    HStack(spacing: 8) {
                        ForEach(1...5, id: \.self) { i in
                            Button { router.filters.maxIntensity = i } label: {
                                RoundedRectangle(cornerRadius: 4).fill(i <= router.filters.maxIntensity ? Color.brandAccent : Color.clear)
                                    .overlay(RoundedRectangle(cornerRadius: 4).strokeBorder(Color.borderStrong, lineWidth: 1.5))
                                    .frame(width: 28, height: 20 + CGFloat(i) * 6).frame(minHeight: 44, alignment: .bottom)
                            }.buttonStyle(.plain).accessibilityLabel("Up to \(Intensity.word(i))")
                        }
                        Spacer()
                        Text("Up to \(Intensity.word(router.filters.maxIntensity))").font(.subheadline.weight(.semibold))
                    }
                } header: { Text("Intensity") }
                Section("Options") {
                    Toggle("Good for first-timers", isOn: $router.filters.firstTimers)
                    Toggle("Spots open only", isOn: $router.filters.spotsOnly)
                    Toggle("My bookings", isOn: $router.filters.myBookings)
                }
            }
            .navigationTitle("Filters").navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .topBarLeading) { Button("Reset") { router.filters = ScheduleFilters() } }
                ToolbarItem(placement: .confirmationAction) {
                    Button("Show \(count) \(count == 1 ? "class" : "classes")") { router.dismissSheet() }.fontWeight(.semibold)
                }
            }
        }
    }
    private func toggle(_ c: ClassCategory) {
        if router.filters.categories.contains(c) { router.filters.categories.remove(c) } else { router.filters.categories.insert(c) }
    }
    private func liveCount(_ ids: [ClubID]) -> Int {
        let f = router.filters
        return ids.flatMap { model.sessions(club: $0, day: router.day) }.filter { s in
            (f.categories.isEmpty || f.categories.contains(s.category)) && (f.times.isEmpty || f.times.contains(TimeOfDay.of(s.start)))
            && s.intensity <= f.maxIntensity && (!f.firstTimers || s.firstTimers) && (!f.spotsOnly || model.spotsLeft(s) > 0)
            && (!f.myBookings || model.booking(forSession: s.id) != nil)
        }.count
    }
}

// MARK: - Date picker

struct DatePickerSheet: View {
    @Environment(AppModel.self) private var model
    @Environment(AppRouter.self) private var router
    var body: some View {
        @Bindable var router = router
        let kind: ReserveKind = router.segment == .courts ? .court : .kidsClub
        let last = model.reserveDays(kind).last ?? model.now
        NavigationStack {
            DatePicker("Day", selection: $router.day, in: model.now.startOfAZDay...last, displayedComponents: .date)
                .datePickerStyle(.graphical).environment(\.timeZone, AZ.tz).environment(\.calendar, AZ.cal).padding(.horizontal, 8)
                .navigationTitle("Pick a day").navigationBarTitleDisplayMode(.inline)
                .toolbar { ToolbarItem(placement: .confirmationAction) { Button("Done") { router.dismissSheet() }.fontWeight(.semibold) } }
        }
    }
}

// MARK: - Guest share

struct GuestShareSheet: View {
    @Environment(AppModel.self) private var model
    @Environment(AppRouter.self) private var router
    @State private var name = ""
    @State private var created: GuestPass?
    @State private var copied = false
    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(alignment: .leading, spacing: 16) {
                    if let created {
                        Image(systemName: "checkmark.circle.fill").font(.largeTitle).foregroundStyle(Color.statusSuccess)
                        Text("Pass sent").font(.title2.bold())
                        Text("\(created.guest.isEmpty ? "Your guest" : created.guest) has until \(created.expires.cpDayMonth) to use it.").font(.body)
                        let link = "https://app.cactuspeak.example/guest/\(created.id)"
                        Text(link).font(.footnote.monospaced()).padding(12).frame(maxWidth: .infinity, alignment: .leading).background(Color.surfaceMuted, in: RoundedRectangle(cornerRadius: 10))
                        HStack {
                            Button(copied ? "Copied" : "Copy link") { UIPasteboard.general.string = link; copied = true }.secondaryAction()
                            ShareLink(item: "\(created.guest), here is your free visit to Cactus Peak Athletic. Sign the waiver and show this at the desk: \(link)") { Label("Share", systemImage: "square.and.arrow.up") }.primaryAction()
                        }
                    } else {
                        Text("Share a guest pass").font(.title3.bold())
                        TextField("Guest first name (optional)", text: $name).textFieldStyle(.roundedBorder)
                        Text("Valid 14 days from today (until \(model.now.startOfAZDay.addingDays(14).cpDayMonth)). One visit, one club. Guest must be 18 or older, or 16 to 17 with a guardian waiver.")
                            .font(.subheadline).foregroundStyle(Color.textMuted)
                        Button("Create guest link") { created = model.guestPasses.first ?? nil; model.shareGuestPass(name: name); created = model.guestPasses.first }
                            .primaryAction(full: true).disabled(model.guestPassesLeft == 0)
                    }
                }
                .padding(16)
            }
            .navigationBarTitleDisplayMode(.inline)
            .toolbar { ToolbarItem(placement: .topBarTrailing) { Button("Done") { router.dismissSheet() }.fontWeight(.semibold) } }
            .sensoryFeedback(.success, trigger: created?.id)
        }
    }
}

// MARK: - Add family member

struct AddFamilySheet: View {
    @Environment(AppModel.self) private var model
    @Environment(AppRouter.self) private var router
    @SceneStorage("fam.first") private var first = ""
    @SceneStorage("fam.last") private var last = ""
    @SceneStorage("fam.email") private var email = ""
    @SceneStorage("fam.adult") private var adult = false
    @State private var age = 9
    @State private var guardian = false
    @State private var confirmDiscard = false
    @State private var photo: PhotosPickerItem?

    private var dirty: Bool { !first.isEmpty || !last.isEmpty || !email.isEmpty }
    private var cost: Int { adult ? 39 : 19 }
    private var needsEmail: Bool { adult || age >= 13 }
    private var valid: Bool { !first.isEmpty && !last.isEmpty && (!needsEmail || email.contains("@")) && (adult || guardian) && (adult || age >= 0) }

    var body: some View {
        NavigationStack {
            Form {
                Section {
                    Picker("Type", selection: $adult) {
                        Text("Adult +$39/mo").tag(true)
                        Text("Child +$19/mo (6 months to 17)").tag(false)
                    }.pickerStyle(.inline).labelsHidden()
                }
                Section("Details") {
                    TextField("First name", text: $first).textContentType(.givenName)
                    TextField("Last name", text: $last).textContentType(.familyName)
                    if !adult { Stepper("Age \(age)", value: $age, in: 0...17) }
                    TextField(needsEmail ? "Email" : "Email (optional)", text: $email).textContentType(.emailAddress).keyboardType(.emailAddress).textInputAutocapitalization(.never)
                    PhotosPicker(selection: $photo, matching: .images) { Label("Add a photo", systemImage: "photo") }
                    if !adult && age < 1 { Text("Kids club starts at 6 months.").font(.footnote).foregroundStyle(Color.statusWarning) }
                    if !adult && age >= 13 { Text("\(first.isEmpty ? "They" : first) can use the app and check in. You manage billing.").font(.footnote).foregroundStyle(Color.textMuted) }
                }
                Section {
                    Text("+$\(cost)/mo from your next bill on \(model.nextBillDate.cpDayMonth).")
                    if !adult { Toggle("I am this child's parent or guardian.", isOn: $guardian) }
                } footer: { Text("The invite link is valid for 7 days.") }
            }
            .navigationTitle("Add member").navigationBarTitleDisplayMode(.inline)
            .interactiveDismissDisabled(dirty)
            .toolbar {
                ToolbarItem(placement: .topBarLeading) { Button("Cancel") { if dirty { confirmDiscard = true } else { router.dismissSheet() } } }
                ToolbarItem(placement: .confirmationAction) {
                    Button(adult || age >= 13 ? "Send invite" : "Add") {
                        model.addPerson(first: first, last: last, adult: adult, age: adult ? 30 : age)
                        first = ""; last = ""; email = ""
                        router.dismissSheet()
                    }.disabled(!valid).fontWeight(.semibold)
                }
            }
            .confirmationDialog("Discard this member?", isPresented: $confirmDiscard) {
                Button("Discard", role: .destructive) { first = ""; last = ""; email = ""; router.dismissSheet() }
                Button("Keep editing", role: .cancel) {}
            }
        }
    }
}

// MARK: - Plans

struct ComparePlansSheet: View {
    @Environment(AppRouter.self) private var router
    @Environment(\.dynamicTypeSize) private var dts
    private let rows: [(String, [String])] = [
        ("Clubs", ["Home club", "All 5", "All 5"]),
        ("Classes and pools", ["Home club", "Yes", "Yes"]),
        ("Courts", ["Not included", "3 days ahead", "3 days ahead"]),
        ("Recovery suite", ["Stretch & Release classes", "Stretch & Release classes", "Included"]),
        ("Class booking window", ["7 days", "7 days", "9 days"]),
        ("Guest passes", ["Not included", "1 a month", "4 a month"]),
        ("Towel service", ["Not included", "Not included", "Included"]),
        ("PT intro session", ["Not included", "Not included", "1 a quarter"]),
    ]
    var body: some View {
        NavigationStack {
            Group {
                if dts.isAccessibilitySize {
                    List {
                        ForEach(Array(PlanTier.allCases.enumerated()), id: \.element) { i, p in
                            Section(p.name) { ForEach(rows, id: \.0) { r in LabeledContent(r.0, value: r.1[i]) } }
                        }
                    }
                } else {
                    ScrollView {
                        Grid(alignment: .leading, horizontalSpacing: 10, verticalSpacing: 0) {
                            GridRow {
                                Color.clear.gridCellUnsizedAxes([.horizontal, .vertical])
                                ForEach(PlanTier.allCases) { p in
                                    VStack(alignment: .leading) { Text(p.name).font(.subheadline.weight(.bold)); Text("$\(p.price)/mo").font(.caption).monospacedDigit().foregroundStyle(Color.textMuted) }
                                }
                            }
                            Divider().gridCellColumns(4)
                            ForEach(rows, id: \.0) { r in
                                GridRow(alignment: .top) {
                                    Text(r.0).font(.footnote.weight(.semibold))
                                    ForEach(0..<3, id: \.self) { i in
                                        let v = r.1[i]
                                        HStack(alignment: .top, spacing: 3) {
                                            Image(systemName: v == "Not included" ? "minus" : "checkmark").font(.caption2.weight(.bold)).foregroundStyle(v == "Not included" ? Color.textMuted : Color.statusSuccess).padding(.top, 3)
                                            Text(v).font(.caption).foregroundStyle(v == "Not included" ? Color.textMuted : Color.textPrimary)
                                        }
                                    }
                                }
                                .padding(.vertical, 10)
                                Divider().gridCellColumns(4)
                            }
                        }
                        .padding(16)
                    }
                }
            }
            .navigationTitle("Compare plans").navigationBarTitleDisplayMode(.inline)
            .toolbar { ToolbarItem(placement: .topBarTrailing) { Button("Done") { router.dismissSheet() }.fontWeight(.semibold) } }
        }
    }
}

struct PlanConfirmSheet: View {
    @Environment(AppModel.self) private var model
    @Environment(AppRouter.self) private var router
    let plan: PlanTier
    var body: some View {
        let q = model.planQuote(to: plan)
        NavigationStack {
            ScrollView {
                VStack(alignment: .leading, spacing: 14) {
                    Text(q.isUpgrade ? "Switch to \(plan.name)?" : "Move to \(plan.name)?").font(.title3.bold())
                    if q.isUpgrade {
                        VStack(spacing: 8) {
                            LabeledContent("\(plan.name) from now", value: "$\(plan.price)/mo")
                            LabeledContent("Difference", value: "+$\(q.delta)/mo")
                            LabeledContent("Prorated by day for the rest of this cycle", value: "$\(q.proratedToday).00")
                            Divider()
                            LabeledContent("Today's total") { Text("$\(q.proratedToday).00").fontWeight(.bold) }
                        }.font(.subheadline).monospacedDigit()
                        Text("\(plan.name) starts today. From \(model.nextBillDate.cpDayMonth) your bill is $\(model.nextBillTotal + q.delta).00 a month.").font(.subheadline).foregroundStyle(Color.textMuted)
                    } else {
                        Text("Takes effect on your next billing date, \(q.effective.cpDayMonth).").font(.body)
                        ForEach(q.lost, id: \.self) { Label($0, systemImage: "xmark.circle.fill").font(.subheadline).foregroundStyle(Color.statusDanger) }
                    }
                    HStack {
                        Button("Keep \(model.member.plan.name)") { router.dismissSheet() }.secondaryAction(full: true)
                        Button("Switch to \(plan.name)") {
                            model.changePlan(to: plan); router.dismissSheet()
                            model.showToast(q.isUpgrade ? "You're on \(plan.name)." : "\(plan.name) starts \(q.effective.cpDayMonth).")
                        }.primaryAction(full: true)
                    }
                }.padding(16)
            }
            .navigationBarTitleDisplayMode(.inline)
            .toolbar { ToolbarItem(placement: .topBarLeading) { Button("Close") { router.dismissSheet() } } }
        }
    }
}

struct FreezeConfirmSheet: View {
    @Environment(AppModel.self) private var model
    @Environment(AppRouter.self) private var router
    let months: Int
    var body: some View {
        let q = model.freezeQuote(months: months)
        VStack(spacing: 16) {
            Image(systemName: "pause.circle.fill").font(.system(size: 52)).foregroundStyle(Color.brandSecondary).padding(.top, 24).accessibilityHidden(true)
            Text("Freeze from \(q.start.cpDayMonth)?").font(.title2.bold())
            Text("Billing pauses until \(q.restart.cpDayMonth). You can't check in or book while frozen.").font(.subheadline).foregroundStyle(Color.textMuted).multilineTextAlignment(.center)
            Button("Freeze membership") { model.setFreeze(months: months); router.dismissSheet() }.primaryAction(full: true)
            Button("Not now") { router.dismissSheet() }.linkAction()
        }
        .padding(.horizontal, 16)
    }
}

// MARK: - PT picker

struct PTPickerSheet: View {
    @Environment(AppModel.self) private var model
    @Environment(AppRouter.self) private var router
    let coachID: CoachID
    @State private var day = AppModel.shared.now.startOfAZDay
    @State private var chosen: Date?
    @State private var message: String?
    var body: some View {
        let coach = model.coach(coachID)
        NavigationStack {
            List {
                Section {
                    HStack(spacing: 12) { InstructorChip(coach: coach, large: true); Spacer(); Image(systemName: "checkmark.circle.fill").foregroundStyle(Color.brandAccent) }
                    Text("Available 8 a.m.–8 p.m.").font(.footnote).foregroundStyle(Color.textMuted)
                }
                Section {
                    ScrollView(.horizontal) {
                        HStack { ForEach(0..<7, id: \.self) { i in
                            let d = model.now.startOfAZDay.addingDays(i)
                            Button { day = d; chosen = nil } label: { AmenityChip(label: d.cpFormat("EEE d"), symbol: nil, isSelected: AZ.cal.isDate(d, inSameDayAs: day)) }.buttonStyle(.plain).frame(minHeight: 44)
                        } }
                    }.scrollIndicators(.hidden)
                }
                let slots = model.ptSlots(coach: coach, day: day)
                ForEach([("Morning", slots.filter { AZ.cal.component(.hour, from: $0.start) < 12 }), ("Afternoon and evening", slots.filter { AZ.cal.component(.hour, from: $0.start) >= 12 })], id: \.0) { g in
                    Section(g.0) {
                        ForEach(g.1) { s in
                            Button { if s.available { chosen = s.start } } label: {
                                HStack { Circle().fill(s.available ? Color.statusSuccess : Color.borderStrong).frame(width: 8, height: 8).accessibilityHidden(true)
                                    Text(s.start.cpTime).monospacedDigit().foregroundStyle(s.available ? Color.textPrimary : Color.textMuted)
                                    Spacer(); Text(s.available ? "Available" : "Booked").font(.footnote).foregroundStyle(Color.textMuted)
                                    if chosen == s.start { Image(systemName: "checkmark").foregroundStyle(Color.brandAccent) } }
                                .frame(minHeight: 44).contentShape(Rectangle())
                            }.buttonStyle(.plain).disabled(!s.available).accessibilityAddTraits(chosen == s.start ? .isSelected : [])
                        }
                    }
                }
                Section {
                    if let message { Text(message).font(.subheadline).foregroundStyle(Color.textPrimary) }
                    Text("Sessions are \(model.ptIntroAvailable ? "30 min for your Summit intro" : "45 min"). Free cancel or reschedule up to 24 hours before.").font(.footnote).foregroundStyle(Color.textMuted)
                    Button(model.isTeen ? "Ask \(model.member.ownerFirst) to approve" : (model.ptIntroAvailable ? "Book intro session" : "Book session")) {
                        guard let chosen else { return }
                        switch model.bookPT(coach: coach, start: chosen) {
                        case .ok(let b): router.dismissSheet(); model.announceBooked(model.booking(b.id))
                        case .requestSent(let m): message = m
                        case .failed(let m): message = m
                        }
                    }.primaryAction(full: true).disabled(chosen == nil)
                }
            }
            .navigationTitle("Personal training").navigationBarTitleDisplayMode(.inline)
            .toolbar { ToolbarItem(placement: .topBarLeading) { Button("Cancel") { router.dismissSheet() } } }
        }
    }
}

// MARK: - Profile, calendar, goal

struct EditProfileSheet: View {
    @Environment(AppModel.self) private var model
    @Environment(AppRouter.self) private var router
    @State private var photo: PhotosPickerItem?
    var body: some View {
        @Bindable var model = model
        NavigationStack {
            Form {
                Section { PhotosPicker(selection: $photo, matching: .images) { Label("Change photo", systemImage: "camera") } }
                Section("Name") { TextField("First name", text: $model.member.first); TextField("Last name", text: $model.member.last) }
                Section("Contact") { TextField("Email", text: $model.member.email).keyboardType(.emailAddress).textInputAutocapitalization(.never) }
            }
            .navigationTitle("Edit profile").navigationBarTitleDisplayMode(.inline)
            .toolbar { ToolbarItem(placement: .confirmationAction) { Button("Done") { router.dismissSheet() }.fontWeight(.semibold) } }
        }
    }
}

struct CalendarSheet: View {
    @Environment(AppModel.self) private var model
    @Environment(AppRouter.self) private var router
    let bookingID: BookingID
    var body: some View {
        if let b = model.booking(bookingID) {
            let club = model.club(b.clubID)
            EventEditor(title: "\(b.title) · \(club.fullName)", location: club.address, start: b.start, end: b.end,
                        url: URL(string: "https://app.cactuspeak.example/book/class/\(b.sessionID ?? b.id)")) { saved in
                if saved { model.calendarAdded.insert(b.id); model.showToast("Added to calendar.") }
                router.dismissSheet()
            }
            .ignoresSafeArea()
        }
    }
}

struct GoalSheet: View {
    @Environment(AppModel.self) private var model
    @Environment(AppRouter.self) private var router
    var body: some View {
        @Bindable var model = model
        NavigationStack {
            Form {
                Stepper(value: $model.weeklyGoal, in: 1...5) {
                    VStack(alignment: .leading) { Text("Weekly goal").font(.headline); Text("\(model.weeklyGoal) visits a week").font(.subheadline).foregroundStyle(Color.textMuted) }
                }
                Text("A streak week meets your goal. One rest week is forgiven per 10 weeks.").font(.footnote).foregroundStyle(Color.textMuted)
            }
            .navigationTitle("Weekly goal").navigationBarTitleDisplayMode(.inline)
            .toolbar { ToolbarItem(placement: .confirmationAction) { Button("Done") { router.dismissSheet() }.fontWeight(.semibold) } }
        }
    }
}
