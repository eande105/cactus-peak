import SwiftUI

/// DEBUG-only launch arguments so screens can be reached without taps (see BUILD-NOTES.md).
///   -screen <name>        open a screen. Names are listed in `DebugLaunch.open`.
///   -persona <name>       sign in as a demo account: maya, chris, alicia, jordan, daniel, ron, linda (needs DEMO_PASSWORD)
///   -state <name>         paymentFailed, paymentPaused, seeDesk, paused, strikes2, frozen, hold, offline, stale, checkedIn, empty
///   -clock <HH:mm>        set the virtual time today (default 05:40)
///   -frozenClock          stop the virtual clock
///   -signedOut            sign out first
enum DebugLaunch {
    @MainActor static func apply() {
        #if DEBUG
        let args = ProcessInfo.processInfo.arguments
        func value(_ key: String) -> String? { args.firstIndex(of: key).flatMap { $0 + 1 < args.count ? args[$0 + 1] : nil } }
        UserDefaults.standard.removeObject(forKey: "cp.savedAt")
        let m = AppModel.shared, r = AppRouter.shared
        if args.contains("-signedOut") { Task { await m.signOut() } }
        if let p = value("-persona"), let acc = DemoAccount(rawValue: p) {
            Task { @MainActor in
                do { try await m.signInDemo(acc); m.onboarded = true; r.viewingClubID = m.member.homeClubID }
                catch { m.showToast(BackendError(error).localizedDescription) }
            }
        }
        if args.contains("-frozenClock") { m.frozenClock = true }
        if let c = value("-clock") {
            let parts = c.split(separator: ":").compactMap { Int($0) }
            if parts.count == 2 {
                m.clockOffset = AZ.date(2026, 10, 27, parts[0], parts[1]).timeIntervalSince(AZ.date(2026, 10, 27, 5, 40))
                m.clockPinnedLocally = true // screenshots need this time, not the household's shared clock
            }
        }
        if let s = value("-state") { applyState(s, m) }
        if let s = value("-screen") {
            // Opening a sheet at launch needs the scene to exist. Delay slightly.
            Task { @MainActor in
                // Wait until the root view is on screen, so sheets and tab changes are not dropped on a slow launch.
                while !r.rootReady { try? await Task.sleep(for: .milliseconds(150)) }
                try? await Task.sleep(for: .milliseconds(500)); open(s, m, r)
            }
        }
        #endif
    }

    @MainActor static func applyState(_ s: String, _ m: AppModel) {
        switch s {
        case "paymentFailed": m.paymentFailedDay = 2
        case "paymentPaused": m.paymentFailedDay = 9
        case "seeDesk": m.paymentFailedDay = 16
        case "strikes2": m.strikes = [m.now.addingTimeInterval(-86400 * 3), m.now.addingTimeInterval(-86400 * 6)]
        case "paused": m.strikes = [m.now.addingTimeInterval(-86400 * 3), m.now.addingTimeInterval(-86400 * 6), m.now.addingTimeInterval(-3600)]; m.pauseUntil = m.now.addingTimeInterval(3 * 86400)
        case "frozen": let q = m.freezeQuote(months: 2); m.startFreezeNow(FreezeState(start: m.now.addingDays(-3), end: q.end, months: 2))
        case "hold": m.simulatePromotion()
        case "offline": m.offline = true
        case "stale": m.staleBusyness = true
        case "checkedIn": m.checkIn()
        case "empty": m.bookings.removeAll { $0.isActive }; m.visits = []; m.publishSnapshot()
        default: break
        }
    }

