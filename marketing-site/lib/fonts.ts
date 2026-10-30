import { Archivo, Inter } from "next/font/google"

// Graphical theme fonts (GUI.md "Fonts and icons"): Archivo for the brand and data roles, Inter for the ui and
// editorial roles. Both are variable files, so one request covers every authored weight:
// Archivo 400, 500, 600, 700, 800 and Inter 400, 500, 600.
// next/font renames each family (for example "__Inter_a1b2c3"), so lib/app-theme.ts maps the theme's role
// families to these loader families instead of registering the literal "Archivo" and "Sidebar Inter" aliases.
export const archivo = Archivo({
  subsets: ["latin"],
  display: "swap",
  axes: ["wdth"],
})
export const inter = Inter({ subsets: ["latin"], display: "swap" })
