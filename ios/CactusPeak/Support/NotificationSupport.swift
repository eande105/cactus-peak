import Foundation
import UserNotifications

/// Local notifications for reminders and waitlist holds. Categories follow the catalogue in the spec.
/// Time Sensitive delivery needs a capability this unsigned build does not carry, so it falls back to active.
@MainActor
final class NotificationSupport: NSObject, UNUserNotificationCenterDelegate {
    static let shared = NotificationSupport()
    private let center = UNUserNotificationCenter.current()

    func configure() {
        center.delegate = self
        let confirm = UNNotificationAction(identifier: "CONFIRM_SPOT", title: "Confirm spot", options: [])
        let showPass = UNNotificationAction(identifier: "SHOW_PASS", title: "Show pass", options: [.foreground])
        center.setNotificationCategories([
            UNNotificationCategory(identifier: "WAITLIST_PROMOTED", actions: [confirm], intentIdentifiers: [], options: []),
            UNNotificationCategory(identifier: "CLASS_REMINDER", actions: [showPass], intentIdentifiers: [], options: []),
        ])
    }

    func requestAuthorization() async -> Bool {
        (try? await center.requestAuthorization(options: [.alert, .sound, .badge])) ?? false
    }

    func post(title: String, body: String, category: String, route: String?) {
        let c = UNMutableNotificationContent()
        c.title = title; c.body = body; c.categoryIdentifier = category
        if let route { c.userInfo = ["route": route] }
        center.add(UNNotificationRequest(identifier: UUID().uuidString, content: c, trigger: UNTimeIntervalNotificationTrigger(timeInterval: 1, repeats: false)))
    }

    func scheduleReminder(for b: Booking, lead: Int, clubName: String) {
        let model = AppModel.shared
        let fire = b.start.addingTimeInterval(-Double(lead) * 60).timeIntervalSince(model.now)
        guard fire > 5 else { return }
        let c = UNMutableNotificationContent()
        c.title = "\(b.title) at \(b.start.cpTime)"
        c.body = "\(clubName)\(b.detail.isEmpty ? "" : ", \(b.detail)"). Bring water."
        c.categoryIdentifier = "CLASS_REMINDER"
        c.userInfo = ["route": "/book/class/\(b.sessionID ?? "")"]
        center.add(UNNotificationRequest(identifier: "reminder_\(b.id)", content: c, trigger: UNTimeIntervalNotificationTrigger(timeInterval: fire, repeats: false)))
    }

    nonisolated func userNotificationCenter(_ center: UNUserNotificationCenter, willPresent notification: UNNotification) async -> UNNotificationPresentationOptions {
        [.banner, .sound]
    }

    nonisolated func userNotificationCenter(_ center: UNUserNotificationCenter, didReceive response: UNNotificationResponse) async {
        let route = response.notification.request.content.userInfo["route"] as? String
        let action = response.actionIdentifier
        await MainActor.run {
            let model = AppModel.shared
            if action == "CONFIRM_SPOT", let h = model.activeHold { model.confirmHold(h.id); return }
            if action == "SHOW_PASS" { AppRouter.shared.open(URL(string: "cactuspeak://pass")!); return }
            if let route, let url = URL(string: "cactuspeak://" + route.trimmingCharacters(in: CharacterSet(charactersIn: "/"))) { AppRouter.shared.open(url) }
        }
    }
}
