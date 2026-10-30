"use client"
import Link from "next/link"
import { useEffect, useState } from "react"
import { useApp } from "@/components/app/use-app"
import { Menu } from "@/components/graphical"
import { MoreHorizontal, Plus } from "@/components/icons"
import { Confirm } from "@/components/kit/overlays"
import {
  EmptyState,
  LoadingBlock,
  PageHeader,
  PersonAvatar,
  SectionTitle,
  StatusPill,
} from "@/components/kit/ui"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import {
  removeFamilyMember,
  resendInvite,
  undoRemoveMember,
} from "@/lib/actions"
import { PLANS } from "@/lib/data/catalog"
import {
  bookingOf,
  householdMembers,
  householdMonthly,
  nextBillingDate,
} from "@/lib/engine"
import { DAY, fmtDayShort, fmtDowTime, fmtMoney } from "@/lib/time"
import { toast } from "@/lib/toast"
import type { Member } from "@/lib/types"

const ROLE = {
  primary: "Primary",
  adult: "Adult",
  teen: "Teen",
  child: "Child",
} as const

function MemberRow({
  m,
  canEdit,
  onRemove,
}: {
  m: Member
  canEdit: boolean
  onRemove: (m: Member) => void
}) {
  const { s, now, hh } = useApp()
  const next = s.bookings
    .filter(
      (b) => b.memberId === m.id && b.status === "booked" && b.start > now
    )
    .sort((a, b) => a.start - b.start)[0]
  const visits = s.visits.filter(
    (v) => v.memberId === m.id && now - v.at < 30 * DAY
  ).length
  const pill = m.endsOn ? (
    <StatusPill tone="warning">Ends {fmtDayShort(m.endsOn)}</StatusPill>
  ) : m.status === "invited" ? (
    <StatusPill tone="neutral">Invited</StatusPill>
  ) : m.status === "invite_expired" ? (
    <StatusPill tone="warning">Invite expired</StatusPill>
  ) : m.role === "child" && !m.allergyNotes ? (
    <StatusPill tone="warning">Add allergy notes</StatusPill>
  ) : (
    <StatusPill tone="success">Active</StatusPill>
  )
  const stat =
    m.role === "child"
      ? m.allergyNotes
        ? "Kids club ready"
        : "Needs allergy notes"
      : m.role === "teen" && m.permissions
        ? `Classes ${m.permissions.classes ? "on" : "off"} · Courts ${m.permissions.courts ? "on" : "off"} · Lanes ${m.permissions.lanes ? "on" : "off"}`
        : null
  return (
    <li className="flex flex-wrap items-center gap-x-4 gap-y-2 py-4">
      <PersonAvatar
        name={`${m.firstName} ${m.lastName}`}
        hue={m.hue}
        size={56}
      />
      <div className="min-w-0 flex-1 basis-56">
        <p className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <Link
            href={`/family/${m.id}`}
            className="inline-flex min-h-11 items-center text-body-strong hover:underline"
          >
            {m.firstName} {m.lastName}
          </Link>
          {pill}
        </p>
        <p className="text-caption text-muted-foreground">
          {ROLE[m.role]} · {m.age} ·{" "}
          {stat ??
            (m.role === "primary"
              ? "Billing owner"
              : m.status === "invited"
                ? "Invite pending"
                : "Own login and pass")}
        </p>
        <p className="num text-detail text-muted-foreground">
          {next
            ? `Next: ${fmtDowTime(next.start)} ${next.title}`
            : "Nothing booked"}{" "}
          · {visits} visits this month
        </p>
        {m.status === "invited" ? (
          <button
            type="button"
            className="text-link text-detail underline"
            onClick={() => {
              resendInvite(m.id)
              toast({ title: `Reminder sent to ${m.firstName}` })
            }}
          >
            Send a reminder?
          </button>
        ) : null}
      </div>
      {canEdit ? (
        <Menu.Root>
          <Menu.Trigger
            aria-label={`Actions for ${m.firstName}`}
            className="!grid !size-11 !place-items-center !bg-transparent !p-0 hover:!bg-muted"
          >
            <MoreHorizontal className="size-5" aria-hidden="true" />
          </Menu.Trigger>
          <Menu.Portal>
            <Menu.Positioner align="end" sideOffset={6}>
              <Menu.Popup>
                <Menu.Item render={<Link href={`/family/${m.id}`} />}>
                  Edit profile
                </Menu.Item>
                {m.role === "teen" ? (
                  <Menu.Item
                    render={<Link href={`/family/${m.id}#permissions`} />}
                  >
                    Permissions
                  </Menu.Item>
                ) : null}
                <Menu.Item render={<Link href="/pass" />}>Show pass</Menu.Item>
                {m.status === "invited" ? (
                  <Menu.Item onClick={() => resendInvite(m.id)}>
                    Resend invite
                  </Menu.Item>
                ) : null}
                {m.role !== "primary" ? (
                  <Menu.Item
                    className="!text-destructive"
                    onClick={() => onRemove(m)}
                  >
                    Remove
                  </Menu.Item>
                ) : null}
              </Menu.Popup>
            </Menu.Positioner>
          </Menu.Portal>
        </Menu.Root>
      ) : null}
      <span className="sr-only">
        {hh.id}
        {bookingOf.name}
      </span>
    </li>
  )
}