    @MainActor static func open(_ name: String, _ m: AppModel, _ r: AppRouter) {
        let vv = "gilbert-val-vista"
        func sid(_ k: String, _ d: String = "2026-10-29", _ t: String) -> String { "\(vv)~\(d)~\(t)~\(k)" }
        r.dismissSheet()
        func pres(_ sh: AppSheet) { Task { @MainActor in try? await Task.sleep(for: .milliseconds(700)); r.present(sh) } }
        switch name {
        case "today": r.selection = .today
        case "book": r.selection = .book; r.segment = .classes; r.day = AZ.date(2026, 10, 29)
        case "bookToday": r.selection = .book; r.segment = .classes; r.day = AZ.date(2026, 10, 27)
        case "filters": r.selection = .book; pres(.filters)
        case "classDetail": r.selection = .book; r.paths[.book] = [.classSession(sid("cc", "2026-10-29", "0600"))]
        case "classDetailFull": r.selection = .book; r.paths[.book] = [.classSession(sid("sbh", "2026-10-29", "1200"))]
        case "classDetailBooked": r.selection = .book; r.paths[.book] = [.classSession(sid("cc", "2026-10-27", "0600"))]
        case "waitlistSheet": r.selection = .book; r.paths[.book] = [.classSession(sid("sbh", "2026-10-29", "1200"))]; pres(.waitlist(sid("sbh", "2026-10-29", "1200")))
        case "confirmed":
            if let s = m.session(sid("cc", "2026-10-29", "0600")), case .ok(let b) = m.book(s) { r.selection = .book; r.paths[.book] = [.classSession(b.sessionID!)]; m.announceBooked(b) }
        case "bookings": r.selection = .today; r.paths[.today] = [.myBookings]
        case "cancelSheet": if let b = m.nextBooking { pres(.cancel(b.id)) }
        case "lateCancel": if let b = m.nextBooking { Task { @MainActor in try? await Task.sleep(for: .milliseconds(700)); r.requestCancel(b.id) } }
        case "freeCancel": if let b = m.upcomingBookings.first(where: { $0.start.timeIntervalSince(m.now) > 3 * 3600 }) { Task { @MainActor in try? await Task.sleep(for: .milliseconds(700)); r.requestCancel(b.id) } }
        case "courts": r.selection = .book; r.segment = .courts; r.day = AZ.date(2026, 10, 29); r.reserveClub[.court] = "mesa-red-mountain"
        case "lanes": r.selection = .book; r.segment = .lanes; r.day = AZ.date(2026, 10, 28); r.reserveClub[.lane] = "mesa-dobson"
        case "kids": r.selection = .book; r.segment = .kids; r.day = AZ.date(2026, 10, 31); r.reserveClub[.kidsClub] = vv
        case "reserveCourt":
            r.selection = .book; r.segment = .courts; r.day = AZ.date(2026, 10, 29); r.reserveClub[.court] = "mesa-red-mountain"
            pres(.reserve(ReserveRequest(kind: .court, clubID: "mesa-red-mountain", start: AZ.date(2026, 10, 29, 8, 0), sport: .pickleball, duration: 90)))
        case "reserveKids":
            r.selection = .book; r.segment = .kids; r.day = AZ.date(2026, 10, 31)
            pres(.reserve(ReserveRequest(kind: .kidsClub, clubID: "gilbert-val-vista", start: AZ.date(2026, 10, 31, 8, 0), sport: nil, duration: 120, block: 0)))
        case "clubs": r.selection = .clubs
        case "clubDetail": r.selection = .clubs; r.paths[.clubs] = [.club("gilbert-val-vista")]
        case "hours": r.selection = .clubs; r.paths[.clubs] = [.club("gilbert-val-vista")]; pres(.hours("gilbert-val-vista"))
        case "pass": pres(.pass)
        case "progress": r.selection = .you; r.paths[.you] = [.progress]
        case "coach": r.selection = .clubs; r.paths[.clubs] = [.coach("marisol")]
        case "you": r.selection = .you
        case "membership": r.selection = .you; r.paths[.you] = [.membership]
        case "plans": r.selection = .you; r.paths[.you] = [.membership, .plans]
        case "compare": r.selection = .you; r.paths[.you] = [.membership, .plans]; pres(.comparePlans)
        case "freeze": r.selection = .you; r.paths[.you] = [.membership, .freeze]
        case "family": r.selection = .you; r.paths[.you] = [.family]
        case "familyMember": r.selection = .you; r.paths[.you] = [.family, .familyMember(m.people.dropFirst().first?.id ?? "")]
        case "addFamily": r.selection = .you; r.paths[.you] = [.family]; pres(.addFamily)
        case "guest": r.selection = .you; r.paths[.you] = [.guestPasses]
        case "guestShare": r.selection = .you; r.paths[.you] = [.guestPasses]; pres(.guestShare)
        case "inbox": r.selection = .you; r.paths[.you] = [.notifications]
        case "settings": r.selection = .you; r.paths[.you] = [.settings]
        case "search": r.selection = .search
        case "switcher": pres(.clubSwitcher(.viewing))
        case "welcome": Task { await m.signOut() }
        case "onboarding1", "onboarding2", "onboarding3", "onboarding4", "onboarding5":
            m.onboarded = false; UserDefaults.standard.set(Int(name.suffix(1)) ?? 1, forKey: "cp.onboardStep")
        default: break
        }
    }
}
