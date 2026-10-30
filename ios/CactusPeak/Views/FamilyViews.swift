import SwiftUI

struct FamilyView: View {
    @Environment(AppModel.self) private var model
    @Environment(AppRouter.self) private var router
    @State private var removePlan = false
    @State private var removeTarget: Person?

    var body: some View {
        List {
            Section {
                ForEach(model.people) { p in
                    NavigationLink(value: AppRoute.familyMember(p.id)) {
                        HStack(spacing: 12) {
                            Avatar(initials: String(p.first.prefix(1) + p.last.prefix(1)), category: nil, size: 40)
                            VStack(alignment: .leading, spacing: 2) {
                                Text(p.first == model.member.first && p.role != .admin ? "\(p.name) (you)" : p.name).font(.headline)
                                Text(p.invitePending ? "\(p.roleLabel) · Invite pending" : p.roleLabel).font(.subheadline).foregroundStyle(Color.textMuted)
                                if p.invitePending { Button("Send a reminder?") { model.showToast("Reminder sent to \(p.first).") }.linkAction().font(.subheadline) }
                            }
                        }
                        .frame(minHeight: 56).accessibilityElement(children: .combine)
                    }
                    .swipeActions { if p.role != .admin && model.isOwner { Button("Remove", role: .destructive) { removeTarget = p } } }
                }
                if model.isOwner { Button { router.present(.addFamily) } label: { Label("Add a family member", systemImage: "plus") } }
            } header: { Text("People") } footer: { Text("Family add-ons: +$39 per adult, +$19 per child (6 months to 17). Same access as your plan. Kids club is included for children 12 and under. Teens 13 to 17 follow the teen rules.") }
            if model.isOwner {
                Section("Billing") {
                    LabeledContent("Managed by you", value: "Next bill \(model.nextBillDate.cpDayMonth) · $\(model.nextBillTotal).00").font(.subheadline)
                }
                Section { Button("Remove family plan", role: .destructive) { removePlan = true } }
            } else {
                Section { Text("Ask \(model.member.ownerFirst) to change this.").font(.subheadline).foregroundStyle(Color.textMuted) }
            }
        }
        .listStyle(.insetGrouped).scrollContentBackground(.hidden).background(Color.appBackground)
        .navigationTitle("Family").navigationBarTitleDisplayMode(.inline)
        .toolbar { if model.isOwner { ToolbarItem(placement: .topBarTrailing) { Button { router.present(.addFamily) } label: { Image(systemName: "plus") }.accessibilityLabel("Add member") } } }
        .confirmationDialog("Remove \(removeTarget?.first ?? "this person") from the plan?", item: $removeTarget, titleVisibility: .visible) { p in
            Button("Remove from \(model.nextBillDate.cpDayMonth)", role: .destructive) { model.removePerson(p.id); model.showToast("\(p.first) is off the plan from \(model.nextBillDate.cpDayMonth).") }
        } message: { p in Text("\(p.first) keeps access until your next bill on \(model.nextBillDate.cpDayMonth).") }
        .confirmationDialog("Remove the family plan?", isPresented: $removePlan, titleVisibility: .visible) {
            Button("Remove family plan", role: .destructive) { for p in model.people where p.role != .admin { model.removePerson(p.id) } }
        } message: { Text("Everyone but you leaves the plan on \(model.nextBillDate.cpDayMonth).") }
    }
}

struct FamilyMemberView: View {
    @Environment(AppModel.self) private var model
    @Environment(AppRouter.self) private var router
    let personID: PersonID
    @State private var confirmPause = false
    @State private var confirmRemove = false

