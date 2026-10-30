import SwiftUI
import MapKit

struct ClubDetailView: View {
    @Environment(AppModel.self) private var model
    @Environment(AppRouter.self) private var router
    @Environment(\.openURL) private var openURL
    @Environment(\.dynamicTypeSize) private var dts
    let clubID: ClubID
    @State private var dayIdx = 0
    @State private var confirmHome = false

    var body: some View {
        let club = model.club(clubID)
        let reading = model.busyness(club)
        ScrollView {
            VStack(alignment: .leading, spacing: 24) {
                ClubHero(club: club, height: dts.isAccessibilitySize ? 180 : 260)
                VStack(alignment: .leading, spacing: 24) {
                    facts(club, reading)
                    liveNow(club, reading)
                    hours(club)
                    amenities(club)
                    todayClasses(club)
                    reserveRows(club)
                    coaches(club)
                    location(club)
                    homeClubRow(club)
                }
                .padding(.horizontal, 16)
            }
            .padding(.bottom, 24)
        }
        .screenBackground()
        .navigationBarTitleDisplayMode(.inline)
        .navigationTitle(club.fullName)
        .toolbar {
            ToolbarItem(placement: .topBarTrailing) {
                ShareLink(item: URL(string: "https://app.cactuspeak.example/clubs/\(club.slug)")!, subject: Text(club.fullName)) { Image(systemName: "square.and.arrow.up") }
            }
            ToolbarItem(placement: .topBarTrailing) {
                Button { model.toggleFavourite(club: club.id) } label: { Image(systemName: model.favouriteClubs.contains(club.id) ? "heart.fill" : "heart") }
                    .accessibilityLabel(model.favouriteClubs.contains(club.id) ? "Remove favourite" : "Favourite")
            }
        }
        .toolbarVisibility(.hidden, for: .tabBar)
        .safeAreaBar(edge: .bottom) {
            ViewThatFits(in: .horizontal) {
                HStack(spacing: 12) {
                Button("Directions") { openMaps(club) }.secondaryAction(full: true)
                Button("Book here") { router.viewingClubID = club.id; router.segment = .classes; router.selection = .book; router.paths[.book] = [] }.primaryAction(full: true)
            }
                VStack(spacing: 8) {
                Button("Directions") { openMaps(club) }.secondaryAction(full: true)
                Button("Book here") { router.viewingClubID = club.id; router.segment = .classes; router.selection = .book; router.paths[.book] = [] }.primaryAction(full: true)
            }
            }
            .padding(.horizontal, 16).padding(.vertical, 6)
        }
        .confirmationDialog("Set \(club.fullName) as your home club?", isPresented: $confirmHome, titleVisibility: .visible) {
            Button("Set as home club") { model.setHomeClub(club.id) }
            Button("Cancel", role: .cancel) {}
        } message: { if model.member.plan == .trailhead { Text("You can change your home club once per billing cycle.") } }
    }

    private func openMaps(_ c: Club) {
        if let u = URL(string: "http://maps.apple.com/?daddr=\(c.latitude),\(c.longitude)&q=\(c.fullName.addingPercentEncoding(withAllowedCharacters: .urlQueryAllowed) ?? "")") { openURL(u) }
    }

    private func facts(_ c: Club, _ r: BusynessReading) -> some View {
        FlowLayout(spacing: 14) {
            OpenStatus(club: c, now: model.now)
            Label(String(format: "%.1f mi", c.distanceMiles), systemImage: "location").font(.footnote.weight(.medium)).foregroundStyle(Color.textMuted)
            Label("Desk staffed 6 a.m. to 8 p.m.", systemImage: "person.fill.checkmark").font(.footnote.weight(.medium)).foregroundStyle(Color.textMuted)
            BusynessMeter(reading: r, variant: .inline, now: model.now)
        }
    }

    private func liveNow(_ c: Club, _ r: BusynessReading) -> some View {
        let day = model.now.startOfAZDay.addingDays(dayIdx)
        return VStack(alignment: .leading, spacing: 12) {
            Text("Live now").sectionHeader()
            VStack(alignment: .leading, spacing: 12) {
                BusynessMeter(reading: r, variant: .card, now: model.now)
                if r.closed == false && !r.stale && r.level != r.usual {
                    Text(r.level > r.usual ? "Busier than usual for this hour." : "Quieter than usual for this hour.").font(.footnote).foregroundStyle(Color.textMuted)
                }
                if dts.isAccessibilitySize {
                    Picker("Day", selection: $dayIdx) { ForEach(0..<7, id: \.self) { Text(model.now.startOfAZDay.addingDays($0).cpFormat("EEEE")).tag($0) } }.pickerStyle(.menu)
                } else {
                    Picker("Day", selection: $dayIdx) {
                        ForEach(0..<7, id: \.self) { i in Text(model.now.startOfAZDay.addingDays(i).cpFormat("EEE")).tag(i).accessibilityLabel(model.now.startOfAZDay.addingDays(i).cpFormat("EEEE")) }
                    }.pickerStyle(.segmented)
                }
                PopularTimesChart(values: model.popular(c, day: day), nowHour: dayIdx == 0 ? AZ.cal.component(.hour, from: model.now) : nil, compact: false)
                Text(model.popularCaption(c)).font(.caption).foregroundStyle(Color.textMuted)
            }.cardStyle()
        }
    }

