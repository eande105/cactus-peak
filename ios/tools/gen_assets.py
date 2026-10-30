#!/usr/bin/env python3
"""Generates Shared/Colors.xcassets (light, dark, increased-contrast variants), the AppIcon set
and the logo image sets. Run from the ios/ folder: python3 tools/gen_assets.py"""
import json, os, shutil
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BRAND = os.path.join(ROOT, "..", "..", "cactus-peak-brand", "identity")

def comp(h):
    h = h.lstrip("#")
    return {"red": "0x" + h[0:2].upper(), "green": "0x" + h[2:4].upper(), "blue": "0x" + h[4:6].upper(), "alpha": "1.000"}

def colorset(base, name, light, dark, lightic=None, darkic=None):
    lightic = lightic or light
    darkic = darkic or dark
    d = os.path.join(base, name + ".colorset")
    os.makedirs(d, exist_ok=True)
    def entry(h, appearances=None):
        e = {"idiom": "universal", "color": {"color-space": "srgb", "components": comp(h)}}
        if appearances:
            e["appearances"] = appearances
        return e
    lum = {"appearance": "luminosity", "value": "dark"}
    con = {"appearance": "contrast", "value": "high"}
    j = {"colors": [entry(light), entry(dark, [lum]), entry(lightic, [con]), entry(darkic, [lum, con])],
         "info": {"author": "xcode", "version": 1}}
    json.dump(j, open(os.path.join(d, "Contents.json"), "w"), indent=2)

def catalog(path):
    os.makedirs(path, exist_ok=True)
    json.dump({"info": {"author": "xcode", "version": 1}}, open(os.path.join(path, "Contents.json"), "w"))

# name: (light, dark, lightIC, darkIC)
COLORS = {
 "BrandAccent": ("#B5532C", "#E0804F", "#9E4522", "#EE9A6E"),
 "BrandOnAccent": ("#FFFFFF", "#121A16", "#FFFFFF", "#121A16"),
 "Link": ("#9E4522", "#EE9A6E", "#7A3418", "#F5B08D"),
 "Background": ("#F6F1E8", "#121A16", "#FFFFFF", "#0C120F"),
 "Surface": ("#FFFFFF", "#1A241F", "#FFFFFF", "#1A241F"),
 "SurfaceMuted": ("#EFE7DA", "#24302A", "#E6DCCB", "#2C3A33"),
 "PrimarySubtle": ("#F6DFD3", "#3A2418", "#F0CDBB", "#4A2E20"),
 "TextPrimary": ("#1D1B17", "#F2ECE2", "#000000", "#FFFFFF"),
 "TextMuted": ("#6B6457", "#A69F92", "#4A443A", "#CFC8BB"),
 "Border": ("#DDD2C1", "#34423A", "#8C7F6B", "#6E7F74"),
 "BorderStrong": ("#8C7F6B", "#6E7F74", "#4A443A", "#CFC8BB"),
 "BorderHover": ("#4A443A", "#CFC8BB", "#4A443A", "#CFC8BB"),
 "BrandSecondary": ("#1C3328", "#F2ECE2", "#1C3328", "#FFFFFF"),
 "NightSurface": ("#1C3328", "#1C3328", "#1C3328", "#1C3328"),
 "NightOnSurface": ("#F6F1E8", "#F6F1E8", "#F6F1E8", "#F6F1E8"),
 "DawnCopper": ("#E0804F", "#E0804F", "#E0804F", "#E0804F"),
 "StatusSuccess": ("#2A7047", "#6FCB94", "#1F5535", "#9BE0B6"),
 "StatusWarning": ("#8A5300", "#F2B14C", "#683E00", "#F5C479"),
 "StatusDanger": ("#B42318", "#F28B7C", "#8F1C13", "#F5A396"),
 "StatusSuccessSubtle": ("#E3F0E6", "#1D3527", None, None),
 "StatusWarningSubtle": ("#FBEBCB", "#3A2E14", None, None),
 "StatusDangerSubtle": ("#FBE4E1", "#3D1F1B", None, None),
 "Focus": ("#2E6DB4", "#7FB0E8", "#1F4F8A", "#A9CCF2"),
}
# prefix: (light fill, light text, dark, light IC, dark IC)
CATS = {
 "Strength": ("#B5532C", "#9E4522", "#E0804F", "#883E21", "#E8A07B"),
 "Cycle": ("#2F5A45", "#2F5A45", "#6FB08F", "#234434", "#93C4AB"),
 "Conditioning": ("#8A5300", "#8A5300", "#F2B14C", "#683E00", "#F5C479"),
 "MindBody": ("#52684A", "#52684A", "#A9C29A", "#3E4E38", "#BED1B3"),
 "Aqua": ("#1F6E7A", "#1F6E7A", "#6FC3CF", "#17525C", "#93D2DB"),
 "Court": ("#7F6019", "#7F6019", "#E0C27A", "#5F4813", "#E8D19B"),
 "Recovery": ("#5F4E86", "#5F4E86", "#B6A6E0", "#473A64", "#C8BCE8"),
 "Youth": ("#9C3D6B", "#9C3D6B", "#E59BC0", "#752E50", "#ECB4D0"),
}

cols = os.path.join(ROOT, "Shared", "Colors.xcassets")
shutil.rmtree(cols, ignore_errors=True)
catalog(cols)
for n, (l, d, lic, dic) in COLORS.items():
    colorset(cols, n, l, d, lic, dic)
for n, (lf, lt, d, lic, dic) in CATS.items():
    colorset(cols, "Category" + n, lf, d, lic, dic)
    colorset(cols, "Category" + n + "Text", lt, d, lic if lt == lf else lt, dic)

# App catalog: AccentColor + AppIcon
app = os.path.join(ROOT, "CactusPeak", "Resources", "Assets.xcassets")
shutil.rmtree(app, ignore_errors=True)
catalog(app)
l, d, lic, dic = COLORS["BrandAccent"]
colorset(app, "AccentColor", l, d, lic, dic)
colorset(app, "LaunchBackground", *COLORS["Background"])
icon = os.path.join(app, "AppIcon.appiconset")
os.makedirs(icon)
shutil.copy(os.path.join(BRAND, "export", "symbol", "cpa-symbol-app-icon-1024.png"), os.path.join(icon, "icon-1024.png"))
json.dump({"images": [{"filename": "icon-1024.png", "idiom": "universal", "platform": "ios", "size": "1024x1024"}],
           "info": {"author": "xcode", "version": 1}}, open(os.path.join(icon, "Contents.json"), "w"), indent=2)

# Logo SVG image sets (template-free, vector)
for key, src in {"LogoHorizontalReversed": "cpa-horizontal-reversed.svg", "LogoHorizontalColor": "cpa-horizontal-color.svg"}.items():
    d = os.path.join(app, key + ".imageset")
    os.makedirs(d)
    shutil.copy(os.path.join(BRAND, "final", src), os.path.join(d, src))
    json.dump({"images": [{"filename": src, "idiom": "universal"}], "info": {"author": "xcode", "version": 1},
               "properties": {"preserves-vector-representation": True}}, open(os.path.join(d, "Contents.json"), "w"), indent=2)
print("assets ok")
