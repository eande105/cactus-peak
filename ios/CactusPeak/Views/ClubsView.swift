import SwiftUI
import MapKit

struct ClubsView: View {
    @Environment(AppModel.self) private var model
    @Environment(AppRouter.self) private var router
    @Environment(\.dynamicTypeSize) private var dts
    @State private var camera: MapCameraPosition = .region(MKCoordinateRegion(center: .init(latitude: 33.39, longitude: -111.79), span: .init(latitudeDelta: 0.28, longitudeDelta: 0.34)))
    @State private var selected: ClubID?
    @State private var query = ""
    @State private var filters: Set<String> = []
    @State private var searchMessage: String?

    private let chipNames = ["Open now", "Pool", "Courts", "Kids club", "Recovery"]

    private var shown: [Club] {
        model.clubs.filter { c in
            filters.allSatisfy { f in
                switch f {
                case "Open now": c.isOpen(at: model.now)
                case "Pool": c.hasPool
                case "Courts": c.hasCourts
                case "Kids club": c.hasKids
                case "Recovery": c.hasRecovery
                default: true
                }
            }
        }
    }

    var body: some View {
        // Native alternative to a persistent sheet: the map keeps its own area and the clubs list sits under it, so the
        // tab bar stays reachable and no control covers a pin. Search and filters live in the navigation bar.
        VStack(spacing: 0) {
            map.frame(minHeight: dts.isAccessibilitySize ? 220 : 280, maxHeight: dts.isAccessibilitySize ? 260 : 340)
            panel
        }
        .screenBackground()
        .navigationTitle("Clubs")
        .navigationBarTitleDisplayMode(.inline)
        .searchable(text: $query, prompt: "City or ZIP")
        .onSubmit(of: .search) { search() }
        .toolbar {
            ToolbarItem(placement: .topBarTrailing) {
                Menu {
                    ForEach(chipNames, id: \.self) { n in
                        Toggle(n, isOn: Binding(get: { filters.contains(n) }, set: { on in if on { filters.insert(n) } else { filters.remove(n) } }))
                    }
                    if !filters.isEmpty { Button("Clear filters") { filters = [] } }
                } label: { Image(systemName: filters.isEmpty ? "line.3.horizontal.decrease.circle" : "line.3.horizontal.decrease.circle.fill") }
                    .accessibilityLabel("Filters").accessibilityValue(filters.isEmpty ? "none on" : "\(filters.count) on")
            }
        }
    }

    private var map: some View {
        Map(position: $camera, selection: $selected) {
            ForEach(shown) { c in
                Annotation(c.shortName, coordinate: c.coordinate, anchor: .bottom) {
                    ClubPin(club: c, reading: model.busyness(c), isSelected: selected == c.id, isHome: c.id == model.member.homeClubID)
                }
                .tag(c.id)
            }
            UserAnnotation()
        }
        .mapControls { MapUserLocationButton() }
        .mapStyle(.standard(elevation: .flat, pointsOfInterest: .excludingAll))
        .accessibilityLabel("Map of \(shown.count) clubs. Use the club list below.")
        .onChange(of: selected) { _, id in
            if let id, let c = model.clubs.first(where: { $0.id == id }) {
                withAnimation(.snappy) { camera = .region(MKCoordinateRegion(center: c.coordinate, span: .init(latitudeDelta: 0.08, longitudeDelta: 0.1))) }
            }
        }
    }

    private var panel: some View {
        List {
            Section {
                if let id = selected, let c = model.clubs.first(where: { $0.id == id }) {
                    VStack(alignment: .leading, spacing: 10) {
                        ClubCard(club: c, reading: model.busyness(c), now: model.now, variant: .mapCallout)
                        HStack {
                            Button("Directions") { if let u = URL(string: "http://maps.apple.com/?daddr=\(c.latitude),\(c.longitude)") { UIApplication.shared.open(u) } }.secondaryAction()
                            Button("Open club") { router.push(.club(c.id)) }.primaryAction()
                        }
                    }
                    .listRowInsets(.init(top: 8, leading: 16, bottom: 8, trailing: 16)).listRowBackground(Color.clear)
                }
                if let m = searchMessage { Text(m).font(.footnote).foregroundStyle(Color.textMuted) }
            }
            if shown.isEmpty {
                EmptyState(title: "No club has all of those", message: "Try fewer filters.", symbol: "mappin.slash", actionTitle: "Clear filters") { filters = [] }
                    .listRowBackground(Color.clear)
            }
            Section {
                ForEach(shown.sorted { $0.distanceMiles < $1.distanceMiles }) { c in
                    Button { selected = c.id } label: {
                        HStack {
                            ClubCard(club: c, reading: model.busyness(c), now: model.now, variant: .listRow, isHome: c.id == model.member.homeClubID, selected: selected == c.id)
                            Button { router.push(.club(c.id)) } label: { Image(systemName: "chevron.right").frame(width: 44, height: 88) }
                                .buttonStyle(.plain).foregroundStyle(Color.textMuted).accessibilityLabel("Open \(c.fullName)")
                        }
                    }
                    .buttonStyle(.plain)
                }
            }
        }
        .listStyle(.plain).scrollContentBackground(.hidden).background(Color.appBackground)
    }

    private func search() {
        let q = query.trimmingCharacters(in: .whitespaces).lowercased()
        guard !q.isEmpty else { return }
        let match = model.clubs.filter { $0.zip == q || $0.city.lowercased() == q || $0.area.lowercased() == q || $0.fullName.lowercased().contains(q) || $0.address.lowercased().contains(q) }
        if match.isEmpty { searchMessage = "No club near \"\(query)\". Try Mesa, Gilbert or a ZIP like 85233."; return }
        searchMessage = nil
        let lat = match.map(\.latitude).reduce(0, +) / Double(match.count), lon = match.map(\.longitude).reduce(0, +) / Double(match.count)
        withAnimation(.snappy) { camera = .region(MKCoordinateRegion(center: .init(latitude: lat, longitude: lon), span: .init(latitudeDelta: match.count > 1 ? 0.16 : 0.06, longitudeDelta: match.count > 1 ? 0.2 : 0.08))) }
        if match.count == 1 { selected = match[0].id }
    }
}
