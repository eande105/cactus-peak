import Foundation

/// JSON files in Application Support. The app reads them before the first frame, so a cold start
/// (or a start with no network) shows the last data it saw. Each file stores when it was saved.
struct LocalCache: Sendable {
    struct Envelope<T: Codable & Sendable>: Codable, Sendable {
        var savedAt: Date
        var value: T
    }

    let directory: URL

    init(directory: URL? = nil) {
        if let directory {
            self.directory = directory
        } else {
            let base = FileManager.default.urls(for: .applicationSupportDirectory, in: .userDomainMask)[0]
            self.directory = base.appendingPathComponent("CactusPeakCache", isDirectory: true)
        }
    }

    static let catalogFile = "catalog.json"
    static func householdFile(_ user: UUID) -> String { "household-\(user.uuidString.lowercased()).json" }

    func read<T: Codable & Sendable>(_ type: T.Type, from name: String) -> Envelope<T>? {
        guard let data = try? Data(contentsOf: directory.appendingPathComponent(name)) else { return nil }
        return try? RowCoding.cacheDecoder.decode(Envelope<T>.self, from: data)
    }

    func write<T: Codable & Sendable>(_ value: T, to name: String, savedAt: Date = .now) throws {
        try FileManager.default.createDirectory(at: directory, withIntermediateDirectories: true)
        let data = try RowCoding.cacheEncoder.encode(Envelope(savedAt: savedAt, value: value))
        try data.write(to: directory.appendingPathComponent(name), options: [.atomic, .completeFileProtectionUntilFirstUserAuthentication])
    }

    func remove(_ name: String) {
        try? FileManager.default.removeItem(at: directory.appendingPathComponent(name))
    }

    /// Sign-out: every household file goes. The public catalog stays.
    func removeHouseholds() {
        let files = (try? FileManager.default.contentsOfDirectory(atPath: directory.path)) ?? []
        for f in files where f.hasPrefix("household-") { remove(f) }
    }
}