    private func hours(_ c: Club) -> some View {
        VStack(alignment: .leading, spacing: 8) {
            Text("Hours").sectionHeader()
            Button { router.present(.hours(c.id)) } label: {
                HStack {
                    VStack(alignment: .leading, spacing: 2) {
                        Text(c.isOpen(at: model.now) ? "Open until \(c.openUntilText(on: model.now))" : "Closed · opens \(c.opensText(model.now))").font(.headline)
                        Text("Mon–Fri 4:30 a.m.–10 p.m. · Sat–Sun 6 a.m.–8 p.m.").font(.footnote).foregroundStyle(Color.textMuted)
                    }
                    Spacer(); Text("All hours").font(.subheadline.weight(.semibold)).foregroundStyle(Color.linkText); Image(systemName: "chevron.right").font(.footnote).foregroundStyle(Color.textMuted)
                }
                .foregroundStyle(Color.textPrimary).contentShape(Rectangle())
            }.buttonStyle(.plain).cardStyle(padding: 14)
        }
    }

    private func amenities(_ c: Club) -> some View {
        VStack(alignment: .leading, spacing: 10) {
            Text("Spaces and amenities").sectionHeader()
            let spaces = c.spaces
            ForEach(spaces.primary) { s in
                HStack(alignment: .top, spacing: 12) {
                    SpaceGraphic(id: s.graphic)
                        .frame(width: 72, height: 72)
                        .clipShape(RoundedRectangle(cornerRadius: 10, style: .continuous))
                    VStack(alignment: .leading, spacing: 2) {
                        Text(s.name).font(.headline)
                        Text(s.line).font(.subheadline).foregroundStyle(Color.textMuted).fixedSize(horizontal: false, vertical: true)
                        Text(s.amenities.joined(separator: " · ")).font(.footnote).foregroundStyle(Color.textMuted).fixedSize(horizontal: false, vertical: true)
                    }
                }
                .accessibilityElement(children: .combine)
            }
            if !spaces.amenities.isEmpty {
                FlowLayout(spacing: 12) {
                    ForEach(spaces.amenities) { a in
                        HStack(spacing: 8) {
                            SpaceGraphic(id: a.graphic).frame(width: 32, height: 32).clipShape(RoundedRectangle(cornerRadius: 6, style: .continuous))
                            Text(a.name).font(.subheadline)
                        }
                        .accessibilityElement(children: .combine)
                    }
                }
            }
            if !c.hasPool { Text("No pool.").font(.footnote).foregroundStyle(Color.textMuted) }
        }
    }

    @ViewBuilder private func todayClasses(_ c: Club) -> some View {
        let list = model.sessions(club: c.id, day: model.now).filter { $0.start > model.now }.prefix(6)
        VStack(alignment: .leading, spacing: 8) {
            Text("Today at this club").sectionHeader()
            if list.isEmpty { Text("No more classes today.").font(.subheadline).foregroundStyle(Color.textMuted) }
            else {
                ScrollView(.horizontal) {
                    HStack(spacing: 12) { ForEach(Array(list)) { s in NavigationLink(value: AppRoute.classSession(s.id)) { ClassCompactCard(data: model.rowData(s)) }.buttonStyle(.plain) } }
                        .padding(.horizontal, 16)
                }.scrollIndicators(.hidden).padding(.horizontal, -16)
            }
            Button("See full schedule") { router.viewingClubID = c.id; router.segment = .classes; router.day = model.now.startOfAZDay; router.selection = .book; router.paths[.book] = [] }.linkAction()
        }
    }

