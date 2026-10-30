import Foundation
import Supabase

/// One plain sentence for a failed write or sign-in. The database error code decides the words,
/// so a network failure never blames the member and a policy failure never says "try again".
struct BackendError: LocalizedError, Equatable, Sendable {
    enum Kind: Equatable, Sendable { case offline, duplicate, notAllowed, notFound, invalidCredentials, notConfigured, other }
    var kind: Kind
    var code: String?

    init(kind: Kind, code: String? = nil) { self.kind = kind; self.code = code }

    init(_ error: any Error) {
        if let known = error as? BackendError { self = known; return }
        if let url = error as? URLError {
            self.init(kind: [.notConnectedToInternet, .networkConnectionLost, .timedOut, .cannotFindHost, .cannotConnectToHost,
                             .dataNotAllowed, .internationalRoamingOff].contains(url.code) ? .offline : .other)
            return
        }
        if let auth = error as? AuthError {
            self.init(kind: auth.errorCode == .invalidCredentials ? .invalidCredentials : .other, code: auth.errorCode.rawValue)
            return
        }
        if let pg = error as? PostgrestError {
            self.init(code: pg.code)
            return
        }
        self.init(kind: .other)
    }

    /// Maps a Postgres or PostgREST error code.
    init(code: String?) {
        switch code {
        case "23505": self.init(kind: .duplicate, code: code)
        case "42501", "PGRST301", "PGRST302": self.init(kind: .notAllowed, code: code)
        case "PGRST116", "P0002": self.init(kind: .notFound, code: code)
        default: self.init(kind: .other, code: code)
        }
    }

    var errorDescription: String? {
        switch kind {
        case .offline: "You're offline. Nothing changed. Try again when you're online."
        case .duplicate: "You already have this booking."
        case .notAllowed: "Your account can't make that change. Nothing changed."
        case .notFound: "That booking no longer exists."
        case .invalidCredentials: "That email and password don't match. Check them and try again."
        case .notConfigured: "This build has no server settings. Add Config/Secrets.xcconfig and build again."
        case .other: "Something went wrong on our side. Nothing changed. Try again."
        }
    }
}
