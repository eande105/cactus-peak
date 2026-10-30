import type { Metadata } from "next"
import { LinkButton } from "@/components/brand/atoms"
import { Container } from "@/components/sections/common"

export const metadata: Metadata = {
  title: "Page not found — Cactus Peak Athletic",
}

export default function NotFound() {
  return (
    <Container className="py-16 lg:py-24">
      <svg viewBox="0 0 256 256" className="size-24" aria-hidden="true">
        <path
          fill="var(--color-1)"
          d="M12.53,230L12.53,222L42,170.96L42,230ZM58,230L58,143.24L88,91.28L88,230ZM104,230L104,63.57L128,22L152,63.57L152,230ZM168,230L168,91.28L198,143.24L198,230ZM214,230L214,170.96L243.47,222L243.47,230Z"
        />
      </svg>
      <h1 className="font-display-wide mt-6 text-h1 lg:text-display">
        That page took a rest day.
      </h1>
      <p className="mt-3 text-body text-muted-foreground">
        We could not find it. Try one of these.
      </p>
      <div className="mt-6 flex flex-wrap gap-3">
        <LinkButton href="/clubs" size="lg">
          Find a club
        </LinkButton>
        <LinkButton href="/schedule" variant="outline" size="lg">
          See the schedule
        </LinkButton>
        <LinkButton href="/search" variant="ghost" size="lg">
          Search
        </LinkButton>
      </div>
    </Container>
  )
}