    @ViewBuilder private func reserveRows(_ c: Club) -> some View {
        let rows: [(String, String, String, ReserveKind)] = [
            c.hasCourts ? ("Courts", c.courtSports.map { "\($0.title) · \(c.courts(for: $0))" }.joined(separator: ", "), "figure.pickleball", .court) : nil,
            c.hasPool ? ("Lap lanes", "\(c.lanes) lanes", "figure.pool.swim", .lane) : nil,
            c.hasKids ? ("Kids club", "Ages 6 months to 12 years", "face.smiling", .kidsClub) : nil,
        ].compactMap { $0 }
        if !rows.isEmpty {
            VStack(alignment: .leading, spacing: 8) {
                Text("Reserve").sectionHeader()
                VStack(spacing: 0) {
                    ForEach(Array(rows.enumerated()), id: \.offset) { i, r in
                        Button { router.push(.reserve(r.3, c.id)) } label: {
                            HStack(spacing: 12) {
                                Image(systemName: r.2).frame(width: 28).foregroundStyle(Color.textPrimary).accessibilityHidden(true)
                                VStack(alignment: .leading) { Text(r.0).font(.headline); Text(r.1).font(.footnote).foregroundStyle(Color.textMuted) }
                                Spacer(); Image(systemName: "chevron.right").font(.footnote.weight(.semibold)).foregroundStyle(Color.textMuted)
                            }.frame(minHeight: 56).foregroundStyle(Color.textPrimary).contentShape(Rectangle())
                        }.buttonStyle(.plain)
                        if i < rows.count - 1 { Divider() }
                    }
                }
                .padding(.horizontal, 16).background(Color.surface, in: RoundedRectangle(cornerRadius: 14, style: .continuous))
                .overlay(RoundedRectangle(cornerRadius: 14, style: .continuous).strokeBorder(Color.hairline, lineWidth: 1))
            }
        } else {
            Text("\(c.area) has no pool, courts or kids club.").font(.footnote).foregroundStyle(Color.textMuted)
        }
    }

    private func coaches(_ c: Club) -> some View {
        let list = model.coaches.filter { $0.clubs.contains(c.id) }
        return VStack(alignment: .leading, spacing: 8) {
            HStack { Text("Coaches").sectionHeader(); Spacer(); Button("See all") { router.push(.coachList(c.id)) }.linkAction().font(.subheadline) }
            ScrollView(.horizontal) {
                HStack(spacing: 12) { ForEach(list.prefix(6)) { co in NavigationLink(value: AppRoute.coach(co.id)) { CoachCard(coach: co, variant: .card) }.buttonStyle(.plain) } }.padding(.horizontal, 16)
            }.scrollIndicators(.hidden).padding(.horizontal, -16)
        }
    }

    private func location(_ c: Club) -> some View {
        VStack(alignment: .leading, spacing: 10) {
            Text("Location").sectionHeader()
            Map(initialPosition: .region(MKCoordinateRegion(center: c.coordinate, span: .init(latitudeDelta: 0.02, longitudeDelta: 0.02))), interactionModes: []) {
                Marker(c.shortName, coordinate: c.coordinate).tint(Color.brandAccent)
            }
            .frame(height: 180).clipShape(RoundedRectangle(cornerRadius: 14, style: .continuous))
            .accessibilityLabel("Map showing \(c.fullName)")
            Text(c.address).font(.subheadline)
            Button { openMaps(c) } label: { Label("Directions", systemImage: "arrow.triangle.turn.up.right.diamond") }.secondaryAction()
            Button { openURL(URL(string: "tel:\(c.phone.filter(\.isNumber))")!) } label: { Label(c.phone, systemImage: "phone") }.linkAction()
        }
    }

    private func homeClubRow(_ c: Club) -> some View {
        VStack(alignment: .leading, spacing: 6) {
            Button {
                if c.id != model.member.homeClubID { if model.canChangeHomeClub { confirmHome = true } else { model.showToast("Changed this cycle. Next change after \(model.nextBillDate.cpDayMonth).") } }
            } label: {
                HStack { Label("Set as home club", systemImage: c.id == model.member.homeClubID ? "checkmark.circle.fill" : "house"); Spacer() }.frame(minHeight: 48).contentShape(Rectangle())
            }.buttonStyle(.plain).disabled(model.isTeen)
            if model.member.plan == .trailhead { Text("You can change your home club once per billing cycle.").font(.footnote).foregroundStyle(Color.textMuted) }
        }
    }
}

struct ClubClassesView: View {
    let clubID: ClubID
    var body: some View { ClubDetailView(clubID: clubID) }
}

struct ReserveRouteView: View {
    @Environment(AppRouter.self) private var router
    let kind: ReserveKind
    let clubID: ClubID?
    var body: some View {
        BookView()
            .onAppear {
                router.segment = kind.segment
                if let clubID { router.reserveClub[kind] = clubID }
            }
    }
}

