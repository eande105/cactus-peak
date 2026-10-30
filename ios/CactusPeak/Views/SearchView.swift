import SwiftUI

enum SearchToken: Identifiable, Hashable {
    case club(ClubID), category(ClassCategory)
    var id: String { switch self { case .club(let c): "c-\(c)"; case .category(let c): "k-\(c.rawValue)" } }
}
enum SearchScope: String, CaseIterable, Identifiable { case all = "All", classes = "Classes", clubs = "Clubs", coaches = "Coaches", help = "Help"; var id: String { rawValue } }

struct SearchView: View {
    @Environment(AppModel.self) private var model
    @Environment(AppRouter.self) private var router
    @State private var text = ""
    @State private var tokens: [SearchToken] = []
    @State private var scope: SearchScope = .all
    @State private var debounced = ""

    private let tries = ["Climb Cycle 6 a.m.", "Pickleball Open Play", "Kids club", "Sauna"]
    private let help = [("How do I freeze my membership?", "freeze"), ("What is a late cancel?", "late cancel strike"), ("How do guest passes work?", "guest pass"), ("Where is the kids club?", "kids club"), ("How do waitlists work?", "waitlist")]

    var body: some View {
        Group {
            if debounced.isEmpty && tokens.isEmpty { browse } else { results }
        }
        .navigationTitle("Search")
        .searchable(text: $text, tokens: $tokens, prompt: "Search classes, clubs, coaches") { token in
            switch token {
            case .club(let id): Text(model.club(id).fullName)
            case .category(let c): Label(c.title, systemImage: c.symbol)
            }
        }
        .searchScopes($scope, activation: .onSearchPresentation) { ForEach(SearchScope.allCases) { Text($0.rawValue).tag($0) } }
        .searchSuggestions {
            if text.isEmpty {
                ForEach(model.recentSearches.prefix(8), id: \.self) { Label($0, systemImage: "clock.arrow.circlepath").searchCompletion($0) }
            } else {
                ForEach(model.clubs.filter { $0.fullName.localizedCaseInsensitiveContains(text) }) { c in Label(c.fullName, systemImage: "mappin.and.ellipse").searchCompletion(c.fullName) }
                ForEach(ClassCategory.allCases.filter { $0.title.localizedCaseInsensitiveContains(text) }) { c in Label(c.title, systemImage: c.symbol).searchCompletion(c.title) }
            }
        }
        .onSubmit(of: .search) { if !text.isEmpty { model.recentSearches.removeAll { $0 == text }; model.recentSearches.insert(text, at: 0) } }
        .task(id: text) { try? await Task.sleep(for: .milliseconds(300)); debounced = text }
        .screenBackground()
    }

    // MARK: Before typing
    private var browse: some View {
        List {
            if !model.recentSearches.isEmpty {
                Section("Recent") {
                    ForEach(model.recentSearches.prefix(8), id: \.self) { r in
                        Button { text = r } label: { Label(r, systemImage: "clock.arrow.circlepath").foregroundStyle(Color.textPrimary).frame(minHeight: 44) }.buttonStyle(.plain)
                    }
                }
            }
            Section("Try") {
                FlowLayout(spacing: 8) { ForEach(tries, id: \.self) { t in Button { text = t } label: { AmenityChip(label: t, symbol: nil) }.buttonStyle(.plain).frame(minHeight: 44) } }
                    .listRowBackground(Color.clear)
            }
            Section("Browse classes") {
                ForEach(ClassCategory.allCases) { c in
                    Button { tokens = [.category(c)] } label: { HStack { CategoryBadge(category: c); Spacer(); Image(systemName: "chevron.right").font(.footnote).foregroundStyle(Color.textMuted) }.frame(minHeight: 44).contentShape(Rectangle()) }.buttonStyle(.plain)
                }
            }
            Section("Clubs and coaches") {
                Button { scope = .clubs; text = "Mesa" } label: { Label("Clubs", systemImage: "mappin.and.ellipse").frame(minHeight: 44) }.buttonStyle(.plain)
                Button { scope = .coaches; text = "a" } label: { Label("Coaches", systemImage: "person.2").frame(minHeight: 44) }.buttonStyle(.plain)
            }
        }
        .listStyle(.insetGrouped).scrollContentBackground(.hidden)
    }

