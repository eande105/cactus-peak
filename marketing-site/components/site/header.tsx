"use client"

import { NavigationMenu as BaseNavigationMenu } from "@base-ui/react/navigation-menu"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import { LinkButton } from "@/components/brand/atoms"
import { NavigationMenu } from "@/components/graphical"
import { themePart } from "@/components/graphical/components/library/component-theme"
import { ChevronDown, Menu, Search, User } from "@/components/icons"
import { Button } from "@/components/ui/button"
import { MEMBER_SIGN_IN_URL } from "@/lib/links"
import { cn } from "@/lib/utils"
import { useMyClub } from "./club-context"
import { Logo } from "./logo"
import { MobileDrawer } from "./mobile-drawer"
import {
  NavCalloutBody,
  type NavGroup,
  type NavGroupId,
  type NavItem,
  NavItemBody,
  navLinks,
  useNavTree,
} from "./nav-tree"
import { SearchDialog } from "./search-dialog"

// A top-level link takes the navigation-menu trigger treatment, so links and menu triggers in the bar look the same.
const BarLink = themePart(
  BaseNavigationMenu.Link,
  "navigation-menu",
  "trigger",
  "ui-button"
)

// A link row inside a menu panel. The Graphical link part owns the radius, type and hover fill.
// closeOnClick closes the panel when the visitor follows the link.
function MenuLink({ item }: { item: NavItem }) {
  return (
    <NavigationMenu.Link
      closeOnClick
      render={<Link href={item.href} />}
      className="min-h-11 justify-start gap-3 px-3 py-2"
    >
      <NavItemBody item={item} />
    </NavigationMenu.Link>
  )
}

/**
 * One menu panel: a short list per section, then the callout. Lists come first so the panel reads as
 * a directory; the callout closes the row as the one thing to do next (references: Intercom's product
 * menu and the shadcn navigation-menu list).
 */
function MenuPanel({ group }: { group: NavGroup }) {
  return (
    <div className="flex gap-4 p-3">
      {group.sections.map((s) => (
        <div
          key={s.label ?? group.id}
          className={cn(
            "flex flex-col",
            s.cols === 2
              ? "w-96"
              : s.items.some((i) => i.desc)
                ? "w-64"
                : "w-48"
          )}
        >
          {s.label ? (
            <p className="px-3 pt-2 pb-1 text-caption text-muted-foreground">
              {s.label}
            </p>
          ) : null}
          <ul className={cn(s.cols === 2 && "grid grid-cols-2")}>
            {s.items.map((i) => (
              <li key={i.title}>
                <MenuLink item={i} />
              </li>
            ))}
          </ul>
        </div>
      ))}
      <BaseNavigationMenu.Link
        closeOnClick
        render={<Link href={group.callout.href} />}
        className="flex w-60 shrink-0 rounded-lg"
      >
        <NavCalloutBody callout={group.callout} className="w-full" />
      </BaseNavigationMenu.Link>
    </div>
  )
}

