"use client"
import { useRouter } from "next/navigation"
import { useEffect, useMemo, useState } from "react"
import { CheckInPass } from "@/components/app/check-in-pass"
import { canSee, NAV } from "@/components/app/nav"
import { useApp } from "@/components/app/use-app"
import {
  CalendarDays,
  CircleHelp,
  CreditCard,
  Gift,
  Grid2x2,
  MapPin,
  QrCode,
  Search,
  Snowflake,
  Ticket,
  User,
} from "@/components/icons"
import { Modal } from "@/components/kit/overlays"
import { CheckRow, FormField, Kbd, Segmented } from "@/components/kit/ui"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  createTeenRequest,
  createTeenTitleRequest,
  giveFeedback,
  resolveRequest,
  setPrefs,
  updateCard,
} from "@/lib/actions"
import { announce } from "@/lib/announce"
import { CLUBS, COACHES, INSTRUCTOR_BY_ID } from "@/lib/data/catalog"
import { sessionsRange } from "@/lib/data/sessions"
import { householdOf } from "@/lib/engine"
import { addDays, DOW, dayStart, fmtDowTime, MONTHS, parts } from "@/lib/time"
import { toast } from "@/lib/toast"
import { closeDialog, openDialog, useDialog } from "@/lib/ui-state"
import { cn } from "@/lib/utils"

function PassDialog() {
  const open = useDialog("pass")
  const { s, me, now } = useApp()
  const hh = householdOf(s, me.id)
  const [who, setWho] = useState(me.id)
  const people = Object.values(s.members).filter(
    (m) =>
      m.householdId === hh.id && (me.role === "teen" ? m.id === me.id : true)
  )
  const m = s.members[people.some((p) => p.id === who) ? who : me.id]
  return (
    <Modal
      open={!!open}
      onOpenChange={(o) => !o && closeDialog("pass")}
      title="Check-in pass"
      hideTitle
      className="!w-[min(392px,calc(100vw-24px))] !p-3"
    >
      {people.length > 1 ? (
        <Segmented
          label="Show pass for"
          value={m.id}
          onChange={setWho}
          options={people.map((p) => ({ value: p.id, label: p.firstName }))}
          size="sm"
        />
      ) : null}
      <CheckInPass s={s} member={m} now={now} />
    </Modal>
  )
}

const CARD_BRAND = (n: string) =>
  (n.startsWith("4")
    ? "visa"
    : n.startsWith("5") || n.startsWith("2")
      ? "mastercard"
      : n.startsWith("3")
        ? "amex"
        : "discover") as "visa" | "mastercard" | "amex" | "discover"
