import SwiftUI

// MARK: - Colour tokens (asset catalog names follow the shared token roles)

extension Color {
    static let appBackground = Color("Background")
    static let surface = Color("Surface")
    static let surfaceMuted = Color("SurfaceMuted")
    static let brandAccent = Color("BrandAccent")
    static let brandOnAccent = Color("BrandOnAccent")
    static let linkText = Color("Link")
    static let primarySubtle = Color("PrimarySubtle")
    static let textPrimary = Color("TextPrimary")
    static let textMuted = Color("TextMuted")
    static let hairline = Color("Border")
    static let borderStrong = Color("BorderStrong")
    static let brandSecondary = Color("BrandSecondary")
    static let nightSurface = Color("NightSurface")
    static let nightOnSurface = Color("NightOnSurface")
    static let dawnCopper = Color("DawnCopper")
    static let statusSuccess = Color("StatusSuccess")
    static let statusWarning = Color("StatusWarning")
    static let statusDanger = Color("StatusDanger")
    static let statusSuccessSubtle = Color("StatusSuccessSubtle")
    static let statusWarningSubtle = Color("StatusWarningSubtle")
    static let statusDangerSubtle = Color("StatusDangerSubtle")
    static let focusRing = Color("Focus")

    init(hex: UInt32) {
        self.init(.sRGB,
                  red: Double((hex >> 16) & 0xFF) / 255,
                  green: Double((hex >> 8) & 0xFF) / 255,
                  blue: Double(hex & 0xFF) / 255,
                  opacity: 1)
    }
}

// MARK: - Class categories

enum ClassCategory: String, CaseIterable, Codable, Identifiable, Sendable, Hashable {
    case strength, cycle, conditioning, mindBody, aqua, court, recovery, youth

    var id: String { rawValue }

    var title: String {
        switch self {
        case .strength: "Strength"
        case .cycle: "Cycle"
        case .conditioning: "Conditioning"
        case .mindBody: "Mind & Body"
        case .aqua: "Aqua"
        case .court: "Court"
        case .recovery: "Recovery"
        case .youth: "Youth"
        }
    }

    /// SF Symbols stand in for the custom symbols (`cp.rib.barbell`, `cp.conditioning`, `cp.court`) which need
    /// an export from the SF Symbols app. The brand bans dumbbells, flames and bolts, so Strength uses a
    /// weight-plate glyph (`circle.grid.cross`-style) instead of `dumbbell`.
    var symbol: String {
        switch self {
        case .strength: "figure.strengthtraining.traditional"
        case .cycle: "bicycle"
        case .conditioning: "timer"
        case .mindBody: "figure.mind.and.body"
        case .aqua: "figure.pool.swim"
        case .court: "figure.pickleball"
        case .recovery: "heart.text.square"
        case .youth: "face.smiling"
        }
    }

    private var assetKey: String {
        switch self {
        case .mindBody: "MindBody"
        default: rawValue.prefix(1).uppercased() + rawValue.dropFirst()
        }
    }
    /// Fill colour: stripes, icons, tints.
    var color: Color { Color("Category" + assetKey) }
    /// Text colour for category-coloured words on Surface/Background.
    var textColor: Color { Color("Category" + assetKey + "Text") }
}

// MARK: - Rib Peak symbol (brand logo, drawn from the master path)

struct RibPeakShape: Shape {
    func path(in rect: CGRect) -> Path {
        let s = min(rect.width, rect.height) / 256
        let ox = rect.minX + (rect.width - 256 * s) / 2
        let oy = rect.minY + (rect.height - 256 * s) / 2
        func p(_ x: Double, _ y: Double) -> CGPoint { CGPoint(x: ox + x * s, y: oy + y * s) }
        var path = Path()
        let polys: [[(Double, Double)]] = [
            [(12.53, 230), (12.53, 222), (40, 174.42), (40, 230)],
            [(58.5, 230), (58.5, 142.38), (86.5, 93.88), (86.5, 230)],
            [(105, 230), (105, 61.84), (128, 22), (151, 61.84), (151, 230)],
            [(169.5, 230), (169.5, 93.88), (197.5, 142.38), (197.5, 230)],
            [(216, 230), (216, 174.42), (243.47, 222), (243.47, 230)],
        ]
        for poly in polys {
            path.move(to: p(poly[0].0, poly[0].1))
            for pt in poly.dropFirst() { path.addLine(to: p(pt.0, pt.1)) }
            path.closeSubpath()
        }
        return path
    }
}

