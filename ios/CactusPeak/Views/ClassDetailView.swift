import SwiftUI

struct ClassDetailView: View {
    @Environment(AppModel.self) private var model
    @Environment(AppRouter.self) private var router
    @Environment(\.dynamicTypeSize) private var dts
    let sessionID: SessionID

    var body: some View {
        if let s = model.session(sessionID) {
            content(s)
        } else {
            ContentUnavailableView("Class not found", systemImage: "calendar.badge.exclamationmark", description: Text("It may have been removed. Go back to the schedule."))
        }
    }

    private func content(_ s: ClassSession) -> some View {
        let coach = model.coach(s.coachID)
        let club = model.club(s.clubID)
        let st = model.state(for: s)
        let left = model.spotsLeft(s)
        let rules = model.rulesText(for: s)
        return ScrollView {
            VStack(alignment: .leading, spacing: 20) {
                hero(s, coach, club)
                VStack(alignment: .leading, spacing: 20) {
                    stateLine(s, st)
                    titleBlock(s, club)
                    NavigationLink(value: AppRoute.coach(coach.id)) {
                        HStack { InstructorChip(coach: coach, large: true, showCredential: true); Spacer(); Image(systemName: "chevron.right").foregroundStyle(Color.textMuted) }
                            .contentShape(Rectangle())
                    }.buttonStyle(.plain)
                    stats(s, left)
                    Divider()
                    about(s)
                    secondaryActions(s)
                    DisclosureGroup("Cancellation and waitlist") {
                        VStack(alignment: .leading, spacing: 8) {
                            Text(rules.cancel); Text(rules.waitlist)
                            if let x = rules.strikes { Label(x, systemImage: "exclamationmark.triangle.fill").foregroundStyle(Color.statusWarning) }
                            if case .restricted(let rr) = st { Label("\(rr.label). \(rr.note)", systemImage: "lock.fill").fontWeight(.semibold) }
                        }.font(.subheadline).padding(.top, 6)
                    }
                    .font(.headline)
                    alsoThisWeek(s)
                }
                .padding(.horizontal, 16)
            }
            .padding(.bottom, 24)
            if dts.isAccessibilitySize { bottomBar(s, st, left).padding(.horizontal, 16) }
        }
        .screenBackground()
        .scrollEdgeEffectStyle(.soft, for: .top)
        .navigationBarTitleDisplayMode(.inline)
        .toolbarVisibility(.hidden, for: .tabBar)
        .toolbar {
            ToolbarItem(placement: .topBarTrailing) {
                ShareLink(item: URL(string: "https://app.cactuspeak.example/book/class/\(s.id)")!, subject: Text(s.name),
                          message: Text("\(s.name), \(s.start.cpLongDay) \(s.start.cpTime), \(club.fullName)")) { Image(systemName: "square.and.arrow.up") }
            }
            ToolbarSpacer(.fixed, placement: .topBarTrailing)
            ToolbarItem(placement: .topBarTrailing) {
                Button { model.toggleFavourite(session: s.id) } label: { Image(systemName: model.favouriteSessions.contains(s.id) ? "heart.fill" : "heart") }
                    .accessibilityLabel(model.favouriteSessions.contains(s.id) ? "Remove favourite" : "Favourite")
                    .sensoryFeedback(.selection, trigger: model.favouriteSessions)
            }
        }
        .safeAreaBar(edge: .bottom) { if !dts.isAccessibilitySize { bottomBar(s, st, left).padding(.horizontal, 16).padding(.vertical, 6) } }
    }

    // MARK: Hero: the class graphic for the category (same art as the web app and the marketing site)
    private func hero(_ s: ClassSession, _ coach: Coach, _ club: Club) -> some View {
        ClassGraphic(category: s.category)
            .frame(height: dts.isAccessibilitySize ? 160 : 240)
            .backgroundExtensionEffect()
    }

