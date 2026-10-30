#!/usr/bin/env python3
"""Build Shared/BrandGraphics.xcassets from the exported brand SVGs.

    python3 tools/import-brand-graphics.py      (from ios/)

Source: ../brand-graphics/svg/<set>/<id>-<variant>-<light|dark>.svg, written by
`node scripts/export-graphics.mjs` in the marketing site (the source of truth).
Each pair becomes one image set with an "Any" (light) and a "Dark" appearance and
"Preserve Vector Data" on. Image set names are "<set>-<id>[-<variant>]", for example
"class-cycle-16x9" or "coach-marisol-vega". The script deletes and rewrites the catalog,
so do not edit it by hand. Run `xcodegen generate` only if the catalog is new.
"""
import json
import re
import shutil
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT.parent / "brand-graphics" / "svg"
DST = ROOT / "Shared" / "BrandGraphics.xcassets"

# Only the variants the app shows. Use tile and thumb below 120 pt (brand-graphics/README.md).
SETS = {
    # Gym objects (Nucleo core glyphs, brand colours) and class category tiles: the brand language.
    "objects": [None],
    "category": [None],
    # Retiring sets (VISUAL-IDENTITY.md, section 2), kept until the screens stop using them.
    "space": ["1x1", "tile"],
    "class": ["16x9", "1x1"],
    "coach": [None],
    "art": ["16x9", "4x5", "thumb"],
}
INFO = {"author": "xcode", "version": 1}


def write_json(path: Path, data: dict) -> None:
    path.write_text(json.dumps(data, indent=2) + "\n")


# The export writes some titles with a bare "&" ("Mind & Body"), which is not valid XML,
# and actool then fails with "zero width/height canvas". Escape it in the copy.
BARE_AMP = re.compile(r"&(?!(?:[a-zA-Z]+|#\d+|#x[0-9a-fA-F]+);)")


def copy_svg(src: Path, dst: Path) -> None:
    dst.write_text(BARE_AMP.sub("&amp;", src.read_text()))


def main() -> None:
    if DST.exists():
        shutil.rmtree(DST)
    DST.mkdir(parents=True)
    write_json(DST / "Contents.json", {"info": INFO})
    count = 0
    for folder, variants in SETS.items():
        group = DST / folder
        group.mkdir()
        write_json(group / "Contents.json", {"info": INFO})
        for light in sorted((SRC / folder).glob("*-light.svg")):
            stem = light.name[: -len("-light.svg")]
            variant = next((v for v in variants if v and stem.endswith(f"-{v}")), None)
            if variants != [None] and variant is None:
                continue
            dark = light.with_name(f"{stem}-dark.svg")
            name = f"{folder}-{stem}"
            imageset = group / f"{name}.imageset"
            imageset.mkdir()
            copy_svg(light, imageset / light.name)
            copy_svg(dark, imageset / dark.name)
            write_json(imageset / "Contents.json", {
                "images": [
                    {"filename": light.name, "idiom": "universal"},
                    {"appearances": [{"appearance": "luminosity", "value": "dark"}], "filename": dark.name, "idiom": "universal"},
                ],
                "info": INFO,
                "properties": {"preserves-vector-representation": True},
            })
            count += 1
    print(f"wrote {count} image sets to {DST.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