    var body: some View {
        if let p = model.people.first(where: { $0.id == personID }) {
            List {
                Section {
                    HStack(spacing: 14) {
                        Avatar(initials: String(p.first.prefix(1) + p.last.prefix(1)), category: nil, size: 64)
                        VStack(alignment: .leading) {
                            Text(p.name).font(.title3.bold())
                            Text("\(p.roleLabel) · \(model.homeClub.fullName)").font(.subheadline).foregroundStyle(Color.textMuted)
                        }
                    }.accessibilityElement(children: .combine)
                }
                if p.role == .teen {
                    Section {
                        toggle("Courts", p.courtsAllowed) { var q = p; q.courtsAllowed = $0; model.updatePerson(q) }
                        toggle("Lap lanes (from age 14)", p.lanesAllowed && p.age >= 14) { var q = p; q.lanesAllowed = $0; model.updatePerson(q) }.disabled(p.age < 14)
                        toggle("Tell me when \(p.first) checks in", p.checkInAlerts) { var q = p; q.checkInAlerts = $0; model.updatePerson(q) }
                    } header: { Text("Parent controls") } footer: {
                        Text("Personal training needs a parent's OK. Approvals arrive in your Inbox.")
                    }.disabled(!model.isOwner)
                    Section {
                        Label("Teen OK classes only: all Youth classes plus selected others, such as Teen Strength and Mind & Body.", systemImage: "checkmark.shield").font(.subheadline)
                    }
                    if model.isOwner, p.age == 17 { Section { Text("\(p.first) turns 18 soon. We'll move \(p.first) to the adult add-on, +$39/mo, with 30 days' notice.").font(.subheadline) } }
                    if !model.isOwner { Section { Text("Ask \(model.member.ownerFirst) to change this.").font(.subheadline).foregroundStyle(Color.textMuted) } }
                } else if p.role == .child {
                    Section {
                        Label("Kids club is included. You check in at the same club.", systemImage: "face.smiling")
                        TextField("Allergies and notes", text: Binding(get: { p.allergies }, set: { var q = p; q.allergies = $0; model.updatePerson(q) }))
                    }
                }
                Section {
                    NavigationLink(value: AppRoute.myBookings) { Label("View bookings", systemImage: "ticket") }
                    Button { router.present(.pass) } label: { Label(p.role == .teen ? "Show \(p.first)'s pass" : "Show pass for kids club", systemImage: "qrcode") }.buttonStyle(.plain)
                }
                if model.isOwner, p.role != .admin {
                    Section {
                        if p.role == .teen { Button(p.accessPaused ? "Resume \(p.first)'s access" : "Pause \(p.first)'s access") { confirmPause = true } }
                        Button("Remove from plan", role: .destructive) { confirmRemove = true }
                    }
                }
            }
            .listStyle(.insetGrouped).scrollContentBackground(.hidden).background(Color.appBackground)
            .navigationTitle(p.first).navigationBarTitleDisplayMode(.inline)
            .confirmationDialog("Pause \(p.first)'s access?", isPresented: $confirmPause, titleVisibility: .visible) {
                Button(p.accessPaused ? "Resume access" : "Pause access", role: .destructive) { var q = p; q.accessPaused.toggle(); model.updatePerson(q) }
            }
            .confirmationDialog("Remove \(p.first)?", isPresented: $confirmRemove, titleVisibility: .visible) {
                Button("Remove from \(model.nextBillDate.cpDayMonth)", role: .destructive) { model.removePerson(p.id); router.goBack() }
            } message: { Text("\(p.first) keeps access until your next bill on \(model.nextBillDate.cpDayMonth).") }
        } else {
            ContentUnavailableView("Person not found", systemImage: "person.crop.circle.badge.questionmark")
        }
    }
    private func toggle(_ title: String, _ on: Bool, set: @escaping (Bool) -> Void) -> some View {
        Toggle(title, isOn: Binding(get: { on }, set: set)).frame(minHeight: 44)
    }
}

// MARK: - Guest passes

