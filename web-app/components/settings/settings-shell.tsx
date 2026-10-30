"use client"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useEffect } from "react"
import { ChevronRight } from "@/components/icons"
import { PageHeader } from "@/components/kit/ui"
import { useMedia } from "@/hooks/use-media"
import { cn } from "@/lib/utils"

export const SETTINGS = [
  { href: "/settings/profile", label: "Profile" },
  { href: "/settings/preferences", label: "Home club and interests" },
  { href: "/settings/notifications", label: "Notifications" },
  { href: "/settings/calendar", label: "Calendar" },
  { href: "/settings/security", label: "Sign-in and security" },
  { href: "/settings/display", label: "Display and accessibility" },
  { href: "/settings/privacy", label: "Privacy and data" },
]

export function SettingsShell({ children }: { children: React.ReactNode }) {
  const path = usePathname()
  const router = useRouter()
  const wide = useMedia("(min-width: 1024px)")
  const root = path === "/settings"
  useEffect(() => {
    if (root && wide) router.replace("/settings/profile")
  }, [root, wide, router])
  const nav = (
    <nav aria-label="Settings" className="flex flex-col">
      {SETTINGS.map((s) => (
        <Link
          key={s.href}
          href={s.href}
          aria-current={path === s.href ? "page" : undefined}
          className={cn(
            "relative flex min-h-12 items-center justify-between rounded-md px-3 text-label hover:bg-muted",
            path === s.href &&
              "bg-accent before:absolute before:inset-y-2 before:left-0 before:w-[3px] before:rounded-full before:bg-primary"
          )}
        >
          {s.label}
          <ChevronRight
            className="size-4 text-muted-foreground lg:hidden"
            aria-hidden="true"
          />
        </Link>
      ))}
    </nav>
  )
  if (root)
    return wide ? null : (
      <div className="flex flex-col gap-6">
        <PageHeader title="Settings" />
        {nav}
      </div>
    )
  return (
    <div className="flex flex-col gap-6">
      {wide ? (
        <PageHeader title="Settings" />
      ) : (
        <PageHeader
          backHref="/settings"
          backLabel="Settings"
          title={SETTINGS.find((s) => s.href === path)?.label ?? "Settings"}
        />
      )}
      <div className="grid gap-8 lg:grid-cols-[240px_minmax(0,720px)]">
        {wide ? (
          <aside className="lg:sticky lg:top-24 lg:self-start">{nav}</aside>
        ) : null}
        <div className="min-w-0">
          {wide ? (
            <h2 className="mb-5 font-heading text-h2 display-stretch">
              {SETTINGS.find((s) => s.href === path)?.label}
            </h2>
          ) : null}
          {children}
        </div>
      </div>
    </div>
  )
}
export function Saved({ show }: { show: boolean }) {
  return (
    <span role="status" className="text-detail font-semibold text-success">
      {show ? "Saved" : ""}
    </span>
  )
}