function CardDialog() {
  const open = useDialog("card")
  const { s, me, now } = useApp()
  const hh = householdOf(s, me.id)
  const [num, setNum] = useState("")
  const [exp, setExp] = useState("")
  const [cvc, setCvc] = useState("")
  const [zip, setZip] = useState("")
  const [use, setUse] = useState(true)
  const [err, setErr] = useState<Record<string, string>>({})
  const [busy, setBusy] = useState(false)
  const reset = () => {
    setNum("")
    setExp("")
    setCvc("")
    setZip("")
    setErr({})
  }
  const submit = async () => {
    const e: Record<string, string> = {}
    const digits = num.replace(/\D/g, "")
    if (digits.length < 13 || digits.length > 19)
      e.num = "Check the card number."
    const m = exp.match(/^(\d{2})\s*\/?\s*(\d{2})$/)
    const mm = m ? Number(m[1]) : 0
    const yy = m ? Number(m[2]) : 0
    const p = parts(now)
    if (!m || mm < 1 || mm > 12) e.exp = "Enter the expiry as MM/YY."
    else if (2000 + yy < p.y || (2000 + yy === p.y && mm < p.m + 1))
      e.exp = `That card has expired. Use a card that's valid after ${MONTHS[p.m]} ${p.y}.`
    if (!/^\d{3,4}$/.test(cvc)) e.cvc = "Check the security code."
    if (!/^\d{5}$/.test(zip)) e.zip = "Enter a 5-digit ZIP code."
    else if (zip === "00000") e.zip = "The ZIP code doesn't match the card."
    setErr(e)
    if (Object.keys(e).length) return
    setBusy(true)
    await new Promise((r) => setTimeout(r, 700))
    const r = updateCard({
      brand: CARD_BRAND(digits),
      last4: digits.slice(-4),
      expMonth: mm,
      expYear: yy,
    })
    setBusy(false)
    if (!r.ok) {
      setErr({ form: r.message })
      return
    }
    const b = CARD_BRAND(digits)
    toast({
      title: `Card updated: ${b[0].toUpperCase() + b.slice(1)} ending ${digits.slice(-4)}`,
      description: r.recovered
        ? "Retrying your payment now. Paid. Your membership is active."
        : undefined,
    })
    announce("Card updated.")
    reset()
    closeDialog("card")
  }
  return (
    <Modal
      open={!!open}
      onOpenChange={(o) => {
        if (!o) {
          closeDialog("card")
          reset()
        }
      }}
      title="Update payment method"
      description={`Now on file: ${hh.card.brand[0].toUpperCase()}${hh.card.brand.slice(1)} ending ${hh.card.last4}. Card details go straight to our payment provider.`}
    >
      <form
        className="flex flex-col gap-3"
        onSubmit={(ev) => {
          ev.preventDefault()
          void submit()
        }}
        noValidate
      >
        {err.form ? (
          <p
            role="alert"
            className="rounded-md bg-danger-subtle px-3 py-2 text-caption font-semibold"
          >
            {err.form}
          </p>
        ) : null}
        <FormField
          label="Card number"
          error={err.num}
          help="Test tip: use 4000 0000 0000 0002 to see a declined card."
        >
          {(p) => (
            <Input
              {...p}
              inputMode="numeric"
              autoComplete="cc-number"
              placeholder="1234 1234 1234 1234"
              value={num}
              onChange={(e) => setNum(e.target.value)}
            />
          )}
        </FormField>
        <div className="grid grid-cols-3 gap-3">
          <FormField label="Expiry" error={err.exp}>
            {(p) => (
              <Input
                {...p}
                autoComplete="cc-exp"
                placeholder="MM/YY"
                value={exp}
                onChange={(e) => setExp(e.target.value)}
              />
            )}
          </FormField>
          <FormField label="CVC" error={err.cvc}>
            {(p) => (
              <Input
                {...p}
                autoComplete="cc-csc"
                inputMode="numeric"
                placeholder="123"
                value={cvc}
                onChange={(e) => setCvc(e.target.value)}
              />
            )}
          </FormField>
          <FormField label="ZIP" error={err.zip}>
            {(p) => (
              <Input
                {...p}
                autoComplete="postal-code"
                inputMode="numeric"
                placeholder="85234"
                value={zip}
                onChange={(e) => setZip(e.target.value)}
              />
            )}
          </FormField>
        </div>
        <CheckRow checked={use} onChange={setUse}>
          Use for membership, training and guest passes
        </CheckRow>
        <div className="flex flex-wrap justify-end gap-2 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => closeDialog("card")}
          >
            Cancel
          </Button>
          <Button type="submit" loading={busy}>
            Save card
          </Button>
        </div>
      </form>
    </Modal>
  )
}

function FeedbackDialog() {
  const open = useDialog<string>("feedback")
  const { s } = useApp()
  const b = open ? s.bookings.find((x) => x.id === open) : undefined
  const [note, setNote] = useState("")
  const pick = (r: "great" | "fine" | "not-for-me") => {
    giveFeedback(b!.id, r, note)
    toast({ title: "Thanks. We read every note." })
    setNote("")
    closeDialog("feedback")
  }
  return (
    <Modal
      open={!!b}
      onOpenChange={(o) => !o && closeDialog("feedback")}
      title={`How was ${b?.title ?? "your class"}?`}
      description="This goes to the club, not to other members. There are no stars and no public ratings."
    >
      <FormField label="Anything to add? (optional)">
        {(p) => (
          <Textarea
            {...p}
            rows={3}
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        )}
      </FormField>
      <div className="flex flex-wrap gap-2">
        <Button onClick={() => pick("great")}>Great</Button>
        <Button variant="outline" onClick={() => pick("fine")}>
          Fine
        </Button>
        <Button variant="outline" onClick={() => pick("not-for-me")}>
          Not for me
        </Button>
      </div>
    </Modal>
  )
}

