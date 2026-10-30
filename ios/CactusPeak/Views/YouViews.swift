import SwiftUI

struct YouView: View {
    @Environment(AppModel.self) private var model
    @Environment(AppRouter.self) private var router
    @Environment(\.dynamicTypeSize) private var dts

    var body: some View {
        List {
            Section {
                Button { router.present(.editProfile) } label: {
                    HStack(spacing: 14) {
                        Avatar(initials: String(model.member.first.prefix(1) + model.member.last.prefix(1)), category: nil, size: 56)
                        VStack(alignment: .leading, spacing: 2) {
                            Text(model.member.name).font(.headline)
                            Text(model.member.isTeen ? "Teen · \(model.homeClub.fullName)" : model.member.plan.name).font(.subheadline).foregroundStyle(Color.textMuted)
                            if !model.member.isTeen { Text("Since \(model.member.sinceText)").font(.footnote).foregroundStyle(Color.textMuted) }
                        }
                        Spacer(); Image(systemName: "chevron.right").font(.footnote.weight(.semibold)).foregroundStyle(Color.textMuted)
                    }.frame(minHeight: 64).contentShape(Rectangle())
                }.buttonStyle(.plain)
            }
            Section {
                CheckInPassCompact(name: model.member.name, number: model.member.memberNumber, clubName: model.club(model.passClubID).shortName) { router.present(.pass) }
            }
            if model.isTeen {
                Section { Label("Your plan is managed by \(model.member.ownerFirst).", systemImage: "person.2").font(.subheadline) }
            }
            Section("Activity") {
                NavigationLink(value: AppRoute.myBookings) { row("Bookings", "ticket", model.upcomingBookings.isEmpty ? nil : "\(model.upcomingBookings.count) upcoming") }
                NavigationLink(value: AppRoute.progress) { row("Progress", "chart.bar", "\(model.streak.weeks)-week streak") }
            }
            if !model.isTeen {
                Section("Membership") {
                    NavigationLink(value: AppRoute.membership) { row("Membership", "creditcard", model.member.plan.name) }
                    NavigationLink(value: AppRoute.family) { row("Family", "person.2", "\(model.people.count) \(model.people.count == 1 ? "person" : "people")") }
                    NavigationLink(value: AppRoute.guestPasses) { row("Guest passes", "person.badge.plus", "\(model.guestPassesLeft) left") }
                }
            }
            Section("Support") {
                NavigationLink(value: AppRoute.notifications) { row("Inbox", model.unreadCount > 0 ? "bell.badge" : "bell", model.unreadCount > 0 ? "\(model.unreadCount) unread" : nil) }
                Link(destination: URL(string: "tel:4805550100")!) { row("Member services", "questionmark.circle", "(480) 555-0100") }
                Button { router.present(.feedback(model.pastBookings.first?.id ?? "")) } label: { row("Give feedback", "text.bubble", nil) }.buttonStyle(.plain)
            }
            Section { Text("Cactus Peak Athletic 1.0 (1)").font(.footnote).foregroundStyle(Color.textMuted).frame(maxWidth: .infinity) }.listRowBackground(Color.clear)
        }
        .listStyle(.insetGrouped).scrollContentBackground(.hidden).background(Color.appBackground)
        .navigationTitle("You")
        .toolbar { ToolbarItem(placement: .topBarTrailing) { Button { router.push(.settings) } label: { Image(systemName: "gearshape") }.accessibilityLabel("Settings") } }
    }

    private func row(_ title: String, _ symbol: String, _ value: String?) -> some View {
        let layout = dts.isAccessibilitySize ? AnyLayout(VStackLayout(alignment: .leading, spacing: 2)) : AnyLayout(HStackLayout())
        return layout {
            Label(title, systemImage: symbol)
            if !dts.isAccessibilitySize { Spacer() }
            if let value { Text(value).foregroundStyle(Color.textMuted).font(.subheadline) }
        }
        .frame(minHeight: 44)
        .accessibilityElement(children: .combine)
    }
}

// MARK: - Membership

struct MembershipView: View {
    @Environment(AppModel.self) private var model
    @Environment(AppRouter.self) private var router
    @State private var unlocked = false
    @State private var walletAlert = false