/** The path a group owns, so its trigger can mark the current section. */
const inGroup = (g: NavGroup, path: string) =>
  g.sections.some((s) =>
    s.items.some((i) => {
      const base = i.href.split(/[?#]/)[0]
      return path === base || path.startsWith(`${base}/`)
    })
  )

export function SiteHeader() {
  const pathname = usePathname()
  const tree = useNavTree()
  const { club } = useMyClub()
  const [menu, setMenu] = useState<NavGroupId | null>(null)
  const [drawer, setDrawer] = useState(false)
  const [search, setSearch] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const solid = scrolled || menu !== null

  useEffect(() => {
    const read = () => setScrolled(window.scrollY > 8)
    read()
    window.addEventListener("scroll", read, { passive: true })
    return () => window.removeEventListener("scroll", read)
  }, [])
  useEffect(() => {
    const k = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement
      const typing =
        t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable
      if (
        (e.key === "k" && (e.metaKey || e.ctrlKey)) ||
        (e.key === "/" && !typing)
      ) {
        e.preventDefault()
        setSearch(true)
      }
    }
    window.addEventListener("keydown", k)
    return () => window.removeEventListener("keydown", k)
  }, [])

  return (
    <>
      {/* One row: the brand, five top items (two menus and three pages), then search, sign in and the tour
          (references: Ramp, Claude and Coda on Mobbin). */}
      {/* At the top of the page the bar sits on the page itself, with no surface or rule. Once the page
          scrolls (or a menu opens over it) the bar takes the card surface and a 1px rule, so it stays
          readable over the content that passes under it. */}
      <header
        data-solid={solid}
        className={cn(
          "group/header sticky top-0 z-50 transition-[background-color,box-shadow] duration-150 motion-reduce:transition-none",
          solid ? "bg-card shadow-[0_1px_0_0_var(--border)]" : "bg-transparent"
        )}
      >
        {/* The bar collapses in steps, each set from the measured widths of its parts (logo 180, symbol 40, nav 554,
            search 44, sign in 99, tour 158; gaps 8 to 16):
            - below 768: menu, logo (the symbol below 640), search. The phone action bar carries the tour and Join,
              and the drawer carries sign in.
            - 768 to 1023: sign in and the tour join the bar. The nav stays in the drawer.
            - 1024 to 1279: the nav fits only beside the symbol.
            - 1280 and up: the full logo comes back.
            The drawer holds the full tree, sign in and the tour, so nothing is lost at any step. */}
        <div className="mx-auto flex h-16 w-full max-w-[1200px] items-center gap-2 px-4 sm:px-6 md:gap-4 xl:px-8">
          <Button
            variant="ghost"
            size="icon"
            aria-label="Open menu"
            aria-expanded={drawer}
            onClick={() => setDrawer(true)}
            className="-ml-2 size-11 md:-ml-3 lg:hidden"
          >
            <Menu className="size-5" aria-hidden="true" />
          </Button>
          <Logo width={180} className="max-sm:hidden lg:max-xl:hidden" />
          <Logo width={40} symbolOnly className="sm:max-lg:hidden xl:hidden" />
          {/* Graphical NavigationMenu on Base UI. The primitive owns hover intent, arrow keys between triggers,
              Escape, focus return and outside dismissal. The popup follows the open trigger and takes the size
              of its panel, so it resizes and slides between menus (the Base UI navigation-menu pattern). */}
          <NavigationMenu.Root
            aria-label="Primary"
            value={menu}
            onValueChange={(v) => setMenu(v as NavGroupId | null)}
            delay={100}
            closeDelay={150}
            className="hidden lg:block xl:ml-4"
          >
            <NavigationMenu.List>
              {tree.map((g) => (
                <NavigationMenu.Item key={g.id} value={g.id}>
                  <NavigationMenu.Trigger
                    className={cn(
                      "gap-1",
                      // The trigger's hover fill is Sand, the page colour. On the bare bar it takes the card colour instead.
                      "group-data-[solid=false]/header:hover:bg-card",
                      // The underline marks the current section. It is a pseudo-element, so it does not touch
                      // the Graphical trigger surface.
                      inGroup(g, pathname) &&
                        "relative after:absolute after:inset-x-3 after:bottom-0 after:h-0.5 after:bg-primary"
                    )}
                  >
                    {g.label}
                    <NavigationMenu.Icon className="inline-flex transition-transform duration-(--motion-duration) data-popup-open:rotate-180 motion-reduce:transition-none">
                      <ChevronDown aria-hidden="true" />
                    </NavigationMenu.Icon>
                  </NavigationMenu.Trigger>
                  <NavigationMenu.Content
                    aria-label={`${g.label} menu`}
                    className="nav-panel"
                  >
                    <MenuPanel group={g} />
                  </NavigationMenu.Content>
                </NavigationMenu.Item>
              ))}
              {navLinks.map((n) => {
                const active =
                  pathname === n.href || pathname.startsWith(`${n.href}/`)
                return (
                  <NavigationMenu.Item key={n.href}>
                    <BarLink
                      render={<Link href={n.href} />}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "group-data-[solid=false]/header:hover:bg-card",
                        active &&
                          "relative after:absolute after:inset-x-3 after:bottom-0 after:h-0.5 after:bg-primary"
                      )}
                    >
                      {n.label}
                    </BarLink>
                  </NavigationMenu.Item>
                )
              })}
            </NavigationMenu.List>
            <NavigationMenu.Portal>
              <NavigationMenu.Positioner
                side="bottom"
                align="start"
                sideOffset={8}
                collisionPadding={16}
                collisionAvoidance={{ side: "none", align: "shift" }}
                className="nav-positioner z-50"
              >
                {/* The panels are wider than the 420 px dropdown cap in the Graphical spec. Surface, edge,
                    shadow and motion stay Graphical. */}
                <NavigationMenu.Popup className="nav-popup h-(--popup-height) max-h-none w-(--popup-width) max-w-(--available-width) overflow-hidden">
                  <NavigationMenu.Viewport className="relative size-full overflow-hidden" />
                </NavigationMenu.Popup>
              </NavigationMenu.Positioner>
            </NavigationMenu.Portal>
          </NavigationMenu.Root>
          {/* The header's button set (one per audience, in rising weight): search for everyone, sign in for
              members, and the free tour for prospects. The tour is the brand's first goal and the header is the
              only part of every page that stays on screen, so it holds the one filled button. Join is one click
              away through Membership, whose plan cards start the join flow. */}
          <div className="ml-auto flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              aria-label="Search clubs and classes"
              title="Search (/)"
              onClick={() => setSearch(true)}
              className="size-11"
            >
              <Search className="size-5" aria-hidden="true" />
            </Button>
            <LinkButton
              href={MEMBER_SIGN_IN_URL}
              external
              variant="ghost"
              aria-label="Member sign in"
              // The soft fill is one step darker than the card; on the bare page it takes the card colour,
              // so it still reads as a button against the Sand.
              className="hidden group-data-[solid=false]/header:bg-card md:inline-flex"
            >
              <User aria-hidden="true" />
              Sign in
            </LinkButton>
            <LinkButton
              href={club ? `/tour?club=${club.slug}` : "/tour"}
              className="hidden md:inline-flex"
            >
              Book a free tour
            </LinkButton>
          </div>
        </div>
        {/* Dims the page under an open panel. It lives inside the sticky header so it starts at the header's lower
            edge and stays behind the header. A press on it is an outside press, so the menu closes. */}
        {menu ? (
          <div
            aria-hidden="true"
            className="absolute inset-x-0 top-full -z-10 h-dvh bg-night/20 transition-opacity duration-(--motion-duration) motion-reduce:transition-none starting:opacity-0"
          />
        ) : null}
      </header>
      <MobileDrawer
        open={drawer}
        onOpenChange={setDrawer}
        onSearch={() => {
          setDrawer(false)
          setSearch(true)
        }}
      />
      <SearchDialog open={search} onOpenChange={setSearch} />
    </>
  )
}