function AskParentDialog() {
  const open = useDialog<string | { title: string }>("askParent")
  const { s, me } = useApp()
  const parent = me.parentId ? s.members[me.parentId] : undefined
  const [note, setNote] = useState("")
  return (
    <Modal
      open={!!open}
      onOpenChange={(o) => !o && closeDialog("askParent")}
      title={`Ask ${parent?.firstName ?? "your parent"} to approve?`}
      description={
        typeof open === "object" && open
          ? `${open.title}. We'll send them this and your note.`
          : "We'll send them the class and your note. They can approve or decline in their inbox. The request lasts 24 hours."
      }
    >
      <FormField label="A short note (optional)">
        {(p) => (
          <Textarea
            {...p}
            rows={3}
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        )}
      </FormField>
      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={() => closeDialog("askParent")}>
          Cancel
        </Button>
        <Button
          onClick={() => {
            const r =
              typeof open === "string"
                ? createTeenRequest(open, note)
                : createTeenTitleRequest(
                    (open as { title: string }).title,
                    note
                  )
            if (!r.ok) toast({ type: "error", title: r.message })
            setNote("")
            closeDialog("askParent")
          }}
        >
          Send request
        </Button>
      </div>
    </Modal>
  )
}

function ApproveDialog() {
  const open = useDialog<string>("approve")
  const { s } = useApp()
  const r = open ? s.requests.find((x) => x.id === open) : undefined
  const teen = r ? s.members[r.teenId] : undefined
  return (
    <Modal
      open={!!r}
      onOpenChange={(o) => !o && closeDialog("approve")}
      title={`Approve ${r?.title ?? ""}?`}
      description={
        teen
          ? `${teen.firstName} asked for this.${r?.note ? ` Note: "${r.note}"` : ""} There is no charge. It books right away and ${teen.firstName} is told.`
          : undefined
      }
    >
      <div className="flex flex-col gap-2">
        <Button
          className="w-full"
          onClick={() => {
            const res = resolveRequest(r!.id, true)
            closeDialog("approve")
            if (!res.ok) toast({ type: "error", title: res.message })
            else announce("Approved.")
          }}
        >
          Approve
        </Button>
        <Button
          variant="outline"
          className="w-full"
          onClick={() => {
            resolveRequest(r!.id, false)
            closeDialog("approve")
            announce("Declined.")
          }}
        >
          Decline
        </Button>
        <Button
          variant="ghost"
          className="w-full"
          onClick={() => closeDialog("approve")}
        >
          Not yet
        </Button>
      </div>
    </Modal>
  )
}

function ShortcutsDialog() {
  const open = useDialog("shortcuts")
  const rows: [string, string][] = [
    ["Open the command menu", "Ctrl / ⌘ K"],
    ["Keyboard shortcuts", "Ctrl / ⌘ /"],
    ["Toggle the sidebar", "Ctrl / ⌘ B"],
    ["Close the top dialog or menu", "Esc"],
    ["Move focus to notifications", "F6"],
  ]
  return (
    <Modal
      open={!!open}
      onOpenChange={(o) => !o && closeDialog("shortcuts")}
      title="Keyboard shortcuts"
    >
      <dl className="rule-rows">
        {rows.map(([a, k]) => (
          <div key={a} className="flex items-center justify-between gap-4 py-3">
            <dt>{a}</dt>
            <dd>
              <Kbd>{k}</Kbd>
            </dd>
          </div>
        ))}
      </dl>
    </Modal>
  )
}

type Cmd = {
  id: string
  group: string
  label: string
  secondary?: string
  href?: string
  run?: () => void
  icon?: typeof Search
}
function CommandMenu() {
  const open = useDialog("command")
  return (
    <Modal
      open={!!open}
      onOpenChange={(o) => !o && closeDialog("command")}
      title="Search"
      hideTitle
      wide
      className="!top-[18%] !translate-y-0 !gap-0 !p-0"
    >
      <CommandBody />
    </Modal>
  )
}