    var body: some View {
        Group {
            if unlocked || !model.isOwner { content } else {
                ContentUnavailableView {
                    Label("Membership is locked", systemImage: "faceid")
                } description: { Text("Confirm it is you to see billing details.") } actions: {
                    Button("Unlock") { Task { unlocked = await BiometricGate.authenticate(reason: "Show billing details") } }.primaryAction()
                }
            }
        }
        .navigationTitle("Membership").navigationBarTitleDisplayMode(.inline)
        .task { if !unlocked { unlocked = await BiometricGate.authenticate(reason: "Show billing details") } }
    }

    private var content: some View {
        List {
            Section("Plan") {
                LabeledContent("Plan", value: "\(model.member.plan.name) · $\(model.member.plan.price)/mo")
                if model.isFrozen, let f = model.freeze { LabeledContent("Status", value: "Frozen until \(f.end.cpDayMonth)") }
                LabeledContent("Next bill", value: "\(model.nextBillDate.cpDayMonth) · $\(model.nextBillTotal).00")
                NavigationLink(value: AppRoute.plans) { Text("Change plan") }
            }
            Section("Included") {
                ForEach(model.member.plan.perks, id: \.self) { Label($0, systemImage: "checkmark").symbolRenderingMode(.monochrome) }
            }
            if let d = model.membershipCancelOn {
                Section { Banner(tone: .info, text: "Cancelling \(d.cpDayMonth). You keep full access until then.", actionTitle: "Reinstate") { model.reinstate() } }.listRowBackground(Color.clear)
            }
            if let (p, d) = model.pendingDowngrade {
                Section { Banner(tone: .info, text: "Moving to \(p.name) on \(d.cpDayMonth).", actionTitle: nil, action: nil) }.listRowBackground(Color.clear)
            }
            if model.paymentFailedDay > 0 {
                Section { Banner(tone: model.paymentFailedDay >= 8 ? .danger : .warning,
                                 text: model.paymentFailedDay >= 8 ? "New bookings are paused until you pay. Your pass still works. From day 15 the pass shows \"See the front desk\"." : "We could not charge your card. Retrying on day 3 and day 6. You have full access to day 7.",
                                 actionTitle: "Update payment") { model.paymentFailedDay = 0; model.showToast("Payment updated.") } }.listRowBackground(Color.clear)
            }
            Section {
                ForEach(model.billLines) { l in LabeledContent(l.label, value: "$\(l.amount).00").monospacedDigit() }
            } header: { Text("Billing") }
            footer: { Text("$49 annual facility fee is charged in March. Your billing day is the \(model.member.billingDay)th.") }
            Section("Manage") {
                LabeledContent("Payment method", value: "Visa •• 4242")
                NavigationLink(value: AppRoute.billingHistory) { Text("Billing history") }
                if model.isFrozen { Button("Resume early") { model.resumeEarly() } }
                NavigationLink(value: AppRoute.freeze) { Text(model.freeze == nil ? "Freeze membership" : "Freeze details") }
                NavigationLink(value: AppRoute.family) { Text("Family") }
                LabeledContent("Personal training", value: model.ptSessionsLeft > 0 ? "\(model.ptSessionsLeft) left · until \(model.ptExpires.cpDayMonth)" : "No packs")
            }
            Section {
                if model.walletAdded { Label("In Apple Wallet", systemImage: "checkmark.circle.fill") }
                else { WalletButton { walletAlert = true }.frame(height: 48) }
            }.listRowBackground(Color.clear)
            Section {
                NavigationLink(value: AppRoute.cancelMembership) { Text("Cancel membership").foregroundStyle(Color.statusDanger) }
            }
        }
        .listStyle(.insetGrouped).scrollContentBackground(.hidden).background(Color.appBackground)
        .alert("Wallet pass not available in this build", isPresented: $walletAlert) { Button("OK", role: .cancel) {} }
            message: { Text("A Wallet pass needs a signing certificate and a pass type ID.") }
    }
}

