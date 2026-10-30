"use client"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useTheme } from "next-themes"
import { type ReactNode, useEffect, useRef, useState } from "react"
import { PaymentBanners } from "@/components/app/banners"
import { ClubSwitcher } from "@/components/app/club-switcher"
import { GlobalDialogs } from "@/components/app/global-dialogs"
import { HouseholdGate, ShellSkeleton } from "@/components/app/household-gate"
import { canOpen, canSee, NAV } from "@/components/app/nav"
import { NotificationsPopover } from "@/components/app/notices"
import { useApp } from "@/components/app/use-app"
import { Menu } from "@/components/graphical"
import {
  Check,
  ChevronDown,
  CircleHelp,
  Menu as MenuIcon,
  MonitorSmartphone,
  Moon,
  PanelLeft,
  QrCode,
  Search,
  Sun,
  X,
} from "@/components/icons"
import { Drawer } from "@/components/kit/overlays"
import { Tip, TipProvider } from "@/components/kit/tip"
import { EmptyState, Kbd, PersonAvatar } from "@/components/kit/ui"
import { Button } from "@/components/ui/button"
import {
  demoJumpClock,
  demoOpenWaitlistSpot,
  demoPaymentFailed,
  demoReset,
  setPrefs,
  signOut,
  switchMember,
} from "@/lib/actions"
import { announce } from "@/lib/announce"
import { CLUB_BY_SLUG, PLANS } from "@/lib/data/catalog"
import { guestPassesLeft, ptCreditsLeft } from "@/lib/engine"
import { toast } from "@/lib/toast"
import { openDialog, setOfflineDemo, useOffline } from "@/lib/ui-state"
import { cn } from "@/lib/utils"

function Logo({ className, symbol }: { className?: string; symbol?: boolean }) {
  return (
    <>
      {/* biome-ignore lint/performance/noImgElement: static SVG brand mark, next/image adds nothing */}
      <img
        src={
          symbol
            ? "/brand/cpa-symbol-color.svg"
            : "/brand/cpa-horizontal-color.svg"
        }
        alt=""
        className={cn("dark:hidden", className)}
      />
      {/* biome-ignore lint/performance/noImgElement: static SVG brand mark, next/image adds nothing */}
      <img
        src={
          symbol
            ? "/brand/cpa-symbol-reversed.svg"
            : "/brand/cpa-horizontal-reversed.svg"
        }
        alt=""
        className={cn("hidden dark:block", className)}
      />
    </>
  )
}

function badgeFor(href: string, app: ReturnType<typeof useApp>) {
  const { s, me, hh, now } = app
  if (href === "/bookings") {
    const n = s.bookings.filter(
      (b) =>
        b.memberId === me.id &&
        b.status === "held" &&
        (b.holdExpiresAt ?? 0) > now
    ).length
    return n
      ? { text: String(n), tone: "warning" as const, label: `${n} held` }
      : null
  }
  if (href === "/training") {
    const n = ptCreditsLeft(hh)
    return n
      ? {
          text: String(n),
          tone: "muted" as const,
          label: `${n} training credits left`,
        }
      : null
  }
  if (href === "/guest-passes") {
    const { left } = guestPassesLeft(s, hh.id, now)
    return {
      text: String(left),
      tone: "muted" as const,
      label: `${left} guest passes left`,
    }
  }
  if (href === "/inbox") {
    const n = s.notices.filter((x) => x.memberId === me.id && !x.readAt).length
    return n
      ? { text: String(n), tone: "danger" as const, label: `${n} unread` }
      : null
  }
  if (href === "/membership") {
    if (hh.status === "frozen")
      return { text: "Frozen", tone: "muted" as const, label: "Frozen" }
    if (hh.status === "payment_failed")
      return { text: "!", tone: "danger" as const, label: "Payment failed" }
  }
  if (href === "/billing" && hh.status === "payment_failed")
    return { text: "", tone: "dot" as const, label: "Payment failed" }
  return null
}

