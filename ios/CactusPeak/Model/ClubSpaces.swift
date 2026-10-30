import Foundation

// The spaces of a club, derived from the club's own data.
// Swift port of marketing-site/lib/data/club-spaces.ts (the source of truth; the web app has a TypeScript port).
// Keep the order and the copy in sync with that file.

struct ClubSpace: Identifiable, Hashable, Sendable {
    let id: String
    let graphic: SpaceGraphicID
    let name: String
    /// One line.
    let line: String
    /// The amenities in this space.
    let amenities: [String]
}

/// An amenity that applies to the whole club.
struct ClubAmenity: Identifiable, Hashable, Sendable {
    let id: String
    let graphic: SpaceGraphicID
    let name: String
}

struct ClubSpaces: Sendable {
    let primary: [ClubSpace]
    let amenities: [ClubAmenity]
}

private enum SpaceKey: String { case pool, courts, recovery, strength, studios, kids, deck }

/// The order of the large spaces for each club. The first four become primary spaces. The rest become amenities.
private let order: [String: [SpaceKey]] = [
    "mesa-dobson": [.pool, .courts, .recovery, .strength, .studios, .kids],
    "mesa-red-mountain": [.pool, .courts, .strength, .studios, .kids],
    "mesa-downtown": [.strength, .studios, .recovery],
    "gilbert-val-vista": [.pool, .kids, .courts, .strength, .studios, .recovery],
    "gilbert-heritage": [.strength, .studios, .recovery, .deck],
]

private func plural(_ n: Int, _ one: String, _ many: String? = nil) -> String { "\(n) \(n == 1 ? one : (many ?? one + "s"))" }

private func build(_ key: SpaceKey, _ c: Club) -> ClubSpace? {
    let s = c.slug
    let id = key.rawValue
    switch key {
    case .pool:
        guard c.hasPool else { return nil }
        var a = ["\(c.lanes) lap lanes"]
        if s == "mesa-dobson" { a.append("Warm-water pool, 90 to 92°F") }
        if s == "gilbert-val-vista" { a += ["Splash pad", "Swim school, levels 1–5"] }
        if s == "mesa-red-mountain" { a += ["Shade sails", "Aqua Fit"] }
        a += ["Lane reservations", "Warm showers"]
        return ClubSpace(id: id, graphic: .lapPool,
                         name: s == "gilbert-val-vista" ? "Pool and splash pad" : s == "mesa-dobson" ? "Pools" : "Pool",
                         line: s == "mesa-red-mountain" ? "A 25-m outdoor pool under shade sails." : s == "mesa-dobson" ? "A 25-yd lap pool and a warm-water pool." : "A 25-yd lap pool, a splash pad and swim school.",
                         amenities: a)
    case .courts:
        guard c.hasCourts else { return nil }
        var counts: [String] = []
        if c.pickleball > 0 { counts.append(plural(c.pickleball, "pickleball court")) }
        if c.tennis > 0 { counts.append(plural(c.tennis, "tennis court")) }
        if c.basketball > 0 { counts.append(plural(c.basketball, "basketball court")) }
        return ClubSpace(id: id, graphic: .courts, name: "Courts", line: "Book a 60- or 90-minute slot up to 3 days ahead.",
                         amenities: counts + ["Open play and clinics", "Loaner paddles at the desk"])
    case .recovery:
        guard c.hasRecovery else { return nil }
        let suite = s == "mesa-dobson" || s == "gilbert-val-vista"
        return ClubSpace(id: id, graphic: .recovery, name: suite ? "Recovery suite" : "Recovery lounge", line: "A Summit benefit.",
                         amenities: ["Sauna", "Compression", suite ? "Cold plunge" : "Stretch area"])
    case .strength:
        var a = ["Racks", "Cardio"]
        if s == "gilbert-heritage" { a.append("Olympic lifting platforms") }
        if s == "mesa-red-mountain" { a.append("Turf lane") }
        return ClubSpace(id: id, graphic: .strengthFloor, name: "Strength floor",
                         line: c.kind.hasPrefix("Studio club") ? "Racks and a cardio floor, built for a short visit." : "Racks and a cardio floor with room to spread out.",
                         amenities: a)
    case .studios:
        return ClubSpace(id: id, graphic: .studio, name: "Studios", line: "\(plural(c.studios, "studio")) and a cycle studio.",
                         amenities: [plural(c.studios, "group studio"), "Cycle studio"])
    case .kids:
        guard c.hasKids else { return nil }
        return ClubSpace(id: id, graphic: .kidsClub, name: "Kids club", line: "Ages 6 months to 12 years, while you train.",
                         amenities: ["Monday to Saturday", "2-hour blocks", "Parent check-in", "Allergy notes"])
    case .deck:
        guard s == "gilbert-heritage" else { return nil }
        return ClubSpace(id: id, graphic: .deck, name: "Rooftop mobility deck", line: "Stretch outdoors at golden hour.",
                         amenities: ["Open-air mobility space", "Lift and stairs"])
    }
}

extension Club {
    /// The 3 or 4 spaces to feature, and the amenities for the whole club.
    var spaces: ClubSpaces {
        let all = (order[slug] ?? []).compactMap { build($0, self) }
        let primary = Array(all.prefix(4))
        var amenities = all.dropFirst(4).map { ClubAmenity(id: $0.id, graphic: $0.graphic, name: $0.id == "studios" ? "Studios and cycle" : $0.name) }
        if slug == "mesa-red-mountain" { amenities.insert(ClubAmenity(id: "deck", graphic: .deck, name: "Cardio deck"), at: 0) }
        if hasPool { amenities.append(ClubAmenity(id: "changing", graphic: .lockers, name: "Changing rooms")) }
        if slug == "mesa-dobson" { amenities.append(ClubAmenity(id: "cafe", graphic: .lounge, name: "Café")) }
        return ClubSpaces(primary: primary, amenities: amenities)
    }
}