struct BillingHistoryView: View {
    @Environment(AppModel.self) private var model
    var body: some View {
        List {
            Section("Upcoming") { LabeledContent(model.nextBillDate.cpDayMonth) { StatusPill(text: "Upcoming · $\(model.nextBillTotal).00", symbol: "clock", tone: .neutral) } }
            Section("Paid") {
                ForEach(model.billingHistory, id: \.0) { r in
                    LabeledContent(r.0) { HStack { StatusPill(text: "Paid · $\(r.1).00", symbol: "checkmark", tone: .success); Image(systemName: "arrow.down.circle").foregroundStyle(Color.textMuted).accessibilityLabel("Download receipt") } }
                }
            }
        }
        .listStyle(.insetGrouped).scrollContentBackground(.hidden).background(Color.appBackground)
        .navigationTitle("Billing history").navigationBarTitleDisplayMode(.inline)
    }
}

// MARK: - Plans

struct PlansView: View {
    @Environment(AppModel.self) private var model
    @Environment(AppRouter.self) private var router
    var body: some View {
        ScrollView {
            VStack(spacing: 16) {
                ForEach(PlanTier.allCases) { p in
                    if p == model.member.plan {
                        PlanCard(plan: p, variant: .current)
                    } else {
                        let delta = p.price - model.member.plan.price
                        PlanCard(plan: p, variant: .change(delta: delta, upgrade: delta > 0), highlighted: p == .ridge) { router.present(.planConfirm(p)) }
                    }
                }
                Button { router.present(.comparePlans) } label: { Label("Compare plans", systemImage: "tablecells") }.secondaryAction(full: true)
                Text("Family add-on +$39 per adult, +$19 per child (6 months to 17). Day pass $20.").font(.footnote).foregroundStyle(Color.textMuted)
                if model.member.plan == .trailhead {
                    Text(model.homeClubChangedThisCycle ? "Home club changed this cycle. Next change after \(model.nextBillDate.cpDayMonth)." : "Trailhead members can change home club once per billing cycle.")
                        .font(.footnote).foregroundStyle(Color.textMuted)
                }
            }.padding(16)
        }
        .screenBackground().navigationTitle("Plans").navigationBarTitleDisplayMode(.inline)
    }
}

// MARK: - Freeze

struct FreezeView: View {
    @Environment(AppModel.self) private var model
    @Environment(AppRouter.self) private var router
    @State private var months = 2
    @State private var confirm = false
    @Environment(\.dynamicTypeSize) private var dts
    var body: some View {
        if let f = model.freeze { frozen(f) } else { form }
    }

    private var form: some View {
        let q = model.freezeQuote(months: months)
        let block = model.freezeBlockReason()
        return Form {
            Section {
                Text("Freeze for 1 to 3 months. $10/mo for the account while frozen. It covers everyone on your plan.").font(.body)
            }
            if let block {
                Section { EmptyState(title: "Freeze isn't available", message: block, symbol: "pause.slash") }
            } else {
                Section {
                    if dts.isAccessibilitySize {
                        Picker("Length", selection: $months) { ForEach(1...3, id: \.self) { Text("\($0) month\($0 == 1 ? "" : "s")").tag($0) } }.pickerStyle(.menu)
                    } else {
                        Picker("Length", selection: $months) { ForEach(1...3, id: \.self) { Text("\($0) month\($0 == 1 ? "" : "s")").tag($0) } }.pickerStyle(.segmented)
                    }
                }
                Section {
                    LabeledContent("Starts", value: q.start.cpDayMonth)
                    LabeledContent("Ends", value: q.end.cpDayMonth)
                    LabeledContent("Billing restarts", value: q.restart.cpDayMonth)
                    LabeledContent("Cost", value: "$10/mo · $\(q.total) total")
                } header: { Text("Dates") } footer: { Text("The freeze starts on your first billing date at least 30 days from today.") }
                Section {
                    if q.affected.isEmpty { Label("No bookings fall inside the freeze.", systemImage: "checkmark") }
                    else {
                        Label("\(q.affected.count) booking\(q.affected.count == 1 ? "" : "s") will be cancelled. No strikes.", systemImage: "exclamationmark.triangle.fill").foregroundStyle(Color.statusWarning)
                        ForEach(q.affected.prefix(3)) { Text("\($0.title) · \($0.start.cpFormat("EEE MMM d"))").font(.footnote).foregroundStyle(Color.textMuted) }
                        if q.affected.count > 3 { Text("and \(q.affected.count - 3) more").font(.footnote).foregroundStyle(Color.textMuted) }
                    }
                    Label("Personal training packs pause", systemImage: "pause.circle")
                    Label("You cannot check in", systemImage: "qrcode")
                } footer: { Text("Next renewal \(model.nextBillDate.cpDayMonth) · $\(model.nextBillTotal).00") }
                if dts.isAccessibilitySize {
                    Section { Button("Freeze membership") { confirm = true }.primaryAction(full: true) }.listRowBackground(Color.clear)
                }
            }
        }
        .scrollContentBackground(.hidden).background(Color.appBackground)
        .navigationTitle("Freeze").navigationBarTitleDisplayMode(.inline)
        .safeAreaBar(edge: .bottom) {
            if !dts.isAccessibilitySize && block == nil {
                Button { confirm = true } label: { Text("Freeze membership").foregroundStyle(Color.brandOnAccent).frame(maxWidth: .infinity) }
                    .buttonStyle(.glassProminent).tint(Color.brandAccent).controlSize(.large).padding(.horizontal, 16).padding(.vertical, 6)
            }
        }
        .confirmationDialog("Freeze from \(q.start.cpDayMonth)?", isPresented: $confirm, titleVisibility: .visible) {
            Button("Freeze membership") { model.setFreeze(months: months) }
            Button("Not now", role: .cancel) {}
        } message: { Text("Billing pauses until \(q.restart.cpDayMonth). You can't check in or book while frozen.") }
    }