    @ViewBuilder private func stateLine(_ s: ClassSession, _ st: BookingState) -> some View {
        switch st {
        case .waitlisted(let n): Label("You're #\(n) on the waitlist. We'll tell you if a spot opens.", systemImage: "clock").font(.subheadline.weight(.semibold))
        case .hold(let until):
            TimelineView(.periodic(from: .now, by: 1)) { _ in
                let secs = max(0, Int(until.timeIntervalSince(model.now)))
                Label("A spot opened. Confirm in \(String(format: "%d:%02d", secs / 60, secs % 60)).", systemImage: "bell.badge.fill").font(.subheadline.weight(.semibold)).foregroundStyle(Color.statusWarning)
            }
        case .started: Label(model.now > s.end ? "This class has ended." : "This class has started.", systemImage: "info.circle").font(.subheadline)
        case .dropIn(let n): Label("Drop-in · \(n) spot\(n == 1 ? "" : "s") left. Waitlist is closed.", systemImage: "info.circle").font(.subheadline)
        default: EmptyView()
        }
    }

    private func titleBlock(_ s: ClassSession, _ club: Club) -> some View {
        VStack(alignment: .leading, spacing: 6) {
            HStack(spacing: 8) {
                CategoryBadge(category: s.category)
                if s.minAge >= 18 { Text("Ages 18+").font(.caption.weight(.semibold)) }
                else if s.teenOK { Text("Teen OK").font(.caption.weight(.semibold)) }
                if s.firstTimers { Label("First-timers welcome", systemImage: "leaf.fill").font(.caption.weight(.semibold)).foregroundStyle(Color.statusSuccess) }
            }
            Text(s.name).font(.archivoExtraBold(28, relativeTo: .title)).fixedSize(horizontal: false, vertical: true).accessibilityAddTraits(.isHeader)
            Text("\(s.start.cpFormat("EEE, MMM d")) · \(s.start.cpTime)–\(s.end.cpTime)").font(.archivoSemiBold(17, relativeTo: .headline)).monospacedDigit()
            NavigationLink(value: AppRoute.club(club.id)) {
                HStack(spacing: 4) { Text("\(s.room) · \(club.fullName)"); Image(systemName: "chevron.right").imageScale(.small) }
                    .font(.subheadline).foregroundStyle(Color.linkText).frame(minHeight: 44, alignment: .leading)
            }
        }
    }

    private func stats(_ s: ClassSession, _ left: Int) -> some View {
        let layout = dts.isAccessibilitySize ? AnyLayout(VStackLayout(alignment: .leading, spacing: 14)) : AnyLayout(HStackLayout(alignment: .top, spacing: 24))
        return layout {
            VStack(alignment: .leading, spacing: 6) {
                FactLabel(label: "Intensity")
                HStack(spacing: 6) { RibMeter(value: s.intensity, tone: .category(s.category), size: .md, peak: false); Text(Intensity.word(s.intensity)).font(.subheadline.weight(.semibold)) }
            }
            VStack(alignment: .leading, spacing: 4) {
                FactLabel(label: "Spots")
                if left == 0 { Text("Full").font(.archivoBold(22, relativeTo: .title2)).foregroundStyle(Color.textMuted) }
                else { CapacityIndicator(left: left, capacity: s.capacity, noun: s.spotNoun, large: true) }
            }
        }
        .accessibilityElement(children: .ignore)
        .accessibilityLabel("Intensity \(s.intensity) of 5, \(Intensity.word(s.intensity)). Spots: \(left) \(s.spotNoun) left of \(s.capacity).")
    }

    private func secondaryActions(_ s: ClassSession) -> some View {
        let layout = dts.isAccessibilitySize ? AnyLayout(VStackLayout(spacing: 10)) : AnyLayout(HStackLayout(spacing: 10))
        return layout {
            if let b = model.booking(forSession: s.id), b.status == .booked {
                Button { router.present(.calendar(b.id)) } label: { Label("Add to calendar", systemImage: "calendar.badge.plus").lineLimit(1) }.secondaryAction(full: true)
            }
            if model.guestPassesLeft > 0 {
                Button { router.present(.invite(s.id)) } label: { Label("Invite a friend", systemImage: "person.badge.plus").lineLimit(1) }.secondaryAction(full: true)
            }
        }
    }