struct GuestPassesView: View {
    @Environment(AppModel.self) private var model
    @Environment(AppRouter.self) private var router
    var body: some View {
        List {
            if model.member.plan.guestPassesPerMonth == 0 {
                Section { EmptyState(title: "Guest passes come with Ridge", message: "Ridge includes 1 guest pass a month.", symbol: "person.badge.plus", actionTitle: "See plans") { router.paths[.you] = [.membership, .plans] } }.listRowBackground(Color.clear)
            } else {
                Section {
                    LabeledContent("Passes left") { HStack(spacing: 8) { ProgressRibs2(left: model.guestPassesLeft, total: model.member.plan.guestPassesPerMonth); Text("\(model.guestPassesLeft) of \(model.member.plan.guestPassesPerMonth)").monospacedDigit() } }
                    LabeledContent("Resets", value: model.nextBillDate.cpDayMonth)
                } footer: { Text("Passes included with your plan reset on your billing date and do not roll over.") }
                Section {
                    if model.guestPassesLeft > 0 { Button { router.present(.guestShare) } label: { Label("Share a guest pass", systemImage: "square.and.arrow.up") } }
                    else { Button { } label: { Label("Buy a day pass for a friend, $20", systemImage: "ticket") } }
                }
                if !model.guestPasses.isEmpty {
                    Section("Shared passes") {
                        ForEach(model.guestPasses) { g in
                            HStack {
                                VStack(alignment: .leading) { Text(g.guest).font(.headline); Text("Expires \(g.expires.cpDayMonth)").font(.footnote).foregroundStyle(Color.textMuted) }
                                Spacer(); StatusPill(text: g.status.rawValue, symbol: g.status == .used ? "checkmark" : "paperplane", tone: g.status == .expired ? .neutral : .info)
                            }
                            .accessibilityElement(children: .combine)
                            .swipeActions { Button("Revoke", role: .destructive) { model.revokeGuestPass(g.id) } }
                            .contextMenu { Button("Revoke", role: .destructive) { model.revokeGuestPass(g.id) } }
                            .accessibilityAction(named: "Revoke") { model.revokeGuestPass(g.id) }
                        }
                    }
                }
                Section { Text("Valid 14 days from the day you send it. One visit, one club. Guests must be 18 or older, or 16 to 17 with a guardian waiver.").font(.footnote).foregroundStyle(Color.textMuted) }.listRowBackground(Color.clear)
            }
        }
        .listStyle(.insetGrouped).scrollContentBackground(.hidden).background(Color.appBackground)
        .navigationTitle("Guest passes").navigationBarTitleDisplayMode(.inline)
    }
}

struct ProgressRibs2: View {
    var left: Int; var total: Int
    var body: some View {
        HStack(spacing: 6) {
            ForEach(0..<max(total, 1), id: \.self) { i in
                RoundedRectangle(cornerRadius: 3).fill(i < left ? Color.brandSecondary : Color.clear)
                    .overlay(RoundedRectangle(cornerRadius: 3).strokeBorder(Color.borderStrong, lineWidth: 1.5)).frame(width: 10, height: 22)
            }
        }
        .accessibilityElement(children: .ignore).accessibilityLabel("\(left) of \(total) guest passes left")
    }
}

// MARK: - Inbox

struct InboxView: View {
    @Environment(AppModel.self) private var model
    @Environment(AppRouter.self) private var router
    @Environment(\.dynamicTypeSize) private var dts
    @State private var filter = "All"