function CommandBody() {
  const router = useRouter()
  const { me, club, now, hh } = useApp()
  const [q, setQ] = useState("")
  const [idx, setIdx] = useState(0)
  const items = useMemo<Cmd[]>(() => {
    const query = q.trim().toLowerCase()
    const out: Cmd[] = []
    if (!query) {
      out.push(
        {
          id: "s1",
          group: "Suggestions",
          label: "Show my pass",
          icon: QrCode,
          run: () => openDialog("pass"),
        },
        {
          id: "s2",
          group: "Suggestions",
          label: "Book a class",
          href: "/schedule",
          icon: CalendarDays,
        }
      )
      if (me.role !== "teen")
        out.push(
          {
            id: "s3",
            group: "Suggestions",
            label: "Reserve a court",
            href: "/reserve/courts",
            icon: Grid2x2,
          },
          {
            id: "s4",
            group: "Suggestions",
            label: "Freeze membership",
            href: "/membership/freeze",
            icon: Snowflake,
          }
        )
      return out.filter(
        (c) => me.role !== "teen" || !/Freeze|court/.test(c.label)
      )
    }
    const toks = query.split(/\s+/)
    const dayWords: Record<string, number> = {
      sun: 0,
      mon: 1,
      tue: 2,
      wed: 3,
      thu: 4,
      fri: 5,
      sat: 6,
    }
    const fixedDays: number[] = []
    const words: string[] = []
    for (const t of toks) {
      if (t === "tomorrow") fixedDays.push(parts(addDays(now, 1)).dow)
      else if (t === "today") fixedDays.push(parts(now).dow)
      else if (
        dayWords[t.slice(0, 3)] !== undefined &&
        t.length >= 3 &&
        /^(sun|mon|tue|wed|thu|fri|sat)/.test(t)
      )
        fixedDays.push(dayWords[t.slice(0, 3)])
      else words.push(t)
    }
    const ses = sessionsRange(club, dayStart(now), 9)
      .filter((x) => x.start > now)
      .filter((x) => {
        const text =
          `${x.name} ${INSTRUCTOR_BY_ID[x.instructorId]?.name} ${x.category}`.toLowerCase()
        return (
          words.every((w) => text.includes(w)) &&
          (!fixedDays.length || fixedDays.includes(parts(x.start).dow))
        )
      })
    for (const x of ses.slice(0, 8))
      out.push({
        id: x.id,
        group: "Sessions",
        label: `${x.name} · ${fmtDowTime(x.start)}`,
        secondary: `${x.studio} · ${INSTRUCTOR_BY_ID[x.instructorId]?.name}`,
        href: `/schedule/${x.id}`,
        icon: Ticket,
      })
    for (const c of CLUBS)
      if (c.name.toLowerCase().includes(query))
        out.push({
          id: c.slug,
          group: "Clubs",
          label: c.name,
          secondary: c.address,
          href: `/clubs/${c.slug}`,
          icon: MapPin,
        })
    for (const c of COACHES)
      if (`${c.name} ${c.specialties.join(" ")}`.toLowerCase().includes(query))
        out.push({
          id: c.slug,
          group: "Coaches",
          label: c.name,
          secondary: c.specialties.join(", "),
          href: `/training/coaches/${c.slug}`,
          icon: User,
        })
    for (const n of NAV)
      if (canSee(me, n.href) && n.label.toLowerCase().includes(query))
        out.push({
          id: n.href,
          group: "Pages",
          label: n.label,
          href: n.href,
          icon: n.icon as typeof Search,
        })
    const actions: Cmd[] = [
      {
        id: "a1",
        group: "Actions",
        label: "Update payment method",
        icon: CreditCard,
        run: () => openDialog("card"),
      },
      {
        id: "a2",
        group: "Actions",
        label: "Send a guest pass",
        href: "/guest-passes",
        icon: Gift,
      },
      {
        id: "a3",
        group: "Actions",
        label: "Show my pass",
        icon: QrCode,
        run: () => openDialog("pass"),
      },
    ].filter((a) => me.role !== "teen" && a.label.toLowerCase().includes(query))
    out.push(...actions)
    if ("help".includes(query) || "call".includes(query))
      out.push({
        id: "h1",
        group: "Help",
        label: "Help centre",
        href: "/help",
        icon: CircleHelp,
      })
    void hh
    return out
  }, [q, club, now, me, hh])
  const choose = (c: Cmd) => {
    closeDialog("command")
    if (c.run) c.run()
    else if (c.href) router.push(c.href)
  }
  let lastGroup = ""
  return (
    <>
      <div className="flex items-center gap-2 px-4 pt-3 pb-2">
        <Search className="size-5 text-muted-foreground" aria-hidden="true" />
        <input
          // biome-ignore lint/a11y/noAutofocus: the command palette opens ready to type, so focus on the field is intended
          autoFocus
          role="combobox"
          aria-expanded="true"
          aria-controls="cmd-list"
          aria-activedescendant={
            items[idx] ? `cmd-${items[idx].id}` : undefined
          }
          aria-label="Search classes, clubs, coaches"
          className="h-11 flex-1 bg-transparent text-body outline-none placeholder:text-muted-foreground"
          placeholder="Search classes, clubs, coaches"
          value={q}
          onChange={(e) => {
            setQ(e.target.value)
            setIdx(0)
          }}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") {
              e.preventDefault()
              setIdx((i) => Math.min(items.length - 1, i + 1))
            } else if (e.key === "ArrowUp") {
              e.preventDefault()
              setIdx((i) => Math.max(0, i - 1))
            } else if (e.key === "Enter" && items[idx]) {
              e.preventDefault()
              choose(items[idx])
            }
          }}
        />
      </div>
      <ul
        id="cmd-list"
        // biome-ignore lint/a11y/noNoninteractiveElementToInteractiveRole: list markup and divider styling are kept, the role names the widget
        role="listbox"
        aria-label="Results"
        className="max-h-[55vh] overflow-y-auto pb-2 rule-t"
      >
        {items.map((c, i) => {
          const head = c.group !== lastGroup
          lastGroup = c.group
          const Icon = c.icon ?? Search
          return (
            <li key={c.id + c.group} role="presentation">
              {head ? (
                <p
                  className="px-4 pt-3 pb-1 eyebrow text-muted-foreground"
                  role="presentation"
                >
                  {c.group}
                </p>
              ) : null}
              {/* biome-ignore lint/a11y/useFocusableInteractive: focus stays on the combobox input, the option is chosen through aria-activedescendant */}
              {/* biome-ignore lint/a11y/useKeyWithClickEvents: the combobox input handles arrows and Enter, options are driven by aria-activedescendant */}
              <div
                id={`cmd-${c.id}`}
                role="option"
                aria-selected={i === idx}
                onMouseMove={() => setIdx(i)}
                onClick={() => choose(c)}
                className={cn(
                  "mx-2 flex min-h-11 cursor-pointer items-center gap-3 rounded-md px-3 py-2",
                  i === idx && "bg-accent"
                )}
              >
                <Icon
                  className="size-4 shrink-0 text-muted-foreground"
                  aria-hidden="true"
                />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-label">{c.label}</span>
                  {c.secondary ? (
                    <span className="block truncate text-detail text-muted-foreground">
                      {c.secondary}
                    </span>
                  ) : null}
                </span>
                <span className="text-detail text-muted-foreground">Open</span>
              </div>
            </li>
          )
        })}
        {!items.length ? (
          <li className="px-4 py-6">
            <p className="text-label">No results for &ldquo;{q}&rdquo;.</p>
            <p className="text-caption text-muted-foreground">
              Try &ldquo;cycle&rdquo;, &ldquo;sat yoga&rdquo; or a club name.
            </p>
          </li>
        ) : null}
      </ul>
    </>
  )
}

export function GlobalDialogs() {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const mod = e.metaKey || e.ctrlKey
      if (mod && e.key.toLowerCase() === "k") {
        e.preventDefault()
        openDialog("command")
      } else if (mod && e.key === "/") {
        e.preventDefault()
        openDialog("shortcuts")
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [])
  return (
    <>
      <PassDialog />
      <CommandMenu />
      <CardDialog />
      <FeedbackDialog />
      <ApproveDialog />
      <AskParentDialog />
      <ShortcutsDialog />
    </>
  )
}
void DOW
void setPrefs
