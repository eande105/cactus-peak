// theme.ts and theme-model.ts are plain data and functions. The components/graphical index re-exports client components,
// and a server module that imports it would add the whole component library to every page's first load.

import type { ThemeDocument } from "@/components/graphical/lib/theme-model"
import { theme } from "@/components/graphical/theme"
import { archivo, inter } from "@/lib/fonts"

// The captured Graphical document with one change: each font role names the family that next/font loaded.
// Everything else (colors, type steps, spacing, radii, motion, component edits) is read from
// components/graphical/theme.ts unchanged. gui/assets.md allows this: "map the role tokens to the loader's actual family".
const family = (font: { style: { fontFamily: string } }) =>
  `${font.style.fontFamily}, sans-serif`

export const appTheme: ThemeDocument = {
  ...theme,
  theme: {
    ...theme.theme,
    fonts: {
      ui: { ...theme.theme.fonts.ui, family: family(inter) },
      editorial: { ...theme.theme.fonts.editorial, family: family(inter) },
      brand: { ...theme.theme.fonts.brand, family: family(archivo) },
      data: { ...theme.theme.fonts.data, family: family(archivo) },
    },
  },
}