// MARK: - Coaches

struct CoachListView: View {
    @Environment(AppModel.self) private var model
    let clubID: ClubID?
    var body: some View {
        let list = model.coaches.filter { clubID == nil || $0.clubs.contains(clubID!) }
        List(list) { c in
            NavigationLink(value: AppRoute.coach(c.id)) { CoachCard(coach: c) }
        }
        .listStyle(.insetGrouped).scrollContentBackground(.hidden).background(Color.appBackground)
        .navigationTitle(clubID.map { model.club($0).shortName + " coaches" } ?? "Coaches").navigationBarTitleDisplayMode(.inline)
    }
}

struct CoachProfileView: View {
    @Environment(AppModel.self) private var model
    @Environment(AppRouter.self) private var router
    @Environment(\.dynamicTypeSize) private var dts
    let coachID: CoachID
    var body: some View {
        let c = model.coach(coachID)
        let classes = model.sessions.filter { $0.coachID == c.id && $0.start > model.now && $0.start < model.now.addingDays(7) && model.visible($0) }.prefix(5)
        ScrollView {
            VStack(alignment: .leading, spacing: 20) {
                VStack(alignment: .leading, spacing: 12) {
                    CoachImage(name: c.fullName, category: c.category, size: 120)
                    Text(c.fullName).font(.archivoExtraBold(26, relativeTo: .title2)).accessibilityAddTraits(.isHeader)
                    Text(c.credential).font(.subheadline).foregroundStyle(Color.textMuted)
                    Text(c.clubs.map { model.club($0).fullName }.joined(separator: " · ")).font(.subheadline)
                }
                FlowLayout(spacing: 8) { ForEach(c.specialties, id: \.self) { AmenityChip(label: $0, symbol: nil) } }
                Text(c.bio).font(.body)
                VStack(alignment: .leading, spacing: 8) {
                    Text("This week").sectionHeader()
                    if classes.isEmpty { Text("\(c.shortName.replacingOccurrences(of: ".", with: "")) has no classes this week.").foregroundStyle(Color.textMuted) }
                    VStack(spacing: 0) {
                        ForEach(Array(classes)) { s in
                            NavigationLink(value: AppRoute.classSession(s.id)) {
                                HStack { Text("\(s.start.cpWeekdayShort) \(s.start.cpTimeShort)").font(.archivoSemiBold(15, relativeTo: .subheadline)).monospacedDigit().lineLimit(1).fixedSize().frame(minWidth: 84, alignment: .leading)
                                    Text(s.name).font(.subheadline); Spacer()
                                    Text(model.spotsLeft(s) == 0 ? "Full" : "\(model.spotsLeft(s)) left").font(.footnote).foregroundStyle(Color.textMuted)
                                    Image(systemName: "chevron.right").font(.footnote).foregroundStyle(Color.textMuted) }
                                .frame(minHeight: 48).contentShape(Rectangle()).foregroundStyle(Color.textPrimary)
                            }.buttonStyle(.plain)
                            Divider()
                        }
                    }
                }
                if c.trains {
                    VStack(alignment: .leading, spacing: 6) {
                        Text("Personal training").sectionHeader()
                        Text("$75 single session").font(.headline)
                        Text("Packs: 4 for $276 · 8 for $520 · 12 for $732").font(.subheadline).monospacedDigit()
                        Text("Sessions are 45 min (Summit intro 30 min). Free cancel or reschedule up to 24 hours before. Packs last 12 months and pause during a freeze.").font(.footnote).foregroundStyle(Color.textMuted)
                        if model.member.plan == .summit { Text("Your plan includes 1 intro session a quarter.").font(.footnote.weight(.semibold)) }
                    }.cardStyle()
                }
            }
            .padding(16)
        }
        .screenBackground()
        .navigationBarTitleDisplayMode(.inline).navigationTitle(c.fullName)
        .toolbar { ToolbarItem(placement: .topBarTrailing) { ShareLink(item: URL(string: "https://app.cactuspeak.example/coaches/\(c.id)")!) { Image(systemName: "square.and.arrow.up") } } }
        .toolbarVisibility(.hidden, for: .tabBar)
        .safeAreaBar(edge: .bottom) {
            if c.trains {
                Button(model.isTeen ? "Ask \(model.member.ownerFirst) to approve" : (model.member.plan == .summit ? "Book intro session" : "Book a session")) { router.present(.ptPicker(c.id)) }
                    .primaryAction(full: true).padding(.horizontal, 16).padding(.vertical, 6)
            }
        }
    }
}