export default function FamilyPage() {
  const { s, me, hh, now } = useApp()
  const [loading, setLoading] = useState(false)
  const [rm, setRm] = useState<Member | null>(null)
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 300)
    return () => clearTimeout(t)
  }, [])
  const members = householdMembers(s, hh.id)
  const m = householdMonthly(s, hh)
  const adults = members.filter(
    (x) => x.role === "primary" || x.role === "adult"
  )
  const kids = members.filter((x) => x.role === "child" || x.role === "teen")
  const canEdit = me.role === "primary"
  if (loading) return <LoadingBlock text="Loading your family…" rows={4} />
  const next = nextBillingDate(hh, now)
  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Family"
        description={`${members.length} members · ${fmtMoney(m.total, false)} per month.`}
        actions={
          canEdit ? (
            <Button render={<Link href="/family/add" />}>
              <Plus aria-hidden="true" data-icon="inline-start" />
              Add a member
            </Button>
          ) : undefined
        }
      />
      <section
        aria-label="Household summary"
        className="grid gap-x-10 gap-y-3 pt-4 rule-t md:grid-cols-[1fr_auto] md:items-end"
      >
        <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-1 text-body">
          <dt className="text-muted-foreground">Plan</dt>
          <dd className="num">
            {PLANS[hh.plan].name} · {fmtMoney(m.base, false)}
          </dd>
          <dt className="text-muted-foreground">Add-ons</dt>
          <dd className="num">
            {m.adults
              ? `${m.adults} ${m.adults === 1 ? "adult" : "adults"} ${fmtMoney(m.adultTotal, false)}`
              : "No adults"}
            {m.kids
              ? ` · ${m.kids} ${m.kids === 1 ? "child" : "children"} ${fmtMoney(19, false)} each = ${fmtMoney(m.kidTotal, false)}`
              : ""}
          </dd>
          <dt className="text-muted-foreground">Total</dt>
          <dd className="num text-body-strong">
            {fmtMoney(m.total, false)} per month
          </dd>
          <dt className="text-muted-foreground">Next charge</dt>
          <dd className="num">{fmtDayShort(next)}</dd>
        </dl>
        {me.role === "primary" ? (
          <Link
            href="/billing"
            className="text-link inline-flex min-h-11 items-center text-label hover:underline"
          >
            Billing
          </Link>
        ) : null}
      </section>
      {members.length === 1 ? (
        <EmptyState
          object="playground"
          title="It's just you for now."
          body="Add a partner or a child."
          action={
            canEdit ? (
              <Button render={<Link href="/family/add" />}>Add a member</Button>
            ) : undefined
          }
        />
      ) : (
        <>
          <section aria-labelledby="ad">
            <SectionTitle
              id="ad"
              action={
                canEdit ? (
                  <Link
                    href="/family/add?who=adult"
                    className="text-link inline-flex min-h-11 min-w-11 items-center justify-center text-label hover:underline"
                  >
                    Add
                  </Link>
                ) : undefined
              }
            >
              Adults
            </SectionTitle>
            <ul className="mt-1 rule-rows">
              {adults.map((x) => (
                <MemberRow
                  key={x.id}
                  m={x}
                  canEdit={canEdit}
                  onRemove={setRm}
                />
              ))}
            </ul>
          </section>
          <section aria-labelledby="ch">
            <SectionTitle
              id="ch"
              action={
                canEdit ? (
                  <Link
                    href="/family/add?who=child"
                    className="text-link inline-flex min-h-11 min-w-11 items-center justify-center text-label hover:underline"
                  >
                    Add
                  </Link>
                ) : undefined
              }
            >
              Children and teens
            </SectionTitle>
            {kids.length ? (
              <ul className="mt-1 rule-rows">
                {kids.map((x) => (
                  <MemberRow
                    key={x.id}
                    m={x}
                    canEdit={canEdit}
                    onRemove={setRm}
                  />
                ))}
              </ul>
            ) : (
              <p className="mt-3 text-muted-foreground">
                No children or teens yet.
              </p>
            )}
          </section>
        </>
      )}
      <section aria-labelledby="fh">
        <SectionTitle id="fh">How it works</SectionTitle>
        <Accordion className="mt-2">
          <AccordionItem value="a">
            <AccordionTrigger>How family pricing works</AccordionTrigger>
            <AccordionContent className="text-muted-foreground">
              Everyone follows the main plan. Add-ons are $39 per adult and $19
              per child or teen, every month. Kids club is included for children
              12 and under.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="b">
            <AccordionTrigger>What teens can do</AccordionTrigger>
            <AccordionContent className="text-muted-foreground">
              Teens 13 to 17 book Teen OK classes. You can turn on court
              reservations and lap lanes (14 and up). Teen personal training
              needs your approval. You can see their bookings and check-ins.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="c">
            <AccordionTrigger>Moving to a new plan</AccordionTrigger>
            <AccordionContent className="text-muted-foreground">
              Upgrades start now and are prorated by day. Downgrades start on
              your next billing date. Everyone moves together.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </section>
      <Confirm
        open={!!rm}
        onOpenChange={(o) => !o && setRm(null)}
        title={`Remove ${rm?.firstName} from your plan?`}
        description={
          rm
            ? `${rm.firstName}'s access ends ${fmtDayShort(next)}. Bookings after that date are cancelled with no late-cancel strike. We don't refund this month.`
            : undefined
        }
      >
        <div className="flex flex-col gap-2">
          <Button className="w-full" onClick={() => setRm(null)}>
            Keep {rm?.firstName}
          </Button>
          <Button
            variant="ghost"
            className="w-full !text-destructive"
            onClick={() => {
              const id = rm!.id
              removeFamilyMember(id)
              toast({
                title: `${rm!.firstName} will be removed ${fmtDayShort(next)}`,
                action: { label: "Undo", onClick: () => undoRemoveMember(id) },
              })
              setRm(null)
            }}
          >
            Remove {rm?.firstName}
          </Button>
        </div>
      </Confirm>
    </div>
  )
}