function NavLinks({
  collapsed,
  onNavigate,
}: {
  collapsed?: boolean
  onNavigate?: () => void
}) {
  const app = useApp()
  const path = usePathname()
  const items = NAV.filter((n) => canSee(app.me, n.href))
  const groups: (string | undefined)[] = []
  for (const n of items.filter((i) => !i.footer))
    if (!groups.includes(n.group)) groups.push(n.group)
  const link = (n: (typeof NAV)[number]) => {
    const active =
      path === n.href ||
      path.startsWith(`${n.href}/`) ||
      (n.href === "/schedule" && path.startsWith("/schedule"))
    const b = badgeFor(n.href, app)
    const Icon = n.icon
    return (
      <li key={n.href}>
        {/* The collapsed rail shows icons only. The name stays in the sr-only label; the hint is for sighted users. */}
        <Tip content={collapsed ? n.label : undefined} side="right">
          <Link
            href={n.href}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            className={cn(
              "relative flex min-h-11 items-center gap-3 rounded-md px-3 text-label transition-colors hover:bg-muted",
              collapsed && "justify-center px-0",
              active &&
                "font-bold before:absolute before:inset-y-2 before:left-0 before:w-[3px] before:rounded-full before:bg-primary"
            )}
          >
            <Icon className="size-5 shrink-0" aria-hidden="true" />
            <span
              className={cn(
                "min-w-0 flex-1 break-words",
                collapsed && "sr-only"
              )}
            >
              {n.label}
            </span>
            {b ? (
              <span
                className={cn(
                  "shrink-0 rounded-full px-2 num text-detail",
                  b.tone === "warning" && "bg-warning-subtle text-warning",
                  b.tone === "danger" &&
                    "font-bold bg-badge-danger text-badge-danger-fg",
                  b.tone === "muted" && "bg-muted text-muted-foreground",
                  b.tone === "dot" && "size-2 bg-destructive p-0",
                  collapsed && "absolute top-1 right-1 px-1"
                )}
              >
                <span className="sr-only">{b.label}</span>
                <span aria-hidden="true">{b.text}</span>
              </span>
            ) : null}
          </Link>
        </Tip>
      </li>
    )
  }
  return (
    <nav
      aria-label="Main"
      className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-3 py-2"
    >
      <ul className="flex flex-col gap-0.5">
        {items.filter((n) => !n.group && !n.footer).map(link)}
      </ul>
      {groups.filter(Boolean).map((g) => (
        <div key={g}>
          {collapsed ? (
            <hr className="mb-2 border-border" />
          ) : (
            <p className="mb-1 px-3 eyebrow text-muted-foreground">{g}</p>
          )}
          <ul className="flex flex-col gap-0.5">
            {items.filter((n) => n.group === g).map(link)}
          </ul>
        </div>
      ))}
      <ul className="mt-auto flex flex-col gap-0.5 border-t border-border pt-3">
        {items.filter((n) => n.footer).map(link)}
      </ul>
    </nav>
  )
}

