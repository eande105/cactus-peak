import SwiftUI

@main
struct CactusPeakApp: App {
    @Environment(\.scenePhase) private var scenePhase
    init() {
        DebugLaunch.apply()
        NotificationSupport.shared.configure()
        AppModel.shared.startTicking()
        AppModel.shared.start()
        #if DEBUG
        // Archivo must be registered. Without it Font.custom falls back to the system font without any error.
        assert(UIFont(name: "ArchivoRoman-ExtraBold", size: 12) != nil, "Archivo-VF.ttf is not registered in UIAppFonts")
        #endif
    }
    var body: some Scene {
        WindowGroup {
            RootView()
                .environment(AppModel.shared)
                .environment(AppRouter.shared)
                .tint(Color.brandAccent)
        }
        .onChange(of: scenePhase) { _, phase in
            // Launch and foreground: refresh data older than five minutes.
            if phase == .active { AppModel.shared.refreshIfStale() }
        }
    }
}
