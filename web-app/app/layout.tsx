import type { Metadata, Viewport } from "next"

import "./globals.css"
import { CatalogBoundary } from "@/components/app/catalog-boundary"
import { GraphicalThemeProvider } from "@/components/graphical-theme-provider"
import { ThemeProvider } from "@/components/theme-provider"
import { ThemeVariables } from "@/components/theme-variables"
import { appTheme } from "@/lib/app-theme"
import { getCatalog } from "@/lib/data/catalog-server"
import { Toaster } from "@/lib/toast"

export const metadata: Metadata = {
  title: {
    default: "Cactus Peak Athletic",
    template: "%s · Cactus Peak Athletic",
  },
  description:
    "The Cactus Peak Athletic member portal. Sample project, not a real gym.",
  icons: { icon: [{ url: "/brand/favicon.svg", type: "image/svg+xml" }] },
  manifest: "/site.webmanifest",
}
export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F6F1E8" },
    { media: "(prefers-color-scheme: dark)", color: "#121A16" },
  ],
}

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  // Clubs, classes, coaches and plans come from Supabase. A failed read shows app/global-error.tsx.
  const catalog = await getCatalog()
  return (
    <html lang="en-US" suppressHydrationWarning className="antialiased">
      <head>
        <ThemeVariables />
      </head>
      <body>
        <ThemeProvider>
          <GraphicalThemeProvider document={appTheme}>
            <Toaster>
              <CatalogBoundary catalog={catalog}>
                <div className="isolate min-h-dvh">{children}</div>
              </CatalogBoundary>
            </Toaster>
          </GraphicalThemeProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
