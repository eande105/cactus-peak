import SwiftUI
import PassKit
import EventKit
import EventKitUI
import LocalAuthentication

/// System "Add to Apple Wallet" button. A Wallet pass needs a signing certificate and a pass type ID,
/// so tapping it runs the stub handler. The entry point and layout are final.
struct WalletButton: UIViewRepresentable {
    var action: () -> Void
    func makeCoordinator() -> Coordinator { Coordinator(action: action) }
    func makeUIView(context: Context) -> PKAddPassButton {
        let b = PKAddPassButton(addPassButtonStyle: .black)
        b.addTarget(context.coordinator, action: #selector(Coordinator.tap), for: .touchUpInside)
        return b
    }
    func updateUIView(_ uiView: PKAddPassButton, context: Context) {
        context.coordinator.action = action
        uiView.addPassButtonStyle = context.environment.colorScheme == .dark ? .blackOutline : .black
    }
    final class Coordinator: NSObject {
        var action: () -> Void
        init(action: @escaping () -> Void) { self.action = action }
        @objc func tap() { action() }
    }
}

/// System calendar editor for "Add to calendar".
struct EventEditor: UIViewControllerRepresentable {
    let title: String
    let location: String
    let start: Date
    let end: Date
    let url: URL?
    var onDone: (Bool) -> Void

    func makeUIViewController(context: Context) -> EKEventEditViewController {
        let store = EKEventStore()
        let ev = EKEvent(eventStore: store)
        ev.title = title; ev.location = location; ev.startDate = start; ev.endDate = end; ev.url = url
        ev.addAlarm(EKAlarm(relativeOffset: -30 * 60))
        let vc = EKEventEditViewController()
        vc.eventStore = store; vc.event = ev; vc.editViewDelegate = context.coordinator
        return vc
    }
    func updateUIViewController(_ uiViewController: EKEventEditViewController, context: Context) {}
    func makeCoordinator() -> Coordinator { Coordinator(onDone: onDone) }
    final class Coordinator: NSObject, EKEventEditViewDelegate {
        var onDone: (Bool) -> Void
        init(onDone: @escaping (Bool) -> Void) { self.onDone = onDone }
        func eventEditViewController(_ controller: EKEventEditViewController, didCompleteWith action: EKEventEditViewAction) {
            onDone(action == .saved)
        }
    }
}

enum BiometricGate {
    /// Face ID or passcode before billing screens. In the simulator without enrolment it passes through.
    static func authenticate(reason: String) async -> Bool {
        let ctx = LAContext()
        var err: NSError?
        guard ctx.canEvaluatePolicy(.deviceOwnerAuthenticationWithBiometrics, error: &err) else { return true }
        return (try? await ctx.evaluatePolicy(.deviceOwnerAuthentication, localizedReason: reason)) ?? false
    }
}
