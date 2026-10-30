import SwiftUI

// Cactus Peak brand graphics: the same vectors as the marketing site and the web app.
// Source of truth: marketing-site/components/brand/graphics (rules in brand-graphics/README.md).
// The images live in Shared/BrandGraphics.xcassets, which tools/import-brand-graphics.py writes
// from the exported SVGs, with a light and a dark appearance and preserved vector data.
// Graphics are images, not interface icons. Interface icons stay on SF Symbols.

/// Space and amenity graphics (line collection). Raw values are the shared ids.
enum SpaceGraphicID: String, CaseIterable, Sendable, Hashable {
    case strengthFloor = "strength-floor", machines, cardio, studio, cycleStudio = "cycle-studio", courts
    case lapPool = "lap-pool", warmPool = "warm-pool", splashPad = "splash-pad", recovery, kidsClub = "kids-club"
    case lockers, deck, turf, lounge

    /// Space art scene for the same space, when one exists (club hero pages).
    var artID: String? {
        switch self {
        case .lapPool, .strengthFloor, .studio, .cycleStudio, .courts, .recovery, .kidsClub, .deck: rawValue
        default: nil
        }
    }
}

extension ClassCategory {
    /// The shared class graphic id.
    var graphicID: String { self == .mindBody ? "mind-body" : rawValue }
}

/// Image names in BrandGraphics.xcassets. Use the small variants below 120 pt.
enum BrandImage {
    enum ClassVariant: String { case wide = "16x9", square = "1x1" }
    enum SpaceVariant: String { case square = "1x1", tile }
    enum ArtVariant: String { case wide = "16x9", tall = "4x5", thumb }

    /// The coach marks that exist. Other coaches show their category's class graphic.
    static let coachMarks: Set<String> = ["marisol-vega", "devon-hart", "imani-brooks", "luis-ortega", "sam-okafor", "tess-nakamura", "ray-delgado", "nadia-kowalski"]

    static func classGraphic(_ c: ClassCategory, _ v: ClassVariant = .wide) -> String { "class-\(c.graphicID)-\(v.rawValue)" }
    static func space(_ id: SpaceGraphicID, _ v: SpaceVariant = .square) -> String { "space-\(id.rawValue)-\(v.rawValue)" }
    static func art(_ id: String, _ v: ArtVariant = .wide) -> String { "art-\(id)-\(v.rawValue)" }
    static func clubExterior(slug: String, _ v: ArtVariant = .wide) -> String { art("exterior-\(slug)", v) }

    /// "Marisol Vega" → "marisol-vega", the slug the coach marks use.
    static func personSlug(_ name: String) -> String {
        name.folding(options: [.diacriticInsensitive, .caseInsensitive], locale: .init(identifier: "en_US")).lowercased()
            .split(separator: " ").joined(separator: "-")
    }
    static func coachMark(name: String) -> String? {
        let slug = personSlug(name)
        return coachMarks.contains(slug) ? "coach-\(slug)" : nil
    }
}

/// A brand graphic that fills its frame. The art is composed for the ratio of its variant;
/// `scaledToFill` crops the edges a little if the frame differs, and never stretches.
struct BrandGraphicImage: View {
    var name: String
    var body: some View {
        Color.clear
            .overlay { Image(name).resizable().scaledToFill() }
            .clipped()
            .accessibilityHidden(true)
    }
}

/// Class graphic for a category: wide for heroes and cards, square for tiles.
struct ClassGraphic: View {
    var category: ClassCategory
    var variant: BrandImage.ClassVariant = .wide
    var body: some View { BrandGraphicImage(name: BrandImage.classGraphic(category, variant)) }
}

/// Space or amenity graphic. Use `.tile` below 120 pt.
struct SpaceGraphic: View {
    var id: SpaceGraphicID
    var variant: BrandImage.SpaceVariant = .tile
    var body: some View { BrandGraphicImage(name: BrandImage.space(id, variant)) }
}

/// The club's exterior art. Use `.thumb` below 120 pt.
struct ClubExteriorArt: View {
    var slug: String
    var variant: BrandImage.ArtVariant = .wide
    var body: some View { BrandGraphicImage(name: BrandImage.clubExterior(slug: slug, variant)) }
}

/// A coach's image in a circle (or a rounded square). Coaches with a bespoke mark get it.
/// The others get their category's class graphic until the marketing site adds a mark for them.
struct CoachImage: View {
    var name: String
    var category: ClassCategory
    var size: CGFloat? = 32
    var circle = true
    @ScaledMetric(relativeTo: .body) private var scale: CGFloat = 1

    var body: some View {
        let s = size.map { $0 * min(scale, 1.6) }
        BrandGraphicImage(name: BrandImage.coachMark(name: name) ?? BrandImage.classGraphic(category, .square))
            .frame(width: s, height: s)
            .clipShape(circle ? AnyShape(Circle()) : AnyShape(RoundedRectangle(cornerRadius: 12, style: .continuous)))
    }
}
