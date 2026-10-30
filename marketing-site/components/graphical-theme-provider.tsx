"use client"

import { useTheme } from "next-themes"
import { type ReactNode, useSyncExternalStore } from "react"

import type { ThemeDocument } from "@/components/graphical"
import { GraphicalProvider } from "@/components/graphical/components/library/graphical-provider"
import {
  IconRendererProvider,
  type ThemeIconRenderProps,
} from "@/components/graphical/components/library/icon"
import { NucleoIcon, THEME_ICON_ART } from "@/components/icons/nucleo"

const subscribe = () => () => {}

// The provider is imported from its own module instead of the components/graphical index, so this layout-level file
// does not pull in the component library. The themed controls (header, footer, forms, overlays) import the index from
// their own client components.
// Ties the Graphical runtime to next-themes. The color mode follows the resolved theme, so it updates live when the
// visitor switches mode or the system preference changes, and it reaches portals through the provider's context.
// The server and the first client render use light. The real mode applies right after hydration, so hydration matches.
// The CSS from ThemeVariables already paints the right colors before that.
// The Graphical components keep their own icon code. This renderer swaps the artwork they draw for the Nucleo icon
// of the same name (THEME_ICON_ART); a name with no Nucleo match returns undefined and keeps the bundled Lucide icon.
function renderNucleo({
  name,
  family: _family,
  variant: _variant,
  weight: _weight,
  hugeiconsVariant: _hugeicons,
  ...svg
}: ThemeIconRenderProps) {
  const body = THEME_ICON_ART[name]
  return body ? <NucleoIcon body={body} {...svg} /> : undefined
}

export function GraphicalThemeProvider({
  document,
  children,
}: {
  document: ThemeDocument
  children: ReactNode
}) {
  const { resolvedTheme } = useTheme()
  const mounted = useSyncExternalStore(
    subscribe,
    () => true,
    () => false
  )
  const colorMode = mounted && resolvedTheme === "dark" ? "dark" : "light"

  return (
    <GraphicalProvider document={document} colorMode={colorMode}>
      <IconRendererProvider renderIcon={renderNucleo}>
        {children}
      </IconRendererProvider>
    </GraphicalProvider>
  )
}
