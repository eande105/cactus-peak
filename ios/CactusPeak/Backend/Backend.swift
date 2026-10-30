import Foundation
import Supabase

/// Server settings from Info.plist, which reads them from Config/Secrets.xcconfig at build time.
struct BackendConfig: Sendable {
    var url: URL
    var publishableKey: String
    /// DEBUG builds only. Used to sign in as a demo account from Settings > Demo controls.
    var demoPassword: String?

    static let current: BackendConfig? = {
        let info = Bundle.main.infoDictionary ?? [:]
        guard let raw = info["SupabaseURL"] as? String, let url = URL(string: raw), url.host() != nil, !(url.host() ?? "").isEmpty,
              let key = info["SupabasePublishableKey"] as? String, !key.isEmpty else { return nil }
        var demo: String?
        #if DEBUG
        demo = (info["DemoPassword"] as? String).flatMap { $0.isEmpty ? nil : $0 }
        #endif
        return BackendConfig(url: url, publishableKey: key, demoPassword: demo)
    }()
}

/// The one Supabase client. Auth keeps its session in the keychain (supabase-swift's `KeychainLocalStorage`),
/// so a member who signed in once goes straight in on the next launch. Widgets do not use it: they read the snapshot.
enum Backend {
    static let client: SupabaseClient? = {
        guard let c = BackendConfig.current else { return nil }
        return SupabaseClient(
            supabaseURL: c.url, supabaseKey: c.publishableKey,
            options: SupabaseClientOptions(auth: .init(emitLocalSessionAsInitialSession: true)))
    }()

    static func require() throws -> SupabaseClient {
        guard let client else { throw BackendError(kind: .notConfigured) }
        return client
    }
}