    private func frozen(_ f: FreezeState) -> some View {
        SuccessPattern(headline: "Freeze set", pill: "Confirmed", primaryTitle: nil, primaryAction: {}, shareText: nil,
                       summary: {
            VStack(alignment: .leading, spacing: 6) {
                Text("Freeze \(f.start.cpDayMonth) – \(f.end.cpDayMonth)").font(.headline)
                Text("\(f.months) month\(f.months == 1 ? "" : "s") · $\(10 * f.months) total. Billing restarts \(f.end.addingDays(1).cpDayMonth).").font(.subheadline).foregroundStyle(Color.textMuted)
            }.frame(maxWidth: .infinity, alignment: .leading).cardStyle()
        }, extra: {
            VStack(spacing: 12) {
                StatusPill(text: "Frozen until \(f.end.cpDayMonth)", symbol: "pause.fill", tone: .neutral)
                if model.isFrozen { Button("Resume early") { model.resumeEarly() }.secondaryAction(full: true); Text("Resuming early bills your plan price for the rest of this cycle.").font(.footnote).foregroundStyle(Color.textMuted) }
                else { Button("Cancel the freeze") { model.freeze = nil }.linkAction(danger: true) }
            }
        })
        .navigationTitle("Freeze").navigationBarTitleDisplayMode(.inline)
    }
}

struct CancelMembershipView: View {
    @Environment(AppModel.self) private var model
    @Environment(AppRouter.self) private var router
    @State private var confirm: Bool? = nil
    var body: some View {
        let date = model.firstBillingDate(onOrAfter: model.thirtyDaysOut)
        ScrollView {
            VStack(alignment: .leading, spacing: 16) {
                Text("Cancel your membership?").font(.archivoExtraBold(28, relativeTo: .title)).accessibilityAddTraits(.isHeader)
                Text("You keep full access until \(date.cpDayMonth), the first billing date at least 30 days from today. You can reinstate with one tap until then.").font(.body)
                VStack(alignment: .leading, spacing: 8) {
                    Label("Your pass stops working on \(date.cpDayMonth).", systemImage: "xmark.circle.fill")
                    Label("Bookings after that date are cancelled.", systemImage: "xmark.circle.fill")
                    Label("Personal training packs stay for 12 months.", systemImage: "checkmark.circle")
                }.font(.subheadline).foregroundStyle(Color.textPrimary)
                Button("Keep my membership") { router.goBack() }.primaryAction(full: true)
                Button("Cancel membership") { confirm = true }.secondaryAction(full: true, destructive: true)
            }.padding(16)
        }
        .screenBackground().navigationTitle("Cancel").navigationBarTitleDisplayMode(.inline)
        .confirmationDialog("Cancel membership on \(date.cpDayMonth)?", item: $confirm, titleVisibility: .visible) { _ in
            Button("Cancel membership", role: .destructive) { model.cancelMembership(); router.goBack(); model.showToast("Cancelling \(date.cpDayMonth). Reinstate any time before.") }
            Button("Keep it", role: .cancel) {}
        }
    }
}