function AccountMenu() {
  const { s, me, hh } = useApp()
  const offline = useOffline()
  const { theme, setTheme } = useTheme()
  const router = useRouter()
  // Row level security limits the app to the signed-in household, so only its members can be viewed here.
  // Other demo people need their own sign-in.
  const demoPeople = Object.values(s.members).filter(
    (m) => m.householdId === hh.id && m.role !== "child"
  )
  const [resetting, setResetting] = useState(false)
  return (
    <Menu.Root>
      <Menu.Trigger
        aria-label={`Account menu for ${me.firstName} ${me.lastName}`}
        className="!flex !size-11 !items-center !justify-center !gap-1 !border-0 !bg-transparent !p-0 !shadow-none hover:!bg-muted"
      >
        <PersonAvatar
          name={`${me.firstName} ${me.lastName}`}
          hue={me.hue}
          size={32}
        />
        <ChevronDown
          className="size-4 text-muted-foreground max-sm:hidden"
          aria-hidden="true"
        />
      </Menu.Trigger>
      <Menu.Portal>
        <Menu.Positioner align="end" sideOffset={8}>
          <Menu.Popup className="max-h-[80vh] !min-w-64 overflow-y-auto">
            <div className="px-3 py-2">
              <p className="text-label">
                {me.firstName} {me.lastName}
              </p>
              <p className="text-caption text-muted-foreground">
                {PLANS[hh.plan].name} ·{" "}
                {me.role === "primary"
                  ? "Primary member"
                  : me.role === "adult"
                    ? "Family adult"
                    : me.role === "teen"
                      ? "Teen"
                      : "Child"}
              </p>
            </div>
            <Menu.Separator />
            <Menu.Group>
              <Menu.GroupLabel>View as (your household)</Menu.GroupLabel>
              <Menu.RadioGroup
                value={me.id}
                onValueChange={(v) => {
                  switchMember(v as string)
                  router.push("/today")
                  announce(
                    `Now viewing as ${s.members[v as string].firstName}.`
                  )
                }}
              >
                {demoPeople.map((m) => (
                  <Menu.RadioItem key={m.id} value={m.id} closeOnClick>
                    <Menu.RadioItemIndicator>
                      <Check aria-hidden="true" />
                    </Menu.RadioItemIndicator>
                    {m.firstName} {m.lastName}
                    <span className="ml-2 text-detail text-muted-foreground">
                      {m.role === "teen"
                        ? "Teen"
                        : m.role === "primary"
                          ? "Primary"
                          : "Adult"}
                    </span>
                  </Menu.RadioItem>
                ))}
              </Menu.RadioGroup>
            </Menu.Group>
            <Menu.Separator />
            <Menu.Item render={<Link href="/settings" />}>Settings</Menu.Item>
            {me.role === "primary" ? (
              <Menu.Item render={<Link href="/billing" />}>Billing</Menu.Item>
            ) : null}
            <Menu.Separator />
            <Menu.Group>
              <Menu.GroupLabel>Appearance</Menu.GroupLabel>
              <Menu.RadioGroup
                value={theme ?? "system"}
                onValueChange={(v) => {
                  setTheme(v as string)
                  setPrefs(me.id, { theme: v as "system" })
                }}
              >
                <Menu.RadioItem value="system">
                  <Menu.RadioItemIndicator>
                    <Check aria-hidden="true" />
                  </Menu.RadioItemIndicator>
                  <MonitorSmartphone
                    className="mr-2 size-4"
                    aria-hidden="true"
                  />
                  System
                </Menu.RadioItem>
                <Menu.RadioItem value="light">
                  <Menu.RadioItemIndicator>
                    <Check aria-hidden="true" />
                  </Menu.RadioItemIndicator>
                  <Sun className="mr-2 size-4" aria-hidden="true" />
                  Light
                </Menu.RadioItem>
                <Menu.RadioItem value="dark">
                  <Menu.RadioItemIndicator>
                    <Check aria-hidden="true" />
                  </Menu.RadioItemIndicator>
                  <Moon className="mr-2 size-4" aria-hidden="true" />
                  Dark
                </Menu.RadioItem>
              </Menu.RadioGroup>
            </Menu.Group>
            <Menu.Separator />
            <Menu.Group>
              <Menu.GroupLabel>Demo tools</Menu.GroupLabel>
              <Menu.Item
                onClick={() => {
                  const ok = demoOpenWaitlistSpot()
                  announce(
                    ok
                      ? "A spot opened on your waitlist."
                      : "You are not on a waitlist right now."
                  )
                }}
              >
                Open a spot on my waitlist
              </Menu.Item>
              <Menu.Item
                onClick={() => {
                  demoJumpClock(3600_000)
                  announce("Clock moved forward 1 hour.")
                }}
              >
                Move the clock forward 1 hour
              </Menu.Item>
              {me.role === "primary" ? (
                <>
                  <Menu.Item onClick={() => demoPaymentFailed(0)}>
                    Fail my payment (day 0)
                  </Menu.Item>
                  <Menu.Item onClick={() => demoPaymentFailed(9)}>
                    Fail my payment (day 9)
                  </Menu.Item>
                  <Menu.Item onClick={() => demoPaymentFailed(null)}>
                    Clear payment failure
                  </Menu.Item>
                </>
              ) : null}
              <Menu.CheckboxItem
                checked={offline}
                onCheckedChange={(c) => setOfflineDemo(!!c)}
              >
                <Menu.CheckboxItemIndicator>
                  <Check aria-hidden="true" />
                </Menu.CheckboxItemIndicator>
                Offline
              </Menu.CheckboxItem>
              <Menu.Item
                disabled={resetting}
                onClick={async () => {
                  setResetting(true)
                  try {
                    await demoReset()
                    setOfflineDemo(false)
                    announce("Demo data reset.")
                    toast({ title: "Demo data reset" })
                    router.push("/today")
                  } catch {
                    toast({
                      type: "error",
                      title: "We couldn't reset the demo data",
                      description:
                        "Check your connection, then try Reset demo data again.",
                    })
                  } finally {
                    setResetting(false)
                  }
                }}
              >
                {resetting ? "Resetting demo data…" : "Reset demo data"}
              </Menu.Item>
            </Menu.Group>
            <Menu.Separator />
            <Menu.Item
              onClick={async () => {
                try {
                  await signOut()
                } catch {
                  toast({
                    type: "error",
                    title: "We couldn't reach the server to sign out",
                    description:
                      "You're signed out on this device. Sign out again later to end other sessions.",
                  })
                }
                router.replace("/sign-in")
                router.refresh()
              }}
            >
              Sign out
            </Menu.Item>
          </Menu.Popup>
        </Menu.Positioner>
      </Menu.Portal>
    </Menu.Root>
  )
}