    // MARK: Results
    private var classHits: [ClassSession] {
        let q = debounced.lowercased()
        let cats = tokens.compactMap { t -> ClassCategory? in if case .category(let c) = t { c } else { nil } }
        let clubs = tokens.compactMap { t -> ClubID? in if case .club(let c) = t { c } else { nil } }
        return model.sessions.filter { s in
            s.start > model.now && s.start < model.now.addingDays(8) && model.visible(s)
            && (cats.isEmpty || cats.contains(s.category)) && (clubs.isEmpty || clubs.contains(s.clubID))
            && (q.isEmpty || s.name.lowercased().contains(q) || s.category.title.lowercased().contains(q) || model.coach(s.coachID).fullName.lowercased().contains(q)
                || (q.contains("6 a.m.") && s.name.lowercased().contains(q.replacingOccurrences(of: " 6 a.m.", with: "")) && AZ.cal.component(.hour, from: s.start) == 6))
            && (clubs.isEmpty ? (model.member.plan.allClubs ? true : s.clubID == model.member.homeClubID) : true)
        }.sorted { ($0.name.lowercased() == q ? 0 : 1, $0.start) < ($1.name.lowercased() == q ? 0 : 1, $1.start) }
    }
    private var clubHits: [Club] { model.clubs.filter { debounced.isEmpty || $0.fullName.localizedCaseInsensitiveContains(debounced) || $0.zip.contains(debounced) || $0.slug.contains(debounced.lowercased()) } }
    private var coachHits: [Coach] { model.coaches.filter { debounced.isEmpty || $0.fullName.localizedCaseInsensitiveContains(debounced) || $0.category.title.localizedCaseInsensitiveContains(debounced) || $0.specialties.contains { $0.localizedCaseInsensitiveContains(debounced) } } }
    private var helpHits: [(String, String)] { help.filter { h in debounced.isEmpty || h.0.localizedCaseInsensitiveContains(debounced) || h.1.contains(debounced.lowercased()) } }

    @ViewBuilder private var results: some View {
        let classes = classHits, clubs = clubHits, coaches = coachHits, helps = helpHits
        let empty = (scope == .all ? classes.isEmpty && clubs.isEmpty && coaches.isEmpty && helps.isEmpty : (scope == .classes ? classes.isEmpty : scope == .clubs ? clubs.isEmpty : scope == .coaches ? coaches.isEmpty : helps.isEmpty))
        if empty {
            ContentUnavailableView {
                Label("No results for \"\(debounced)\"", systemImage: "magnifyingglass")
            } description: { Text("Check the spelling or try a different search.") } actions: {
                if !tokens.isEmpty { Button("Clear filters") { tokens = [] }.primaryAction() }
            }
        } else {
            List {
                if scope == .all || scope == .classes, !classes.isEmpty {
                    let byDay = Dictionary(grouping: classes.prefix(30), by: { $0.start.startOfAZDay })
                    ForEach(byDay.keys.sorted(), id: \.self) { d in
                        Section("Classes · \(d.cpFormat("EEE MMM d"))") {
                            ForEach(byDay[d] ?? []) { s in
                                NavigationLink(value: AppRoute.classSession(s.id)) {
                                    ClassRow(data: model.rowData(s), showClub: true, onAction: { ClassActions.primary(s, model: model, router: router) })
                                }
                            }
                        }
                    }
                }
                if scope == .all || scope == .clubs, !clubs.isEmpty {
                    Section("Clubs") { ForEach(clubs) { c in
                        NavigationLink(value: AppRoute.club(c.id)) { ClubCard(club: c, reading: model.busyness(c), now: model.now, variant: .listRow, isHome: c.id == model.member.homeClubID) } } }
                }
                if scope == .all || scope == .coaches, !coaches.isEmpty {
                    Section("Coaches") { ForEach(coaches) { c in NavigationLink(value: AppRoute.coach(c.id)) { CoachCard(coach: c) } } }
                }
                if scope == .all || scope == .help, !helps.isEmpty {
                    Section("Help") { ForEach(helps, id: \.0) { h in Link(destination: URL(string: "https://app.cactuspeak.example/help")!) { Label(h.0, systemImage: "questionmark.circle").frame(minHeight: 44) } } }
                }
            }
            .listStyle(.insetGrouped).scrollContentBackground(.hidden)
            .onChange(of: debounced) { _, _ in AccessibilityNotification.Announcement("\(classes.count + clubs.count + coaches.count) results").post() }
        }
    }
}
