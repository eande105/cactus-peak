import SwiftUI

// Club hero and member avatar. Placeholder photo slots are gone: clubs, spaces, classes and coaches use the
// brand graphics in Shared/BrandGraphics.swift.

extension Color {
    /// Flat blend used for tonal fills (no gradient).
    func mix(with other: Color, _ amount: Double) -> Color {
        Color(self.resolve(in: EnvironmentValues()).mixed(other, amount))
    }
}
private extension Color.Resolved {
    func mixed(_ other: Color, _ t: Double) -> Color.Resolved {
        let o = other.resolve(in: EnvironmentValues())
        return Color.Resolved(red: red + (o.red - red) * Float(t), green: green + (o.green - green) * Float(t),
                              blue: blue + (o.blue - blue) * Float(t), opacity: 1)
    }
}

/// Swipeable hero for a club: the club exterior, then its primary spaces, as brand space art.
struct ClubHero: View {
    let club: Club
    var height: CGFloat = 260
    @State private var page = 0
    @Environment(\.dynamicTypeSize) private var dts

    private var textBlock: some View {
        VStack(alignment: .leading, spacing: 2) {
            Text(club.fullName).font(.archivoExtraBold(30, relativeTo: .largeTitle)).foregroundStyle(Color.nightOnSurface).fixedSize(horizontal: false, vertical: true)
            Text(club.factLine).font(.subheadline).foregroundStyle(Color.nightOnSurface).fixedSize(horizontal: false, vertical: true)
        }
        .padding(.horizontal, 16).padding(.vertical, 12)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(Color.nightSurface.opacity(0.8))
    }

    /// The exterior first, then up to three primary spaces that have space art (club-spaces mapping).
    private var pages: [(name: String, image: String)] {
        let spaces = club.spaces.primary.compactMap { s in s.graphic.artID.map { (name: s.name, image: BrandImage.art($0)) } }
        return [(name: "Outside", image: BrandImage.clubExterior(slug: club.slug))] + spaces.prefix(3)
    }

    private var pager: some View {
        TabView(selection: $page) {
            ForEach(Array(pages.enumerated()), id: \.offset) { i, p in
                BrandGraphicImage(name: p.image).tag(i)
            }
        }
        .tabViewStyle(.page(indexDisplayMode: dts.isAccessibilitySize ? .never : .always))
    }

    var body: some View {
        Group {
            if dts.isAccessibilitySize {
                // The name block sits under the photo so large text is never clipped.
                VStack(spacing: 0) { pager.frame(height: 180); textBlock }
            } else {
                ZStack(alignment: .bottomLeading) { pager.frame(height: height); textBlock.padding(.bottom, 30) }.frame(height: height)
            }
        }
        .accessibilityElement(children: .ignore)
        .accessibilityLabel("\(club.fullName). \(club.factLine). \(pages[min(page, pages.count - 1)].name), image \(page + 1) of \(pages.count). Swipe up or down to change.")
        .accessibilityAdjustableAction { dir in
            switch dir { case .increment: page = min(pages.count - 1, page + 1); case .decrement: page = max(0, page - 1); @unknown default: break }
        }
    }
}

/// Monogram avatar for members and family. Coaches use `CoachImage` (brand coach marks).
struct Avatar: View {
    var initials: String
    var category: ClassCategory?
    var size: CGFloat = 32
    @ScaledMetric(relativeTo: .body) private var scale: CGFloat = 1
    var body: some View {
        let s = size * min(scale, 1.6)
        ZStack {
            Circle().fill((category?.color ?? Color.brandSecondary).opacity(0.16))
            Text(initials).font(.system(size: s * 0.38, weight: .semibold, design: .default))
                .foregroundStyle(category?.textColor ?? Color.textPrimary)
        }
        .frame(width: s, height: s)
        .overlay(Circle().strokeBorder(Color.hairline, lineWidth: 1))
        .accessibilityHidden(true)
    }
}
