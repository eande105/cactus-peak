"use client"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { useApp } from "@/components/app/use-app"
import { Menu } from "@/components/graphical"
import { MoreHorizontal } from "@/components/icons"
import { Confirm, Modal } from "@/components/kit/overlays"
import {
  Banner,
  CheckRow,
  EmptyState,
  FormField,
  LoadingBlock,
  PageHeader,
  SectionTitle,
  SelectBox,
  StatusPill,
} from "@/components/kit/ui"
import { Stepper } from "@/components/reserve/common"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  cancelGuestPass,
  editGuestContact,
  resendGuestPass,
  sendGuestPass,
} from "@/lib/actions"
import { announce } from "@/lib/announce"
import { CLUB_BY_SLUG, CLUBS, PLANS } from "@/lib/data/catalog"
import { guestPassesLeft } from "@/lib/engine"
import {
  addDays,
  DAY,
  dateKey,
  dayStart,
  fmtDay,
  fmtDayShort,
  fmtMoney,
  fromKey,
} from "@/lib/time"
import { toast } from "@/lib/toast"
import type { GuestPass } from "@/lib/types"

function SendDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (o: boolean) => void
}) {
  const { s, hh, now, club } = useApp()
  const { left } = guestPassesLeft(s, hh.id, now)
  const [name, setName] = useState("")
  const [contact, setContact] = useState("")
  const [clubSlug, setClubSlug] = useState(club)
  const [date, setDate] = useState(dateKey(addDays(dayStart(now), 4)))
  const [teen, setTeen] = useState(false)
  const [msg, setMsg] = useState("")
  const [count, setCount] = useState(1)
  const [err, setErr] = useState<Record<string, string>>({})
  const [done, setDone] = useState<{ until: number; paid: number } | null>(null)
  const [busy, setBusy] = useState(false)
  const reset = () => {
    setName("")
    setContact("")
    setDone(null)
    setErr({})
    setCount(1)
    setTeen(false)
    setMsg("")
  }
  const buying = left <= 0 || count > left
  const submit = async () => {
    const e: Record<string, string> = {}
    if (!name.trim()) e.name = "Enter your guest's name."
    if (!/^\S+@\S+\.\S+$/.test(contact) && !/^\D*(\d\D*){10}$/.test(contact))
      e.contact =
        "Check the email or mobile number. Use 10 digits for a mobile."
    const d = fromKey(date)
    if (!date || d < dayStart(now) || d > dayStart(now) + 14 * DAY)
      e.date = "Pick a date in the next 14 days."
    setErr(e)
    if (Object.keys(e).length) return
    setBusy(true)
    await new Promise((r) => setTimeout(r, 600))
    const r = sendGuestPass({
      name: name.trim(),
      contact,
      clubSlug,
      visitDate: d,
      message: msg,
      count: left <= 0 ? count : 1,
    })
    setBusy(false)
    if (r.ok) {
      setDone({ until: r.validUntil, paid: r.paid })
      announce(`Pass sent to ${name.split(" ")[0]}.`)
    } else setErr({ form: r.message })
  }
  const link = `https://my.cactuspeakathletic.example/g/${name.toLowerCase().replace(/\W+/g, "") || "guest"}`
  return (
    <Modal
      open={open}
      onOpenChange={(o) => {
        onOpenChange(o)
        if (!o) reset()
      }}
      title={done ? `Pass sent to ${name.split(" ")[0]}` : "Send a guest pass"}
      description={
        done
          ? `Valid until ${fmtDayShort(done.until)}.`
          : "One visit, one club. Guests are 18 or older, or 16 and 17 with a parent."
      }
    >
      {done ? (
        <div className="flex flex-col gap-4">
          <StatusPill tone="success" className="w-fit">
            Sent
          </StatusPill>
          <div className="flex gap-2">
            <Input
              readOnly
              aria-label="Guest pass link"
              value={link}
              onFocus={(e) => e.currentTarget.select()}
            />
            <Button
              variant="outline"
              onClick={() => {
                void navigator.clipboard?.writeText(link)
                toast({ title: "Link copied" })
              }}
            >
              Copy link
            </Button>
          </div>
          {done.paid ? (
            <p className="text-caption text-muted-foreground">
              Charged {fmtMoney(20 * done.paid)} to {hh.card.brand} ending{" "}
              {hh.card.last4}.
            </p>
          ) : null}
          <div className="flex justify-between">
            <button
              type="button"
              className="text-link min-h-11 text-label underline"
              onClick={() => {
                reset()
              }}
            >
              Send another
            </button>
            <Button
              onClick={() => {
                onOpenChange(false)
                reset()
              }}
            >
              Done
            </Button>
          </div>
        </div>
      ) : (
        <form
          className="flex flex-col gap-3"
          onSubmit={(e) => {
            e.preventDefault()
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
          <FormField label="Guest's name" error={err.name}>
            {(p) => (
              <Input
                {...p}
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="off"
              />
            )}
          </FormField>
          <FormField
            label="Guest's email or mobile number"
            help="We send the pass here."
            error={err.contact}
          >
            {(p) => (
              <Input
                {...p}
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                autoComplete="off"
              />
            )}
          </FormField>
          <div className="grid gap-3 sm:grid-cols-2">
            <SelectBox
              label="Club"
              value={clubSlug}
              onChange={setClubSlug}
              options={CLUBS.map((c) => ({ value: c.slug, label: c.name }))}
            />
            <FormField
              label="Visit date"
              help="Within 14 days."
              error={err.date}
            >
              {(p) => (
                <Input
                  {...p}
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              )}
            </FormField>
          </div>
          <CheckRow checked={teen} onChange={setTeen}>
            My guest is 16 or 17
          </CheckRow>
          {teen ? (
            <p className="text-caption text-muted-foreground">
              A parent or guardian signs a waiver.
            </p>
          ) : null}
          {left <= 0 ? (
            <Stepper
              label="How many guests?"
              value={count}
              min={1}
              max={4}
              onChange={setCount}
            />
          ) : null}
          <FormField label="Message (optional)" help="200 characters.">
            {(p) => (
              <Textarea
                {...p}
                rows={2}
                maxLength={200}
                value={msg}
                onChange={(e) => setMsg(e.target.value)}
              />
            )}
          </FormField>
          <p className="rounded-md bg-muted px-3 py-2 text-caption">
            {buying
              ? `Costs $20 per guest. Charged to ${hh.card.brand} ending ${hh.card.last4}.`
              : `Uses 1 of ${PLANS[hh.plan].guestPasses} included passes.`}
          </p>
          <div className="flex justify-end gap-2 pt-1">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" loading={busy}>
              {buying
                ? `Pay ${fmtMoney(20 * (left <= 0 ? count : 1), false)} and send`
                : "Send guest pass"}
            </Button>
          </div>
        </form>
      )}
    </Modal>
  )
}

export default function GuestPasses({ openSend }: { openSend?: boolean }) {
  const { s, me, hh, now } = useApp()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [send, setSend] = useState(!!openSend)
  const [cancel, setCancel] = useState<GuestPass | null>(null)
  const [edit, setEdit] = useState<GuestPass | null>(null)
  const [contact, setContact] = useState("")
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 300)
    return () => clearTimeout(t)
  }, [])
  if (me.role === "teen") return null
  if (loading) return <LoadingBlock text="Loading guest passes…" rows={3} />
  const { included, left } = guestPassesLeft(s, hh.id, now)
  const passes = s.guestPasses
    .filter((g) => g.householdId === hh.id)
    .map((g) =>
      g.status === "sent" && g.validUntil < now
        ? { ...g, status: "expired" as const }
        : g
    )
    .sort((a, b) => b.sentAt - a.sentAt)
  const frozen = hh.status === "frozen"
  const trail = hh.plan === "trailhead"
  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Guest passes"
        description="Bring a friend for one visit."
        actions={
          <Button disabled={frozen} onClick={() => setSend(true)}>
            {trail && left <= 0 ? "Buy a guest pass: $20" : "Send a guest pass"}
          </Button>
        }
      />
      {frozen ? (
        <Banner tone="neutral" title="Guest passes pause while frozen." />
      ) : null}
      <div className="grid gap-x-12 gap-y-8 lg:grid-cols-2">
        <section aria-labelledby="bal" className="flex flex-col gap-3">
          <p id="bal" className="eyebrow text-muted-foreground">
            This month
          </p>
          <p className="font-heading text-display leading-none display-stretch">
            <span className="num">{left}</span> of{" "}
            <span className="num">{included}</span> left
          </p>
          {included ? null : (
            <p className="text-body">0 included with {PLANS[hh.plan].name}.</p>
          )}
          <p className="text-caption text-muted-foreground">
            {included
              ? "Resets on your billing date. Unused passes don't roll over."
              : "A day pass is $20 per guest."}{" "}
            {included ? "Need more? A day pass is $20 per guest." : ""}
          </p>
        </section>
        <section aria-labelledby="rl" className="flex flex-col gap-2">
          <p id="rl" className="eyebrow text-muted-foreground">
            How it works
          </p>
          <ul className="text-body rule-rows">
            {[
              "One visit, one club",
              "Guests are 18 or older (16 and 17 with a parent)",
              "Valid 14 days",
              "Guests sign a waiver on their phone",
            ].map((x) => (
              <li key={x} className="py-2.5">
                {x}
              </li>
            ))}
          </ul>
        </section>
      </div>
      <section aria-labelledby="sent">
        <SectionTitle id="sent">Sent</SectionTitle>
        {passes.length ? (
          <ul className="mt-2 rule-rows">
            {passes.map((g) => (
              <li
                key={g.id}
                className="flex flex-wrap items-center gap-x-6 gap-y-1 py-3.5"
              >
                <span className="min-w-0 flex-1 basis-48">
                  <span className="block text-label">{g.guestName}</span>
                  <span className="block text-caption text-muted-foreground">
                    {CLUB_BY_SLUG[g.clubSlug].name} ·{" "}
                    {g.status === "used" && g.usedOn
                      ? `Used ${fmtDayShort(g.usedOn)}`
                      : `${fmtDay(g.visitDate)}`}
                  </span>
                </span>
                <span className="num text-caption text-muted-foreground">
                  Valid until {fmtDayShort(g.validUntil)}
                </span>
                <StatusPill
                  tone={
                    g.status === "used"
                      ? "success"
                      : g.status === "sent" || g.status === "opened"
                        ? "neutral"
                        : "warning"
                  }
                >
                  {g.status === "sent"
                    ? "Sent"
                    : g.status === "opened"
                      ? "Opened"
                      : g.status === "used"
                        ? "Used"
                        : g.status === "cancelled"
                          ? "Cancelled"
                          : "Expired"}
                </StatusPill>
                {g.status === "sent" || g.status === "opened" ? (
                  <Menu.Root>
                    <Menu.Trigger
                      aria-label={`Actions for ${g.guestName}'s pass`}
                      className="!grid !size-11 !place-items-center !bg-transparent !p-0 hover:!bg-muted"
                    >
                      <MoreHorizontal className="size-5" aria-hidden="true" />
                    </Menu.Trigger>
                    <Menu.Portal>
                      <Menu.Positioner align="end" sideOffset={6}>
                        <Menu.Popup>
                          <Menu.Item
                            onClick={() => {
                              resendGuestPass(g.id)
                              toast({
                                title: `Pass sent again to ${g.guestName.split(" ")[0]}`,
                              })
                            }}
                          >
                            Resend
                          </Menu.Item>
                          <Menu.Item
                            onClick={() => {
                              setEdit(g)
                              setContact(g.contact)
                            }}
                          >
                            Edit contact
                          </Menu.Item>
                          <Menu.Item
                            onClick={() => {
                              void navigator.clipboard?.writeText(
                                `https://my.cactuspeakathletic.example/g/${g.id}`
                              )
                              toast({ title: "Link copied" })
                            }}
                          >
                            Copy link
                          </Menu.Item>
                          <Menu.Item
                            className="!text-destructive"
                            onClick={() => setCancel(g)}
                          >
                            Cancel pass
                          </Menu.Item>
                        </Menu.Popup>
                      </Menu.Positioner>
                    </Menu.Portal>
                  </Menu.Root>
                ) : (
                  <span className="size-11" aria-hidden="true" />
                )}
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState
            object="gym-bag"
            title="No guest passes sent yet."
            body="Bring a friend this month."
            action={
              <Button onClick={() => setSend(true)}>Send a guest pass</Button>
            }
          />
        )}
      </section>
      <SendDialog
        open={send}
        onOpenChange={(o) => {
          setSend(o)
          if (!o && openSend) router.replace("/guest-passes")
        }}
      />
      <Confirm
        open={!!cancel}
        onOpenChange={(o) => !o && setCancel(null)}
        title="Cancel this pass?"
        description={
          cancel
            ? `${cancel.guestName} won't be able to use this link. ${cancel.bought ? "We'll refund $20.00." : "We'll return the pass to your balance."}`
            : undefined
        }
      >
        <div className="flex flex-col gap-2">
          <Button className="w-full" onClick={() => setCancel(null)}>
            Keep pass
          </Button>
          <Button
            variant="ghost"
            className="w-full !text-destructive"
            onClick={() => {
              cancelGuestPass(cancel!.id)
              toast({ title: "Pass cancelled" })
              setCancel(null)
            }}
          >
            Cancel pass
          </Button>
        </div>
      </Confirm>
      <Modal
        open={!!edit}
        onOpenChange={(o) => !o && setEdit(null)}
        title="Edit contact"
        description={
          edit ? `Update where we send ${edit.guestName}'s pass.` : undefined
        }
      >
        <FormField label="Guest's email or mobile number">
          {(p) => (
            <Input
              {...p}
              value={contact}
              onChange={(e) => setContact(e.target.value)}
            />
          )}
        </FormField>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setEdit(null)}>
            Cancel
          </Button>
          <Button
            onClick={() => {
              editGuestContact(edit!.id, contact)
              toast({ title: "Contact updated" })
              setEdit(null)
            }}
          >
            Save
          </Button>
        </div>
      </Modal>
    </div>
  )
}