    var body: some View {
        let list = model.inbox.filter { i in
            switch filter {
            case "Bookings": i.kind == .waitlist || i.kind == .reminder
            case "Club": i.kind == .club
            case "Billing": i.kind == .billing
            case "Family": i.kind == .family || i.kind == .approval
            default: true
            }
        }
        List {
            if !model.notificationsAuthorized {
                Section { Banner(tone: .warning, text: "Alerts are off. Turn on alerts so you do not miss a waitlist spot.", actionTitle: "Open Settings") {
                    if let u = URL(string: UIApplication.openSettingsURLString) { UIApplication.shared.open(u) } } }.listRowBackground(Color.clear)
            }
            let today = list.filter { AZ.cal.isDate($0.time, inSameDayAs: model.now) }
            let earlier = list.filter { !AZ.cal.isDate($0.time, inSameDayAs: model.now) }
            if !today.isEmpty { Section("Today") { ForEach(today) { row($0) } } }
            if !earlier.isEmpty { Section("Earlier") { ForEach(earlier) { row($0) } } }
        }
        .listStyle(.insetGrouped).scrollContentBackground(.hidden).background(Color.appBackground)
        .overlay { if list.isEmpty { EmptyState(title: "You're all caught up", message: "Waitlist spots and reminders show here.", symbol: "bell.slash").background(Color.appBackground) } }
        .navigationTitle("Inbox").navigationBarTitleDisplayMode(.inline)
        .toolbar {
            ToolbarItem(placement: .topBarTrailing) {
                Menu {
                    Picker("Filter", selection: $filter) { ForEach(["All", "Bookings", "Club", "Billing", "Family"], id: \.self) { Text($0).tag($0) } }
                    Button("Mark all read") { model.markAllRead() }
                } label: { Image(systemName: "line.3.horizontal.decrease.circle") }.accessibilityLabel("Filter and mark read")
            }
        }
    }

    private func symbol(_ k: InboxItem.Kind) -> (String, ClassCategory?) {
        switch k {
        case .waitlist: ("bell.badge", .strength)
        case .reminder: ("alarm", .cycle)
        case .club: ("sun.max", .aqua)
        case .billing: ("creditcard", nil)
        case .family: ("person.2", .youth)
        case .coach: ("figure.strengthtraining.traditional", .strength)
        case .approval: ("checkmark.seal", .youth)
        }
    }

    private func row(_ i: InboxItem) -> some View {
        let (sym, cat) = symbol(i.kind)
        return Button {
            model.markRead(i.id)
            if let r = i.route, let u = URL(string: "cactuspeak://" + r.trimmingCharacters(in: CharacterSet(charactersIn: "/"))) { router.open(u) }
        } label: {
            HStack(alignment: .top, spacing: 12) {
                ZStack { Circle().fill((cat?.color ?? Color.brandSecondary).opacity(0.16)); Image(systemName: sym).foregroundStyle(cat?.textColor ?? Color.textPrimary) }.frame(width: 40, height: 40).accessibilityHidden(true)
                VStack(alignment: .leading, spacing: 2) {
                    HStack(spacing: 6) {
                        if i.unread { Circle().fill(Color.brandAccent).frame(width: 8, height: 8).accessibilityHidden(true) }
                        Text(i.title).font(.headline)
                    }
                    Text(i.body).font(.subheadline).foregroundStyle(Color.textMuted).lineLimit(dts.isAccessibilitySize ? 3 : 2)
                    if i.kind == .waitlist, let h = model.activeHold, i.title.contains(h.title) {
                        BookingStateButton(state: .hold(h.holdExpires ?? model.now), action: { if model.confirmHold(h.id) { model.announceBooked(model.booking(h.id)) } }).padding(.top, 4)
                    }
                    Text(relative(i.time)).font(.caption).foregroundStyle(Color.textMuted)
                }
            }
            .frame(minHeight: 56).contentShape(Rectangle())
        }
        .buttonStyle(.plain)
        .swipeActions(edge: .trailing) { Button("Delete", role: .destructive) { model.deleteInbox(i.id) } }
        .swipeActions(edge: .leading) { Button(i.unread ? "Read" : "Unread") { model.markRead(i.id, i.unread) }.tint(Color.brandSecondary) }
        .accessibilityElement(children: .combine)
        .accessibilityLabel("\(i.unread ? "Unread. " : "")\(i.title). \(i.body). \(relative(i.time))")
    }

    private func relative(_ d: Date) -> String {
        let m = Int(model.now.timeIntervalSince(d) / 60)
        if m < 1 { return "Just now" }
        if m < 60 { return "\(m) min ago" }
        if m < 1440 { return d.cpTime }
        return d.cpFormat("EEE MMM d")
    }
}
