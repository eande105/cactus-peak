"use client"

import { usePathname } from "next/navigation"
import { useEffect, useRef, useState } from "react"
import { LinkButton } from "@/components/brand/atoms"
import { cn } from "@/lib/utils"
import { useMyClub } from "./club-context"
import { Logo } from "./logo"

export function SkipLinks({ club }: { club?: boolean }) {
  const cls =
    "absolute left-2 top-2 z-[100] -translate-y-24 rounded-md bg-card px-4 py-3 text-label shadow-(--shadow-m) ring-2 ring-ring focus:translate-y-0"
  const path = usePathname()
  // Only club and kids pages have an #hours section. A skip link with no target is a dead end.
  const hours = /^\/(clubs\/[^/]+|kids)$/.test(path)
  return (
    <div>
      <a href="#main" className={cls}>
        Skip to main content
      </a>
      {club && hours ? (
        <a href="#hours" className={cn(cls, "left-52")}>
          Skip to club hours
        </a>
      ) : null}
    </div>
  )
}

/** Mobile sticky action bar. Appears after the hero scrolls away (spec 02 section 6.3). */
export function BottomActionBar() {
  const path = usePathname()
  const { club } = useMyClub()
  const [show, setShow] = useState(false)
  const sentinel = useRef<HTMLDivElement>(null)
  // biome-ignore lint/correctness/useExhaustiveDependencies: path is the trigger; re-observe the sentinel after each route change
  useEffect(() => {
    const el = sentinel.current
    if (!el) return
    const io = new IntersectionObserver(([e]) => setShow(!e.isIntersecting))
    io.observe(el)
    return () => io.disconnect()
  }, [path])
  let primary = {
    label: "Book a free tour",
    href: club ? `/tour?club=${club.slug}` : "/tour",
  }
  let secondary: { label: string; href: string } = {
    label: "Join",
    href: "/join",
  }
  const clubMatch = path.match(/^\/clubs\/([^/]+)$/)
  if (clubMatch) {
    primary = { label: "Tour this club", href: `/tour?club=${clubMatch[1]}` }
    secondary = {
      label: "Call the club",
      href: `tel:${club?.tel ?? "+14805550100"}`,
    }
  } else if (
    path.startsWith("/classes/") &&
    !path.startsWith("/classes/category")
  )
    secondary = { label: "See times", href: "#times" }
  else if (path === "/membership") {
    primary = { label: "Join Ridge", href: "/join/plan?plan=ridge" }
    secondary = { label: "Book a free tour", href: "/tour" }
  } else if (path.startsWith("/coaches/"))
    secondary = { label: "Book a free tour", href: "/tour" }
  if (path.startsWith("/legal") || path === "/search") return null
  return (
    <>
      <div
        ref={sentinel}
        aria-hidden="true"
        className="pointer-events-none absolute top-0 left-0 h-[480px] w-px"
      />
      <div className="h-[76px] md:hidden" aria-hidden="true" />
      <section
        aria-label="Quick actions"
        className={cn(
          "fixed inset-x-0 bottom-0 z-50 flex gap-3 border-t border-border bg-card px-4 pt-3 pb-[max(12px,env(safe-area-inset-bottom))] transition-transform duration-300 motion-reduce:transition-none md:hidden",
          show ? "translate-y-0" : "translate-y-full"
        )}
        inert={!show}
      >
        <LinkButton href={primary.href} className="flex-[1.5]">
          {primary.label}
        </LinkButton>
        <LinkButton href={secondary.href} variant="outline" className="flex-1">
          {secondary.label}
        </LinkButton>
      </section>
    </>
  )
}

export function MinimalCheckoutHeader({
  phone = "(480) 555-0100",
  tel = "+14805550100",
  children,
  saveExit,
}: {
  phone?: string
  tel?: string
  children?: React.ReactNode
  saveExit?: boolean
}) {
  return (
    <header className="border-b border-border bg-card">
      <div className="mx-auto flex min-h-16 w-full max-w-[1200px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Logo width={160} />
        <div className="hidden flex-1 md:block">{children}</div>
        <div className="flex items-center gap-4 text-caption">
          <span className="hidden sm:inline">
            Need help?{" "}
            <a
              className="tabular font-semibold text-link underline-offset-4 hover:underline"
              href={`tel:${tel}`}
            >
              {phone}
            </a>
          </span>
          {saveExit ? (
            <LinkButton href="/" variant="ghost" size="sm">
              Save and exit
            </LinkButton>
          ) : null}
        </div>
      </div>
    </header>
  )
}
