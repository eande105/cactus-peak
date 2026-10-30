import type { Metadata, Viewport } from "next"
import "./globals.css"
import { GraphicalThemeProvider } from "@/components/graphical-theme-provider"
import { BookingProvider } from "@/components/site/booking"
import { CatalogProvider } from "@/components/site/catalog-context"
import { ClubProvider } from "@/components/site/club-context"
import { ThemeProvider } from "@/components/theme-provider"
import { ThemeVariables } from "@/components/theme-variables"
import { appTheme } from "@/lib/app-theme"
import { getClientCatalog } from "@/lib/catalog/server"
import { azNowKey } from "@/lib/time"

export const metadata: Metadata = {
  metadataBase: new URL("https://www.cactuspeakathletic.com"),
  title: {
    default: "Cactus Peak Athletic — Five clubs in Mesa and Gilbert",
    template: "%s",
  },
  description:
    "Pools, courts, classes and recovery at five East Valley clubs. Climb at your own pace. Book a free tour or a 3-day pass.",
  icons: { icon: [{ url: "/brand/favicon.svg", type: "image/svg+xml" }] },
  manifest: "/site.webmanifest",
}
export const viewport: Viewport = { width: "device-width", initialScale: 1 }

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  // Every page reads the catalog (header menus, footer, search). It is cached for an hour (lib/supabase/public.ts).
  const catalog = await getClientCatalog()
  return (
    <html lang="en-US" suppressHydrationWarning className="antialiased">
      <head>
        <ThemeVariables />
      </head>
      <body>
        <ThemeProvider defaultTheme="light" enableSystem={false}>
          <GraphicalThemeProvider document={appTheme}>
            <CatalogProvider data={catalog} serverNowKey={azNowKey()}>
              <ClubProvider>
                <BookingProvider>{children}</BookingProvider>
              </ClubProvider>
            </CatalogProvider>
          </GraphicalThemeProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
