"use client"

import type { ReactNode } from "react"
import { Collapsible, GraphicalProvider, theme } from "@/components/graphical"
import { ChevronRight } from "@/components/icons"

// Footer disclosures on the Graphical Collapsible (gui/components/cactus-peak-athletic/collapsible.md). The footer
// lives in server layouts, so this small client file holds the Graphical parts.
//
// The footer is a Saguaro Night band. The light Collapsible has dark text and a near-white panel, which fail on
// Night. This scope gives only the Graphical parts their dark-mode values. The site tokens (night-foreground and the
// rest) resolve on :root, so the footer's own text and links keep their colors. The site itself stays light.
export function FooterNightScope({ children }: { children: ReactNode }) {
  return (
    <GraphicalProvider document={theme} colorMode="dark">
      {children}
    </GraphicalProvider>
  )
}

export function FooterDisclosure({
  title,
  defaultOpen,
  children,
}: {
  title: string
  defaultOpen?: boolean
  children: ReactNode
}) {
  return (
    <Collapsible.Root defaultOpen={defaultOpen}>
      {/* 44 px minimum touch target (BUILD-NOTES accessibility). */}
      <Collapsible.Trigger className="min-h-11">
        {title}
        <Collapsible.Indicator>
          <ChevronRight aria-hidden="true" />
        </Collapsible.Indicator>
      </Collapsible.Trigger>
      {/* Kept in the HTML while closed, so the footer links are in the server render. */}
      <Collapsible.Panel keepMounted>{children}</Collapsible.Panel>
    </Collapsible.Root>
  )
}