// MARK: - Archivo (variable font, named instances)
// Archivo-VF.ttf is registered through UIAppFonts. Its named instances resolve by PostScript name.
// Only used for big numerals, eyebrows and display titles inside content. Body text stays SF Pro.

extension Font {
    static func archivoExtraBold(_ size: CGFloat, relativeTo style: Font.TextStyle) -> Font {
        .custom("ArchivoRoman-ExtraBold", size: size, relativeTo: style)
    }
    static func archivoBold(_ size: CGFloat, relativeTo style: Font.TextStyle) -> Font {
        .custom("ArchivoRoman-Bold", size: size, relativeTo: style)
    }
    static func archivoSemiBold(_ size: CGFloat, relativeTo style: Font.TextStyle) -> Font {
        .custom("Archivo-SemiBold", size: size, relativeTo: style)
    }
    static var eyebrow: Font { .archivoSemiBold(12, relativeTo: .caption) }
}

extension View {
    /// Uppercase tracked label (echoes ATHLETIC in the wordmark). Pass the string already in capitals.
    func eyebrowStyle(_ color: Color = .textMuted) -> some View {
        self.font(.eyebrow).tracking(2.4).foregroundStyle(color)
    }
}

// MARK: - Rib meter (the five-rib system)

enum RibSize: Sendable {
    case sm, md, lg, xl
    var rib: CGFloat { switch self { case .sm: 4; case .md: 6; case .lg: 8; case .xl: 12 } }
    var gap: CGFloat { switch self { case .sm: 2; case .md: 3; case .lg: 4; case .xl: 6 } }
    var height: CGFloat { switch self { case .sm: 16; case .md: 24; case .lg: 32; case .xl: 48 } }
}

enum RibTone: Sendable, Hashable {
    case neutral, success, warning, danger, brand, accent
    case category(ClassCategory)
    case onNight

    var color: Color {
        switch self {
        case .neutral: .textPrimary
        case .success: .statusSuccess
        case .warning: .statusWarning
        case .danger: .statusDanger
        case .brand: .brandSecondary
        case .accent: .brandAccent
        case .category(let c): c.color
        case .onNight: .nightOnSurface
        }
    }
}

struct RibMeter: View {
    var value: Int
    var tone: RibTone = .neutral
    var size: RibSize = .md
    var peak: Bool = true
    var unavailable: Bool = false
    /// Widgets in tinted mode read opacity, not colour.
    var emptyOpacity: Double? = nil

    @ScaledMetric(relativeTo: .caption) private var scale: CGFloat = 1

    private let profile: [CGFloat] = [0.6, 0.8, 1.0, 0.8, 0.6]

    var body: some View {
        let k = min(scale, 1.5)
        let h = size.height * k
        HStack(alignment: .bottom, spacing: size.gap * k) {
            ForEach(0..<5, id: \.self) { i in
                let rh = (peak && size != .sm) ? h * profile[i] : h * 0.85
                let r = min(size.rib * k / 2, 4)
                if unavailable {
                    RoundedRectangle(cornerRadius: r)
                        .strokeBorder(Color.borderStrong, style: StrokeStyle(lineWidth: 1.5, dash: [2, 2]))
                        .frame(width: size.rib * k, height: rh)
                } else if i < value {
                    RoundedRectangle(cornerRadius: r).fill(tone.color)
                        .frame(width: size.rib * k, height: rh)
                } else if let eo = emptyOpacity {
                    RoundedRectangle(cornerRadius: r).fill(tone.color.opacity(eo))
                        .frame(width: size.rib * k, height: rh)
                } else {
                    RoundedRectangle(cornerRadius: r)
                        .strokeBorder(Color.borderStrong, lineWidth: 1.5)
                        .frame(width: size.rib * k, height: rh)
                }
            }
        }
        .frame(height: h, alignment: .bottom)
        .accessibilityElement(children: .ignore)
        .accessibilityLabel(unavailable ? "Unavailable" : "\(value) of 5")
    }
}

