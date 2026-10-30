import {
  CalendarDays,
  CircleHelp,
  CreditCard,
  Gift,
  Grid2x2,
  type IconComponent,
  IdCard,
  Inbox,
  MapPin,
  Settings,
  Sun,
  Ticket,
  TrendingUp,
  Users,
} from "@/components/icons"
import { RibBarbell } from "@/components/kit/icons"
import type { Member } from "@/lib/types"

export interface NavItem {
  href: string
  label: string
  icon: IconComponent | ((p: React.ComponentProps<"svg">) => React.JSX.Element)
  group?: "BOOK" | "EXPLORE" | "ACCOUNT"
  footer?: boolean
}
export const NAV: NavItem[] = [
  { href: "/today", label: "Today", icon: Sun },
  { href: "/schedule", label: "Schedule", icon: CalendarDays },
  { href: "/bookings", label: "My bookings", icon: Ticket },
  { href: "/reserve", label: "Reserve", icon: Grid2x2, group: "BOOK" },
  {
    href: "/training",
    label: "Training",
    icon: RibBarbell as unknown as IconComponent,
    group: "BOOK",
  },
  { href: "/clubs", label: "Clubs", icon: MapPin, group: "EXPLORE" },
  { href: "/progress", label: "Progress", icon: TrendingUp, group: "EXPLORE" },
  { href: "/family", label: "Family", icon: Users, group: "ACCOUNT" },
  { href: "/membership", label: "Membership", icon: IdCard, group: "ACCOUNT" },
  { href: "/billing", label: "Billing", icon: CreditCard, group: "ACCOUNT" },
  {
    href: "/guest-passes",
    label: "Guest passes",
    icon: Gift,
    group: "ACCOUNT",
  },
  { href: "/inbox", label: "Inbox", icon: Inbox, footer: true },
  { href: "/settings", label: "Settings", icon: Settings, footer: true },
  { href: "/help", label: "Help", icon: CircleHelp, footer: true },
]

export function canSee(m: Member, href: string): boolean {
  const role = m.role
  switch (href) {
    case "/family":
      return role === "primary" || role === "adult"
    case "/membership":
      return role === "primary" || role === "adult"
    case "/billing":
      return role === "primary"
    case "/guest-passes":
      return role === "primary" || role === "adult"
    case "/reserve":
      return true
    default:
      return true
  }
}
// Whether a signed-in member may open a path. A direct URL that fails this shows the 403 page.
export function canOpen(
  m: Member,
  path: string
): { ok: true } | { ok: false; reason: string } {
  const p = path.replace(/\/$/, "")
  const parent = m.role === "teen"
  const no = (reason: string) => ({ ok: false as const, reason })
  if (p.startsWith("/billing"))
    return m.role === "primary"
      ? { ok: true }
      : no(
          parent
            ? "Your parent manages billing."
            : "The primary member manages billing."
        )
  if (p.startsWith("/membership/") && m.role !== "primary")
    return no(
      parent
        ? "Your parent manages the membership."
        : "The primary member manages the plan."
    )
  if (p === "/membership" && parent)
    return no("Your parent manages the membership.")
  if (p.startsWith("/family"))
    return m.role === "primary" || (m.role === "adult" && p === "/family")
      ? { ok: true }
      : no(
          parent
            ? "Your parent manages the family plan."
            : "The primary member manages the family plan."
        )
  if (p.startsWith("/guest-passes"))
    return m.role === "teen"
      ? no("Guest passes are managed by your parent.")
      : { ok: true }
  if (p === "/reserve/kids-club")
    return m.role === "primary" || m.role === "adult"
      ? { ok: true }
      : no("Kids club is booked by a parent.")
  if (
    p.includes("/book") &&
    p.startsWith("/training/coaches") &&
    m.role === "teen"
  )
    return { ok: true }
  return { ok: true }
}
