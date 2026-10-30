import SwiftUI

struct MyBookingsView: View {
    @Environment(AppModel.self) private var model
    @Environment(AppRouter.self) private var router
    @State private var tab = 0
    @Environment(\.dynamicTypeSize) private var dts

    var body: some View {
        List {
            Section {
                if dts.isAccessibilitySize { Picker("Show", selection: $tab) { Text("Upcoming").tag(0); Text("Past").tag(1) }.pickerStyle(.menu) }
                else { Picker("Show", selection: $tab) { Text("Upcoming").tag(0); Text("Past").tag(1) }.pickerStyle(.segmented) }
            }
            .listRowBackground(Color.clear)

            if tab == 0 { upcoming } else { past }
        }
        .listStyle(.insetGrouped).scrollContentBackground(.hidden).background(Color.appBackground)
        .navigationTitle("Bookings").navigationBarTitleDisplayMode(.inline)
    }

    @ViewBuilder private var upcoming: some View {
        let list = model.upcomingBookings
        if model.strikesIn30 > 0 || model.activeWaitlists > 0 {
            Section {
                if model.strikesIn30 > 0 {
                    Banner(tone: .warning, text: "\(model.strikesIn30) late cancel\(model.strikesIn30 == 1 ? "" : "s") in the last 30 days. 3 late cancels pause new bookings for 3 days.", actionTitle: "How strikes work") { router.push(.strikes) }
                }
                if model.activeWaitlists > 0 { Text("Waitlists: \(model.activeWaitlists) of 5").font(.footnote).foregroundStyle(Color.textMuted) }
            }.listRowBackground(Color.clear).listRowSeparator(.hidden)
        }
        if list.isEmpty {
            Section {
                EmptyState(title: "No classes booked yet", message: "Pick a class and we'll save your spot.", symbol: "ticket", actionTitle: "Book a class") { router.selection = .book }
            }.listRowBackground(Color.clear)
        }
        let holds = list.filter { $0.status == .hold }
        let waits = list.filter { $0.status == .waitlisted }
        if !holds.isEmpty || !waits.isEmpty {
            Section("Waitlist") { ForEach(holds + waits) { row($0) } }
        }
        let byDay = Dictionary(grouping: list.filter { $0.status == .booked }, by: { $0.start.startOfAZDay })
        ForEach(byDay.keys.sorted(), id: \.self) { d in
            Section(AZ.cal.isDate(d, inSameDayAs: model.now) ? "Today" : d.cpFormat("EEEE, MMM d")) {
                ForEach(byDay[d] ?? []) { row($0) }
            }
        }
        Section {
            Button { router.push(.strikes) } label: { Label("How strikes work", systemImage: "info.circle") }
        } footer: { Text("A no-show counts as a late cancel.") }
    }

    @ViewBuilder private var past: some View {
        let list = model.pastBookings.prefix(40)
        if list.isEmpty {
            Section { EmptyState(title: "No past visits yet.", message: "Classes you attend show here.", symbol: "clock.arrow.circlepath") }.listRowBackground(Color.clear)
        }
        Section {
            ForEach(Array(list)) { b in
                BookingRow(booking: b, clubShort: model.club(b.clubID).shortName, statusText: nil)
                    .overlay(alignment: .topTrailing) { pastChip(b) }
                    .swipeActions(edge: .leading) {
                        if let sid = b.sessionID, model.session(sid) != nil { Button("Book again") { router.push(.classSession(sid)) }.tint(Color.brandSecondary) }
                    }
                    .contextMenu {
                        if b.status == .attended && b.feedback == nil { Button("Give feedback") { router.present(.feedback(b.id)) } }
                    }
                    .accessibilityAction(named: "Give feedback") { router.present(.feedback(b.id)) }
            }
        }
    }

    private func pastChip(_ b: Booking) -> some View {
        let (t, sym, tone): (String, String, StatusPill.Tone) = switch b.status {
        case .attended: ("Attended", "checkmark", .success)
        case .missed: ("Missed · late cancel", "exclamationmark.triangle.fill", .warning)
        case .lateCancelled: ("Late cancel", "exclamationmark.triangle.fill", .warning)
        default: ("Cancelled", "xmark", .neutral)
        }
        return StatusPill(text: t, symbol: sym, tone: tone).scaleEffect(0.88, anchor: .topTrailing)
    }

    @ViewBuilder private func row(_ b: Booking) -> some View {
        let label: String? = switch b.status {
        case .waitlisted: "On waitlist #\(b.waitlistPosition)"
        case .hold: "Spot held · confirm"
        default: b.kind == .kids ? b.detail : "Booked"
        }
        Button {
            if let s = b.sessionID { router.push(.classSession(s), on: router.selection) } else { router.push(.bookingDetail(b.id)) }
        } label: {
            HStack {
                BookingRow(booking: b, clubShort: model.club(b.clubID).shortName, statusText: label)
                if b.status == .hold { BookingStateButton(state: .hold(b.holdExpires ?? model.now), action: { if model.confirmHold(b.id) { model.announceBooked(model.booking(b.id)) } }) }
                else { Image(systemName: "chevron.right").font(.footnote.weight(.semibold)).foregroundStyle(Color.textMuted).accessibilityHidden(true) }
            }
            .contentShape(Rectangle())
        }
        .buttonStyle(.plain)
        .swipeActions(edge: .trailing) {
            if b.status == .waitlisted { Button("Leave") { model.leaveWaitlist(b.id) }.tint(.red) }
            else { Button("Cancel") { router.requestCancel(b.id) }.tint(.red) }
        }
        .swipeActions(edge: .leading) {
            if b.kind == .classSession && b.status == .booked { Button("Calendar") { router.present(.calendar(b.id)) }.tint(Color.brandSecondary) }
        }
        .contextMenu {
            if b.status == .booked {
                Button { router.present(.calendar(b.id)) } label: { Label("Add to calendar", systemImage: "calendar.badge.plus") }
                Button(role: .destructive) { router.requestCancel(b.id) } label: { Label("Cancel booking", systemImage: "xmark") }
            }
        }
        .accessibilityAction(named: "Cancel booking") { router.requestCancel(b.id) }
        .accessibilityAction(named: "Add to calendar") { router.present(.calendar(b.id)) }
    }
}

struct StrikesView: View {
    @Environment(AppModel.self) private var model
    var body: some View {
        List {
            Section("Your strikes") {
                if model.strikes.filter({ $0 > model.now.addingTimeInterval(-30 * 86400) }).isEmpty { Text("None in the last 30 days.") }
                ForEach(model.strikes.filter { $0 > model.now.addingTimeInterval(-30 * 86400) }, id: \.self) { d in
                    LabeledContent("Late cancel", value: d.cpDayMonth)
                }
                if let p = model.pauseUntil, p > model.now {
                    Label("New bookings are paused until \(p.cpWeekdayShort) \(p.cpDayMonth).", systemImage: "pause.circle.fill").foregroundStyle(Color.statusWarning)
                }
            }
            Section("The rules") {
                Text("Cancel free up to 2 hours before a class, court or lane. Later is a late cancel and counts as a strike.")
                Text("A no-show counts as a late cancel.")
                Text("3 strikes in 30 days pause new class, court and lane bookings for 3 days.")
                Text("A pause does not block kids club, personal training, check-in or cancelling.")
                Text("Kids club has no strikes.")
            }
        }
        .listStyle(.insetGrouped).scrollContentBackground(.hidden).background(Color.appBackground)
        .navigationTitle("Strikes").navigationBarTitleDisplayMode(.inline)
    }
}
