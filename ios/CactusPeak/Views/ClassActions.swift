import SwiftUI

/// One place that decides what a tap on a booking button does, so rows, the detail bar and Today agree.
@MainActor
enum ClassActions {
    static func primary(_ s: ClassSession, model: AppModel, router: AppRouter) {
        switch model.state(for: s) {
        case .book, .dropIn:
            switch model.book(s) {
            case .ok(let b): model.announceBooked(model.booking(b.id))
            case .clash(let c): router.clash = ClashPrompt(id: s.id, existing: c.title, existingTime: c.start.cpTime)
            case .rejected(let m): model.showToast(m)
            }
        case .waitlist: router.present(.waitlist(s.id))
        case .hold:
            if let b = model.booking(forSession: s.id), model.confirmHold(b.id) { model.announceBooked(model.booking(b.id)) }
        case .restricted(let r):
            switch r {
            case .plan: router.selection = .you; router.paths[.you] = [.membership, .plans]
            case .pastDue: router.selection = .you; router.paths[.you] = [.membership]
            case .frozen: router.selection = .you; router.paths[.you] = [.membership]
            case .paused: router.push(.strikes)
            default: break
            }
        case .booked: router.push(.classSession(s.id))
        case .error: break
        default: break
        }
    }
}
