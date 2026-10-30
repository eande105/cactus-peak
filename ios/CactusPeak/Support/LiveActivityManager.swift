import Foundation
import ActivityKit

/// One Live Activity at a time, from 60 minutes before a booked class to 15 minutes after it ends.
/// Started locally while the app is running. Push-to-start needs a server and is not built.
private struct ActivityBox: @unchecked Sendable { let activity: Activity<ClassActivityAttributes> }

@MainActor
final class LiveActivityManager {
    static let shared = LiveActivityManager()
    private var current: Activity<ClassActivityAttributes>?
    private var currentSession: String?

    func sync(model: AppModel) {
        guard model.prefs.liveActivities, ActivityAuthorizationInfo().areActivitiesEnabled else { end(); return }
        let now = model.now
        let target = model.bookings
            .filter { $0.kind == .classSession && $0.status == .booked && $0.start.timeIntervalSince(now) <= 3600 && $0.end.addingTimeInterval(15 * 60) > now }
            .sorted { $0.start < $1.start }.first
        guard let b = target, let sid = b.sessionID, let s = model.session(sid) else { end(); return }
        let phase: ClassActivityAttributes.ContentState.Phase =
            now >= b.end ? .ended : now >= b.start ? .inProgress : (b.start.timeIntervalSince(now) <= 15 * 60 ? .checkInDue : .upcoming)
        // The app runs on a virtual clock (sample day Oct 27). Map it onto the real clock so the Lock Screen timer counts down.
        let shift = Date().timeIntervalSince(now)
        let state = ClassActivityAttributes.ContentState(phase: phase, startsAt: b.start.addingTimeInterval(shift), endsAt: b.end.addingTimeInterval(shift),
                                                         startLabel: b.start.cpTime, endLabel: b.end.cpTime)
        let content = ActivityContent(state: state, staleDate: b.end.addingTimeInterval(15 * 60 + shift))
        if let a = current, currentSession == sid {
            let box = ActivityBox(activity: a)
            Task { await box.activity.update(content) }
        } else {
            end()
            let attrs = ClassActivityAttributes(sessionID: sid, className: s.name, category: s.category,
                                                clubShort: model.club(s.clubID).shortName, room: s.room)
            if let a = try? Activity.request(attributes: attrs, content: content, pushType: nil) {
                current = a; currentSession = sid
            }
        }
    }

    func end() {
        guard let a = current else { return }
        let box = ActivityBox(activity: a)
        Task { await box.activity.end(nil, dismissalPolicy: .immediate) }
        current = nil; currentSession = nil
    }
}
