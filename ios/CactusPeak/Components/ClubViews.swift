import SwiftUI

struct ClubCard: View {
    enum Variant { case listRow, compact, feature, mapCallout }
    var club: Club
    var reading: BusynessReading
    var now: Date
    var variant: Variant = .listRow
    var isHome = false
    var closest = false
    var selected = false
    @Environment(\.dynamicTypeSize) private var dts

    var body: some View {
        switch variant {
        case .listRow: listRow
        case .compact: compact
        case .feature: feature
        case .mapCallout: callout
        }
    }

    private var listRow: some View {
        let layout = dts.isAccessibilitySize ? AnyLayout(VStackLayout(alignment: .leading, spacing: 8)) : AnyLayout(HStackLayout(spacing: 12))
        return layout {
            ClubExteriorArt(slug: club.slug, variant: dts.isAccessibilitySize ? .wide : .thumb)
                .clipShape(RoundedRectangle(cornerRadius: 10, style: .continuous))
                .frame(width: dts.isAccessibilitySize ? nil : 96, height: 72)
                .frame(maxWidth: dts.isAccessibilitySize ? .infinity : 96)
            VStack(alignment: .leading, spacing: 3) {
                HStack(spacing: 6) {
                    if isHome { Image(systemName: "house.fill").imageScale(.small).foregroundStyle(Color.textMuted).accessibilityLabel("Home club") }
                    Text(club.fullName).font(.headline).fixedSize(horizontal: false, vertical: true)
                }
                OpenStatus(club: club, now: now)
                HStack(spacing: 8) {
                    if closest { Text("Closest").font(.caption.weight(.semibold)).fixedSize().padding(.horizontal, 6).padding(.vertical, 1)
                        .background(Color.primarySubtle, in: RoundedRectangle(cornerRadius: 4)).foregroundStyle(Color.linkText) }
                    Text(String(format: "%.1f mi", club.distanceMiles)).font(.footnote).foregroundStyle(Color.textMuted).monospacedDigit()
                    BusynessMeter(reading: reading, variant: .compact, now: now)
                }
            }
            if !dts.isAccessibilitySize {
                Spacer(minLength: 0)
                if selected { Image(systemName: "checkmark.circle.fill").foregroundStyle(Color.brandAccent).accessibilityHidden(true) }
            }
        }
        .frame(minHeight: 88)
        .contentShape(Rectangle())
        .accessibilityElement(children: .combine)
        .accessibilityAddTraits(selected ? .isSelected : [])
    }

    private var compact: some View {
        VStack(alignment: .leading, spacing: 0) {
            ClubExteriorArt(slug: club.slug).frame(height: 96)
            VStack(alignment: .leading, spacing: 4) {
                Text(club.fullName).font(.headline).lineLimit(2)
                OpenStatus(club: club, now: now)
                BusynessMeter(reading: reading, variant: .inline, now: now)
            }.padding(12)
        }
        .frame(width: 230)
        .background(Color.surface, in: RoundedRectangle(cornerRadius: 14, style: .continuous))
        .clipShape(RoundedRectangle(cornerRadius: 14, style: .continuous))
        .overlay(RoundedRectangle(cornerRadius: 14, style: .continuous).strokeBorder(Color.hairline, lineWidth: 1))
        .accessibilityElement(children: .combine)
    }

    private var feature: some View {
        VStack(alignment: .leading, spacing: 0) {
            ClubExteriorArt(slug: club.slug).frame(height: 180)
            VStack(alignment: .leading, spacing: 6) {
                Text(club.fullName).font(.archivoExtraBold(22, relativeTo: .title2))
                Text(club.personality).font(.subheadline).foregroundStyle(Color.textMuted)
                BusynessMeter(reading: reading, variant: .inline, now: now)
            }.padding(16)
        }
        .background(Color.surface, in: RoundedRectangle(cornerRadius: 14, style: .continuous))
        .clipShape(RoundedRectangle(cornerRadius: 14, style: .continuous))
        .overlay(RoundedRectangle(cornerRadius: 14, style: .continuous).strokeBorder(Color.hairline, lineWidth: 1))
        .accessibilityElement(children: .combine)
    }

    private var callout: some View {
        VStack(alignment: .leading, spacing: 0) {
            ClubExteriorArt(slug: club.slug).aspectRatio(2, contentMode: .fit)
            VStack(alignment: .leading, spacing: 4) {
                Text(club.fullName).font(.headline)
                OpenStatus(club: club, now: now)
                Text("Today \(club.opens(on: now) == 270 ? "4:30 a.m.–10 p.m." : "6 a.m.–8 p.m.")").font(.footnote).foregroundStyle(Color.textMuted)
                BusynessMeter(reading: reading, variant: .inline, now: now)
            }.padding(12)
        }
        .background(Color.surface, in: RoundedRectangle(cornerRadius: 14, style: .continuous))
        .clipShape(RoundedRectangle(cornerRadius: 14, style: .continuous))
    }
}

/// Map pin: club short name plus a compact rib meter. 44 pt target.
struct ClubPin: View {
    var club: Club
    var reading: BusynessReading
    var isSelected: Bool
    var isHome: Bool
    var body: some View {
        VStack(spacing: 0) {
            HStack(spacing: 6) {
                if isHome { Image(systemName: "house.fill").imageScale(.small) }
                Text(club.shortName).font(.caption.weight(.semibold)).lineLimit(1)
                if reading.closed { Text("Closed").font(.caption2) } else if isSelected {
                    RibMeter(value: reading.level, tone: isSelected ? .onNight : reading.tone, size: .sm, peak: false)
                }
            }
            .foregroundStyle(isSelected ? Color.nightOnSurface : (reading.closed ? Color.textMuted : Color.textPrimary))
            .padding(.horizontal, 10).frame(minHeight: 32)
            .background(isSelected ? Color.nightSurface : Color.surface, in: RoundedRectangle(cornerRadius: 10, style: .continuous))
            .overlay(RoundedRectangle(cornerRadius: 10, style: .continuous).strokeBorder(isSelected ? Color.brandAccent : Color.borderStrong, lineWidth: isSelected ? 2 : 1))
            Image(systemName: "arrowtriangle.down.fill").font(.caption2).foregroundStyle(isSelected ? Color.nightSurface : Color.borderStrong).offset(y: -2)
        }
        .frame(minWidth: 44, minHeight: 44)
        .accessibilityElement(children: .ignore)
        .accessibilityLabel("\(club.fullName), \(reading.closed ? "closed" : reading.word)")
    }
}

struct HoursTable: View {
    var club: Club
    var now: Date
    var body: some View {
        let days = (0..<7).map { now.startOfAZDay.addingDays($0) }
        ForEach(days, id: \.self) { d in
            let isToday = AZ.cal.isDate(d, inSameDayAs: now)
            let weekend = AZ.cal.isDateInWeekend(d)
            LabeledContent {
                Text(weekend ? "6:00 a.m.–8:00 p.m." : "4:30 a.m.–10:00 p.m.").monospacedDigit()
            } label: {
                HStack(spacing: 6) {
                    if isToday { Circle().fill(club.isOpen(at: now) ? Color.statusSuccess : Color.textMuted).frame(width: 8, height: 8).accessibilityHidden(true) }
                    Text(d.cpFormat("EEEE"))
                    if isToday { Text("Today").font(.caption.weight(.bold)).padding(.horizontal, 6).padding(.vertical, 1).background(Color.surfaceMuted, in: RoundedRectangle(cornerRadius: 4)) }
                }
            }
            .fontWeight(isToday ? .semibold : .regular)
            .accessibilityElement(children: .combine)
        }
    }
}