function HelpMenu() {
  const { club } = useApp()
  const c = CLUB_BY_SLUG[club]
  return (
    <Menu.Root>
      <Menu.Trigger
        aria-label="Help"
        className="!grid !size-11 !place-items-center !border-0 !bg-transparent !p-0 !shadow-none hover:!bg-muted"
      >
        <CircleHelp className="size-5" aria-hidden="true" />
      </Menu.Trigger>
      <Menu.Portal>
        <Menu.Positioner align="end" sideOffset={8}>
          <Menu.Popup className="!min-w-64">
            <Menu.Item render={<Link href="/help" />}>Help centre</Menu.Item>
            <Menu.Item render={<Link href="/help#contact" />}>
              Message the front desk
            </Menu.Item>
            <Menu.Item
              render={<a href={`tel:${c.phone.replace(/\D/g, "")}`} />}
            >
              Call {c.name}{" "}
              <span className="ml-1 num text-muted-foreground">{c.phone}</span>
            </Menu.Item>
            <Menu.Item onClick={() => openDialog("shortcuts")}>
              Keyboard shortcuts
            </Menu.Item>
          </Menu.Popup>
        </Menu.Positioner>
      </Menu.Portal>
    </Menu.Root>
  )
}

function TabBar({ onMore }: { onMore: () => void }) {
  const path = usePathname()
  if (path.startsWith("/reserve/")) return null
  const tabs = [
    { href: "/today", label: "Today", icon: NAV[0].icon },
    { href: "/schedule", label: "Schedule", icon: NAV[1].icon },
    { href: "/bookings", label: "Bookings", icon: NAV[2].icon },
    { href: "/pass", label: "Pass", icon: QrCode },
  ]
  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card pb-[env(safe-area-inset-bottom)] md:hidden"
    >
      <ul className="grid grid-cols-5">
        {tabs.map((t) => {
          const active = path === t.href || path.startsWith(`${t.href}/`)
          const Icon = t.icon
          return (
            <li key={t.href}>
              <Link
                href={t.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex min-h-16 min-w-0 flex-col items-center justify-center gap-0.5 truncate text-detail font-medium",
                  active ? "text-link font-semibold" : "text-muted-foreground"
                )}
              >
                <span
                  className={cn(
                    "grid h-7 w-12 place-items-center rounded-full",
                    active && "bg-accent"
                  )}
                >
                  <Icon className="size-5" aria-hidden="true" />
                </span>
                {t.label}
              </Link>
            </li>
          )
        })}
        <li>
          <button
            type="button"
            onClick={onMore}
            className="flex min-h-16 w-full flex-col items-center justify-center gap-0.5 text-detail font-medium text-muted-foreground"
          >
            <span className="grid h-7 w-12 place-items-center">
              <MenuIcon className="size-5" aria-hidden="true" />
            </span>
            More
          </button>
        </li>
      </ul>
    </nav>
  )
}

