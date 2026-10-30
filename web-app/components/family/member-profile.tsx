"use client"
import Link from "next/link"
import { notFound, useRouter } from "next/navigation"
import { useState } from "react"
import { useApp } from "@/components/app/use-app"
import { Collapsible } from "@/components/graphical"
import { ChevronDown } from "@/components/icons"
import {
  Banner,
  CheckRow,
  FormField,
  PageHeader,
  PersonAvatar,
  SectionTitle,
  SwitchRow,
} from "@/components/kit/ui"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  removeFamilyMember,
  setTeenPermission,
  updateMember,
} from "@/lib/actions"
import { householdMembers, nextBillingDate } from "@/lib/engine"
import { DAY, fmtDayShort, fmtDowTime } from "@/lib/time"
import { toast } from "@/lib/toast"

export default function MemberProfile({ id }: { id: string }) {
  const { s, me, hh, now } = useApp()
  const router = useRouter()
  const m = s.members[id]
  const [saved, setSaved] = useState("")
  const [first, setFirst] = useState(m?.firstName ?? "")
  const [last, setLast] = useState(m?.lastName ?? "")
  const [notes, setNotes] = useState(m?.allergyNotes ?? "")
  if (!m || m.householdId !== hh.id) notFound()
  const mark = (t: string) => {
    setSaved(t)
    setTimeout(() => setSaved(""), 3000)
  }
  const next = s.bookings
    .filter(
      (b) => b.memberId === m.id && b.status === "booked" && b.start > now
    )
    .sort((a, b) => a.start - b.start)
  const visits = s.visits.filter(
    (v) => v.memberId === m.id && now - v.at < 30 * DAY
  ).length
  const adults = householdMembers(s, hh.id).filter(
    (x) => x.role === "primary" || x.role === "adult"
  )
  if (me.role !== "primary")
    return (
      <Banner tone="neutral" title="Only the primary member edits profiles." />
    )
  return (
    <div className="flex max-w-2xl flex-col gap-8">
      <PageHeader
        backHref="/family"
        backLabel="Family"
        eyebrow={
          m.role === "primary"
            ? "Primary member"
            : m.role === "adult"
              ? "Adult"
              : m.role === "teen"
                ? "Teen"
                : "Child"
        }
        title={`${m.firstName} ${m.lastName}`}
        description={`Age ${m.age} · member number ${m.memberNumber}`}
      />
      <p role="status" className="text-caption text-success">
        {saved}
      </p>
      <section aria-labelledby="pr" className="flex flex-col gap-4">
        <SectionTitle id="pr">Profile</SectionTitle>
        <div className="flex items-center gap-4">
          <PersonAvatar
            name={`${m.firstName} ${m.lastName}`}
            hue={m.hue}
            size={72}
          />
          <Button variant="outline" size="sm" disabled>
            Add a photo · Coming soon
          </Button>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="First name">
            {(p) => (
              <Input
                {...p}
                value={first}
                onChange={(e) => setFirst(e.target.value)}
                onBlur={() => {
                  updateMember(m.id, { firstName: first })
                  mark("Saved")
                }}
              />
            )}
          </FormField>
          <FormField label="Last name">
            {(p) => (
              <Input
                {...p}
                value={last}
                onChange={(e) => setLast(e.target.value)}
                onBlur={() => {
                  updateMember(m.id, { lastName: last })
                  mark("Saved")
                }}
              />
            )}
          </FormField>
        </div>
        <FormField label="Date of birth" help="Read-only after it is set.">
          {(p) => <Input {...p} readOnly className="num" value={m.dob} />}
        </FormField>
      </section>
      {m.role === "child" ? (
        <section aria-labelledby="hn" className="flex flex-col gap-3">
          <SectionTitle id="hn">Health notes</SectionTitle>
          <FormField
            label="Allergies and medical notes"
            help="We share these with kids club staff."
          >
            {(p) => (
              <Textarea
                {...p}
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                onBlur={() => {
                  updateMember(m.id, {
                    allergyNotes: notes.trim() || undefined,
                  })
                  mark("Saved")
                }}
              />
            )}
          </FormField>
        </section>
      ) : null}
      {m.role === "child" ? (
        <section aria-labelledby="pu" className="flex flex-col gap-3">
          <SectionTitle id="pu">Authorised pick-up adults</SectionTitle>
          {adults.map((a) => (
            <CheckRow
              key={a.id}
              checked={!!m.pickup?.includes(a.id)}
              onChange={(on) => {
                updateMember(m.id, {
                  pickup: on
                    ? [...(m.pickup ?? []), a.id]
                    : (m.pickup ?? []).filter((x) => x !== a.id),
                })
                mark("Saved")
              }}
            >
              {a.firstName} {a.lastName}
            </CheckRow>
          ))}
        </section>
      ) : null}
      {m.role === "teen" ? (
        <section
          id="permissions"
          aria-labelledby="pe"
          className="flex flex-col gap-3"
        >
          <SectionTitle id="pe">Permissions</SectionTitle>
          <SwitchRow
            checked={m.permissions?.classes ?? true}
            onChange={(c) => {
              setTeenPermission(m.id, "classes", c)
              mark("Saved")
            }}
          >
            Classes (Teen OK)
          </SwitchRow>
          <SwitchRow
            checked={!!m.permissions?.courts}
            onChange={(c) => {
              setTeenPermission(m.id, "courts", c)
              mark("Saved")
            }}
          >
            Court reservations
          </SwitchRow>
          <SwitchRow
            checked={!!m.permissions?.lanes}
            disabled={m.age < 14}
            onChange={(c) => {
              setTeenPermission(m.id, "lanes", c)
              mark("Saved")
            }}
          >
            Lap lanes (14 and up)
          </SwitchRow>
          <SwitchRow
            checked={m.permissions?.coachMessages ?? true}
            onChange={(c) => {
              setTeenPermission(m.id, "coachMessages", c)
              mark("Saved")
            }}
          >
            Teen can message coaches
          </SwitchRow>
          <p className="text-detail text-muted-foreground">
            You can see their bookings and check-ins.
          </p>
        </section>
      ) : null}
      <section aria-labelledby="ac">
        <SectionTitle id="ac">Activity</SectionTitle>
        <p className="mt-2 text-body">
          <span className="num">{visits}</span> visits this month ·{" "}
          <span className="num">{next.length}</span> upcoming
        </p>
        {next.slice(0, 3).map((b) => (
          <p key={b.id} className="num text-caption text-muted-foreground">
            {fmtDowTime(b.start)} · {b.title}
          </p>
        ))}
        <Button
          variant="outline"
          size="sm"
          className="mt-3"
          render={<Link href="/pass" />}
        >
          Show pass
        </Button>
      </section>
      {m.role !== "primary" ? (
        <Collapsible.Root className="pt-4 rule-t">
          <Collapsible.Trigger className="group flex min-h-11 w-full items-center justify-between !bg-transparent !p-0 text-label text-destructive !shadow-none">
            Remove {m.firstName}
            <ChevronDown
              className="size-4 transition-transform group-data-[panel-open]:rotate-180"
              aria-hidden="true"
            />
          </Collapsible.Trigger>
          <Collapsible.Content className="pt-2">
            <p className="mb-3 text-caption text-muted-foreground">
              {m.firstName}&apos;s access ends{" "}
              {fmtDayShort(nextBillingDate(hh, now))}. Bookings after that are
              cancelled with no strike. No refund this month.
            </p>
            <Button
              variant="destructive"
              onClick={() => {
                removeFamilyMember(m.id)
                toast({
                  title: `${m.firstName} will be removed ${fmtDayShort(nextBillingDate(hh, now))}`,
                })
                router.push("/family")
              }}
            >
              Remove {m.firstName}
            </Button>
          </Collapsible.Content>
        </Collapsible.Root>
      ) : null}
    </div>
  )
}
