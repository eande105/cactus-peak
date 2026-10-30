import Foundation

/// Session ids are shared with the web app: `<club_slug>~YYYY-MM-DD~HHMM~<class_key>`, in Arizona time.
/// A booking made on the web and one made here refer to the same session only if both build the id this way.
enum SessionKey {
    static func make(club: String, start: Date, classKey: String) -> SessionID {
        let c = AZ.cal.dateComponents([.year, .month, .day, .hour, .minute], from: start)
        let day = String(format: "%04d-%02d-%02d", c.year ?? 0, c.month ?? 0, c.day ?? 0)
        let time = String(format: "%02d%02d", c.hour ?? 0, c.minute ?? 0)
        return "\(club)~\(day)~\(time)~\(classKey)"
    }

    struct Parts: Equatable, Sendable { var club: String; var start: Date; var classKey: String }

    static func parse(_ id: SessionID) -> Parts? {
        let p = id.split(separator: "~", omittingEmptySubsequences: false).map(String.init)
        guard p.count == 4, p[2].count == 4 else { return nil }
        let d = p[1].split(separator: "-").compactMap { Int($0) }
        guard d.count == 3, let hm = Int(p[2]) else { return nil }
        return Parts(club: p[0], start: AZ.date(d[0], d[1], d[2], hm / 100, hm % 100), classKey: p[3])
    }
}

extension ClassCategory {
    /// The id in `categories` ("mind-body" for `.mindBody`).
    var dbID: String { self == .mindBody ? "mind-body" : rawValue }
    init?(dbID: String) {
        if dbID == "mind-body" { self = .mindBody } else { self.init(rawValue: dbID) }
    }
}

/// Turns catalog rows into the app's models. Pure functions, so tests can call them without a network.
enum CatalogMapper {
    static func clubs(_ rows: [ClubRow]) -> [Club] {
        rows.sorted { $0.sort < $1.sort }.map(club)
    }

    static func club(_ r: ClubRow) -> Club {
        func courts(_ sport: String) -> Int { r.courts.first { $0.sport == sport }?.count ?? 0 }
        let caption = r.photoCaption.flatMap { $0.isEmpty ? nil : $0 } ?? "\(r.shortName) — the main floor"
        return Club(
            id: r.slug, slug: r.slug, city: r.city, area: r.neighborhood, address: r.address, phone: r.phone, zip: r.zip,
            latitude: r.lat, longitude: r.lng, kind: r.typeLabel, personality: r.personality,
            amenities: r.amenities.map { Club.Amenity(label: $0, symbol: symbol(forAmenity: $0)) },
            lanes: r.pool?.lanes ?? 0, hasKids: r.kidsClub,
            pickleball: courts("pickleball"), tennis: courts("tennis"), basketball: courts("basketball"),
            hasRecovery: r.recovery != "none", hasTherapyPool: r.pool?.therapy ?? false, studios: r.studioCount,
            distanceMiles: r.demoMiles ?? 0,
            photoCaptions: [caption, "\(r.shortName) — studios", "\(r.shortName) — strength floor", "\(r.shortName) — front desk"],
            toneIndex: r.sort, typicalWeekday: r.typicalWeekday, typicalWeekend: r.typicalWeekend)
    }

    static func symbol(forAmenity label: String) -> String {
        let l = label.lowercased()
        if l.contains("therapy") || l.contains("splash") { return "drop.fill" }
        if l.contains("pool") || l.contains("swim") { return "figure.pool.swim" }
        if l.contains("pickleball") { return "figure.pickleball" }
        if l.contains("tennis") { return "figure.tennis" }
        if l.contains("basketball") { return "figure.basketball" }
        if l.contains("recovery") || l.contains("sauna") { return "snowflake" }
        if l.contains("kids") { return "face.smiling" }
        if l.contains("café") || l.contains("cafe") { return "cup.and.saucer" }
        if l.contains("cycle") { return "bicycle" }
        if l.contains("lifting") || l.contains("strength") { return "figure.strengthtraining.traditional" }
        if l.contains("rooftop") || l.contains("deck") { return "sunset" }
        if l.contains("turf") { return "figure.run" }
        if l.contains("studio") { return "square.grid.3x1.below.line.grid.1x2" }
        return "checkmark.circle"
    }

    static func category(forDiscipline d: String) -> ClassCategory? {
        let l = d.lowercased()
        if l.contains("cycle") { return .cycle }
        if l.contains("strength") || l.contains("lifting") || l.contains("barbell") { return .strength }
        if l.contains("mind") || l.contains("yoga") { return .mindBody }
        if l.contains("conditioning") { return .conditioning }
        if l.contains("aqua") || l.contains("swim") { return .aqua }
        if l.contains("court") || l.contains("pickleball") { return .court }
        if l.contains("youth") || l.contains("teen") { return .youth }
        if l.contains("recovery") || l.contains("mobility") { return .recovery }
        return nil
    }