export function StoreGate({ children }: { children: ReactNode }) {
  return (
    <HouseholdGate skeleton={<ShellSkeleton />}>
      <Shell>{children}</Shell>
    </HouseholdGate>
  )
}

function Shell({ children }: { children: ReactNode }) {
  const app = useApp()
  const { me } = app
  const path = usePathname()
  const offline = useOffline()
  const [collapsed, setCollapsed] = useState(() => {
    try {
      return localStorage.getItem("cp-sidebar") === "1"
    } catch {
      return false
    }
  })
  const [menuOpen, setMenuOpen] = useState(false)
  const main = useRef<HTMLElement>(null)
  useEffect(() => {
    document.documentElement.dataset.motion =
      app.prefs.motion === "reduce" ? "reduce" : ""
    document.documentElement.dataset.text =
      app.prefs.textSize === "large" ? "large" : ""
  }, [app.prefs.motion, app.prefs.textSize])
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "b") {
        e.preventDefault()
        setCollapsed((c) => {
          try {
            localStorage.setItem("cp-sidebar", c ? "0" : "1")
          } catch {}
          return !c
        })
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [])
  // Route change: move focus to the page heading and announce the title.
  // biome-ignore lint/correctness/useExhaustiveDependencies: runs on route change only, the focus move must not repeat for other changes
  useEffect(() => {
    const t = window.setTimeout(() => {
      const h = document.getElementById("page-title") ?? main.current
      h?.focus({ preventScroll: true })
      announce(`${document.title.split(" · ")[0] || "Page"} page loaded`)
    }, 120)
    return () => window.clearTimeout(t)
  }, [path])
  const access = canOpen(me, path)
  const toggle = () =>
    setCollapsed((c) => {
      try {
        localStorage.setItem("cp-sidebar", c ? "0" : "1")
      } catch {}
      return !c
    })
  return (
    // One provider for the signed-in app, so moving between hints skips the open delay.
    <TipProvider>
      <div
        className={cn(
          "grid min-h-dvh lg:grid-cols-[var(--sb)_minmax(0,1fr)]",
          "[--sb:264px]",
          collapsed && "lg:[--sb:72px]"
        )}
      >
        <a
          href="#main"
          className="fixed top-2 left-2 z-[70] -translate-y-20 rounded-md bg-night px-4 py-3 text-label text-on-night focus:translate-y-0"
        >
          Skip to main content
        </a>
        <aside
          className="sticky top-0 hidden h-dvh flex-col border-r border-border bg-card lg:flex"
          aria-label="Sidebar"
        >
          <div
            className={cn(
              "flex h-16 items-center px-4",
              collapsed && "justify-center px-0"
            )}
          >
            <Link href="/today" aria-label="Cactus Peak Athletic, Today">
              {collapsed ? (
                <Logo symbol className="size-8" />
              ) : (
                <Logo className="h-9 w-auto" />
              )}
            </Link>
          </div>
          <NavLinks collapsed={collapsed} />
          <div className="border-t border-border p-3">
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "w-full justify-start",
                collapsed && "justify-center"
              )}
              onClick={toggle}
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              <PanelLeft aria-hidden="true" data-icon="inline-start" />
              {collapsed ? null : "Collapse"}
            </Button>
          </div>
        </aside>
        <div className="flex min-w-0 flex-col">
          <header className="sticky top-0 z-30 flex h-14 items-center gap-1 border-b border-border bg-card px-2 sm:gap-2 sm:px-4 md:h-16 lg:px-6">
            <Button
              variant="ghost"
              size="icon"
              className="max-md:hidden lg:hidden"
              onClick={() => setMenuOpen(true)}
              aria-label="Menu"
            >
              <MenuIcon aria-hidden="true" />
            </Button>
            <Link
              href="/today"
              className="grid size-11 min-w-11 shrink-0 place-items-center md:hidden"
              aria-label="Cactus Peak Athletic, Today"
            >
              <Logo symbol className="size-7" />
            </Link>
            <ClubSwitcher />
            <button
              type="button"
              onClick={() => openDialog("command")}
              className="ml-2 hidden h-11 max-w-sm min-w-0 flex-1 items-center gap-2 rounded-md bg-background px-3 text-left text-body text-muted-foreground edge ring-border hover:ring-input-hover lg:flex"
            >
              <Search className="size-4 shrink-0" aria-hidden="true" />
              <span className="min-w-0 flex-1 truncate">
                Search classes, clubs, coaches
              </span>
              <Kbd>Ctrl K</Kbd>
            </button>
            <div className="ml-auto flex items-center gap-0.5">
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                onClick={() => openDialog("command")}
                aria-label="Search"
              >
                <Search aria-hidden="true" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="mr-1 hidden min-h-10 md:inline-flex"
                onClick={() => openDialog("pass")}
              >
                <QrCode aria-hidden="true" data-icon="inline-start" />
                Pass
              </Button>
              <NotificationsPopover />
              <div className="max-sm:hidden">
                <HelpMenu />
              </div>
              <AccountMenu />
            </div>
          </header>
          {path === "/pass" ? null : (
            <PaymentBanners offline={offline} path={path} />
          )}
          <main
            id="main"
            ref={main}
            tabIndex={-1}
            className="mx-auto w-full max-w-[1200px] flex-1 px-4 pt-6 pb-28 outline-none md:px-6 md:pt-8 lg:px-8 lg:pb-16"
          >
            {access.ok ? (
              children
            ) : (
              <EmptyState
                icon={X}
                title="You don't have access to this page."
                body={access.reason}
                action={
                  <Button render={<Link href="/today" />}>Back to Today</Button>
                }
                secondary={
                  me.parentId ? (
                    <Button variant="outline" render={<Link href="/inbox" />}>
                      Message {app.s.members[me.parentId].firstName}
                    </Button>
                  ) : undefined
                }
              />
            )}
          </main>
        </div>
        <div
          id="live-status"
          role="status"
          aria-live="polite"
          className="sr-only"
        />
        <TabBar onMore={() => setMenuOpen(true)} />
        <Drawer.Root
          open={menuOpen}
          onOpenChange={setMenuOpen}
          swipeDirection="left"
        >
          <Drawer.Portal>
            <Drawer.Backdrop />
            <Drawer.Viewport className="nav-drawer-viewport">
              <Drawer.Popup className="nav-drawer">
                <Drawer.Content className="h-full !gap-0">
                  <div className="flex h-16 items-center justify-between px-4">
                    <Drawer.Title className="sr-only">Menu</Drawer.Title>
                    <Logo className="h-9 w-auto" />
                    <Drawer.Close
                      aria-label="Close menu"
                      className="grid size-11 place-items-center rounded-md hover:bg-muted"
                    >
                      <X className="size-5" aria-hidden="true" />
                    </Drawer.Close>
                  </div>
                  <Drawer.Description className="sr-only">
                    All the pages in the member portal.
                  </Drawer.Description>
                  <NavLinks onNavigate={() => setMenuOpen(false)} />
                </Drawer.Content>
              </Drawer.Popup>
            </Drawer.Viewport>
          </Drawer.Portal>
        </Drawer.Root>
        <GlobalDialogs />
      </div>
    </TipProvider>
  )
}