    private func about(_ s: ClassSession) -> some View {
        VStack(alignment: .leading, spacing: 10) {
            Text("About").sectionHeader()
            Text(s.summary).font(.body)
            if !s.bring.isEmpty {
                Text("Bring: " + s.bring.joined(separator: ", ")).font(.subheadline).foregroundStyle(Color.textMuted)
            }
        }
    }

    @ViewBuilder private func alsoThisWeek(_ s: ClassSession) -> some View {
        let more = model.sessions.filter { $0.name == s.name && $0.clubID == s.clubID && $0.id != s.id && $0.start > model.now && $0.start < model.now.addingDays(8) && model.visible($0) }.prefix(3)
        if !more.isEmpty {
            VStack(alignment: .leading, spacing: 0) {
                Text("Also this week").sectionHeader().padding(.bottom, 4)
                ForEach(Array(more)) { m in
                    NavigationLink(value: AppRoute.classSession(m.id)) {
                        HStack {
                            Text("\(m.start.cpFormat("EEE")) \(m.start.cpTime)").font(.subheadline.weight(.semibold)).monospacedDigit()
                            Spacer()
                            Text(model.spotsLeft(m) == 0 ? "Full" : "\(model.spotsLeft(m)) \(m.spotNoun) left").font(.subheadline).foregroundStyle(Color.textMuted)
                            Image(systemName: "chevron.right").font(.footnote).foregroundStyle(Color.textMuted)
                        }.frame(minHeight: 44).contentShape(Rectangle())
                    }.buttonStyle(.plain)
                    Divider()
                }
            }
        }
    }

    // MARK: Action bar (safeAreaBar): plan line, free-cancel line, one button
    private func bottomBar(_ s: ClassSession, _ st: BookingState, _ left: Int) -> some View {
        let b = model.booking(forSession: s.id)
        let layout = dts.isAccessibilitySize ? AnyLayout(VStackLayout(alignment: .leading, spacing: 10)) : AnyLayout(HStackLayout(spacing: 12))
        return layout {
            VStack(alignment: .leading, spacing: 2) {
                Text(model.member.plan == .trailhead && s.clubID != model.member.homeClubID ? "Ridge only" : "Included with \(model.member.plan.name)").font(.subheadline.weight(.semibold))
                Text(cancelLine(s, st)).font(.footnote).foregroundStyle(Color.textMuted)
            }
            if !dts.isAccessibilitySize { Spacer(minLength: 0) }
            switch st {
            case .booked:
                HStack(spacing: 8) {
                    Button {} label: { Label("Booked", systemImage: "checkmark").foregroundStyle(Color.statusSuccess).lineLimit(1).fixedSize() }
                        .buttonStyle(.glass).controlSize(.large).disabled(true)
                    Menu {
                        if let b { Button { router.present(.calendar(b.id)) } label: { Label("Add to calendar", systemImage: "calendar.badge.plus") } }
                        Button("Cancel booking", role: .destructive) { if let b { router.requestCancel(b.id) } }
                    } label: { Label("Manage booking", systemImage: "ellipsis").labelStyle(.iconOnly) }
                        .buttonStyle(.glass).controlSize(.large)
                }
            case .started where model.now > s.end:
                if let b, b.status == .attended { Button("Give feedback") { router.present(.feedback(b.id)) }.primaryAction() }
                else { BookingStateButton(state: st, size: .large, action: {}) }
            default:
                BookingStateButton(state: st, size: .large, action: { ClassActions.primary(s, model: model, router: router) },
                                   onLeave: { if let b { model.leaveWaitlist(b.id) } }, onRelease: { if let b { model.releaseHold(b.id) } })
                    .frame(maxWidth: dts.isAccessibilitySize ? .infinity : 220)
            }
        }
    }

    private func cancelLine(_ s: ClassSession, _ st: BookingState) -> String {
        let left = model.spotsLeft(s)
        let free = "Free cancel until \(s.start.addingTimeInterval(-7200).cpTime)"
        if left == 0, case .booked = st {} else if left == 0 { return "Full · Waitlist \(model.waitlistCount(s))" }
        return free
    }
}