    static func coaches(_ rows: [CoachRow], classTypes: [ClassTypeRow]) -> [Coach] {
        let typeBySlug = Dictionary(classTypes.map { ($0.slug, $0) }, uniquingKeysWith: { a, _ in a })
        return rows.map { r in
            let cat = category(forDiscipline: r.discipline)
                ?? r.teaches.lazy.compactMap { typeBySlug[$0].flatMap { ClassCategory(dbID: $0.categoryId) } }.first
                ?? r.specialties.lazy.compactMap { category(forDiscipline: $0) }.first
                ?? .strength
            let last = r.name.split(separator: " ").dropFirst().first.map { " \($0.prefix(1))." } ?? ""
            let credential = r.credential.isEmpty ? "\(r.discipline.isEmpty ? cat.title : r.discipline) coach" : r.credential
            let openings = r.openTimes.compactMap { t -> Coach.Opening? in
                let p = t.time.split(separator: ":").compactMap { Int($0) }
                guard p.count >= 2 else { return nil }
                return Coach.Opening(dow: t.dow, minute: p[0] * 60 + p[1])
            }
            return Coach(id: r.id, slug: r.slug, fullName: r.name, shortName: "\(r.firstName)\(last)", credential: credential,
                         category: cat, clubs: r.clubs, specialties: r.specialties, bio: r.about, trains: r.personalTrainer,
                         openTimes: openings)
        }
    }

    /// Dated sessions for every schedule row from `from` (inclusive) for `days` days.
    static func sessions(catalog c: CatalogRows, from: Date, days: Int) -> [ClassSession] {
        let types = Dictionary(c.classTypes.map { ($0.key, $0) }, uniquingKeysWith: { a, _ in a })
        let day0 = from.startOfAZDay
        var out: [ClassSession] = []
        for off in 0..<days {
            let day = day0.addingDays(off)
            let dow = AZ.cal.component(.weekday, from: day) - 1
            for row in c.schedules where row.days.contains(dow) {
                guard let t = types[row.classKey], t.bookable, let cat = ClassCategory(dbID: t.categoryId) else { continue }
                let hm = row.startTime.split(separator: ":").compactMap { Int($0) }
                guard hm.count >= 2, let start = AZ.cal.date(bySettingHour: hm[0], minute: hm[1], second: 0, of: day) else { continue }
                let c = AZ.cal.dateComponents([.year, .month, .day], from: day)
                let base = SessionBaseline.make(club: row.clubSlug, day: String(format: "%04d-%02d-%02d", c.year ?? 0, c.month ?? 0, c.day ?? 0),
                                                time: String(format: "%02d:%02d", hm[0], hm[1]), classKey: t.key, capacity: t.capacity)
                out.append(ClassSession(
                    id: SessionKey.make(club: row.clubSlug, start: start, classKey: t.key), classKey: t.key,
                    name: t.name, category: cat, clubID: row.clubSlug, room: row.studio, start: start, durationMin: t.duration,
                    coachID: row.coachId, intensity: row.intensity ?? t.intensity, capacity: t.capacity,
                    baseBooked: base.booked, baseWaitlist: base.waitlist,
                    firstTimers: t.firstTimerOk, teenOK: t.teenOk, minAge: t.minAge,
                    summary: t.blurb.isEmpty ? t.about : t.blurb, bring: t.bring, spotNoun: t.unit))
            }
        }
        return out.sorted { $0.start == $1.start ? $0.name < $1.name : $0.start < $1.start }
    }

    /// Plan prices and windows from the database, keyed by plan id.
    static func plans(_ rows: [PlanRow]) -> [PlanTier: PlanRow] {
        Dictionary(rows.compactMap { r in PlanTier(rawValue: r.id).map { ($0, r) } }, uniquingKeysWith: { a, _ in a })
    }
}

extension Club {
    /// Shown only for an id the catalog does not have (an empty first launch, a removed club).
    static func placeholder(_ id: ClubID) -> Club {
        Club(id: id, slug: id, city: "", area: "Club", address: "", phone: "(480) 555-0100", zip: "", latitude: 33.4, longitude: -111.8,
             kind: "", personality: "", amenities: [], lanes: 0, hasKids: false, pickleball: 0, tennis: 0, basketball: 0,
             hasRecovery: false, hasTherapyPool: false, studios: 0, distanceMiles: 0, photoCaptions: [""], toneIndex: 0,
             typicalWeekday: [], typicalWeekend: [])
    }
}

extension Coach {
    static func placeholder(_ id: CoachID) -> Coach {
        Coach(id: id, slug: id, fullName: "Coach", shortName: "Coach", credential: "", category: .strength, clubs: [],
              specialties: [], bio: "", trains: false, openTimes: [])
    }
}
