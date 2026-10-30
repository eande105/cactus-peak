import { Archivo, Inter } from "next/font/google"

// Archivo (display and data) with its width axis, so headings can set font-stretch 112%. Inter for UI and reading.
export const archivo = Archivo({
  subsets: ["latin"],
  axes: ["wdth"],
  display: "swap",
})
export const inter = Inter({ subsets: ["latin"], display: "swap" })