// MARK: - Arizona time (no daylight saving)

enum AZ {
    static let tz = TimeZone(identifier: "America/Phoenix")!
    static let cal: Calendar = {
        var c = Calendar(identifier: .gregorian)
        c.timeZone = tz
        c.firstWeekday = 2
        return c
    }()

    static func date(_ y: Int, _ m: Int, _ d: Int, _ h: Int = 0, _ min: Int = 0) -> Date {
        cal.date(from: DateComponents(timeZone: tz, year: y, month: m, day: d, hour: h, minute: min))!
    }
}

extension Date {
    /// "6:00 a.m."
    var cpTime: String {
        let c = AZ.cal.dateComponents([.hour, .minute], from: self)
        let h = c.hour ?? 0, m = c.minute ?? 0
        let h12 = h % 12 == 0 ? 12 : h % 12
        return String(format: "%d:%02d %@", h12, m, h < 12 ? "a.m." : "p.m.")
    }
    /// "6 a.m." when on the hour, otherwise "6:15 a.m."
    var cpTimeShort: String {
        let c = AZ.cal.dateComponents([.hour, .minute], from: self)
        if (c.minute ?? 0) == 0 {
            let h = c.hour ?? 0
            let h12 = h % 12 == 0 ? 12 : h % 12
            return "\(h12) \(h < 12 ? "a.m." : "p.m.")"
        }
        return cpTime
    }
    /// "6:00" and "a.m." split, for big-numeral layouts
    var cpClock: (String, String) {
        let c = AZ.cal.dateComponents([.hour, .minute], from: self)
        let h = c.hour ?? 0
        let h12 = h % 12 == 0 ? 12 : h % 12
        return (String(format: "%d:%02d", h12, c.minute ?? 0), h < 12 ? "a.m." : "p.m.")
    }
    func cpFormat(_ f: String) -> String { CPFormatters.string(self, f) }
    var cpWeekdayShort: String { cpFormat("EEE") }
    var cpDayMonth: String { cpFormat("MMM d") }
    var cpLongDay: String { cpFormat("EEEE, MMM d") }
    var cpDayKey: String {
        let c = AZ.cal.dateComponents([.year, .month, .day], from: self)
        return String(format: "%04d%02d%02d", c.year ?? 0, c.month ?? 0, c.day ?? 0)
    }
    var startOfAZDay: Date { AZ.cal.startOfDay(for: self) }
    func addingDays(_ n: Int) -> Date { AZ.cal.date(byAdding: .day, value: n, to: self)! }
}

/// DateFormatter creation is slow. Formatters are cached by pattern.
enum CPFormatters {
    nonisolated(unsafe) private static var cache: [String: DateFormatter] = [:]
    private static let lock = NSLock()
    static func string(_ d: Date, _ f: String) -> String {
        lock.lock(); defer { lock.unlock() }
        if let df = cache[f] { return df.string(from: d) }
        let df = DateFormatter()
        df.calendar = AZ.cal
        df.timeZone = AZ.tz
        df.locale = Locale(identifier: "en_US_POSIX")
        df.dateFormat = f
        cache[f] = df
        return df.string(from: d)
    }
}

extension String {
    /// Times such as "6:00 a.m." already end with a period. Use this when a sentence ends with one.
    var endingSentence: String { hasSuffix(".") || hasSuffix("?") || hasSuffix("!") ? self : self + "." }
}
