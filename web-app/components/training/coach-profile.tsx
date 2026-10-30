"use client"
import Link from "next/link"
import { notFound, useRouter } from "next/navigation"
import { useState } from "react"
import { useApp } from "@/components/app/use-app"
import { CompactClass } from "@/components/booking/class-row"
import { CoachArt } from "@/components/kit/brand-art"
import { PageHeader, SectionTitle } from "@/components/kit/ui"
import { Button } from "@/components/ui/button"
import { ensureThread } from "@/lib/actions"
import {
  CLUB_BY_SLUG,
  COACH_BY_SLUG,
  INSTRUCTORS,
  PT_PACKS,
  PT_PRICE,
} from "@/lib/data/catalog"
import { sessionsRange } from "@/lib/data/sessions"
import { ptOpenSlots } from "@/lib/engine"
import { dayStart, fmtDay, fmtMoney, fmtTime } from "@/lib/time"

export default function CoachProfile({ slug }: { slug: string }) {
  const { s, me, hh, now } = useApp()
  const router = useRouter()
  const c = COACH_BY_SLUG[slug]
  const [busy, setBusy] = useState(false)
  if (!c) notFound()
  const slots = ptOpenSlots(s, slug, now)
  const byDay = slots.slice(0, 8).reduce<Record<number, number[]>>((a, x) => {
    const day = dayStart(x)
    a[day] ??= []
    a[day].push(x)
    return a
  }, {})
  const first = c.name.split(" ")[0]
  const classes = INSTRUCTORS.filter((i) => i.name === c.name).length
    ? sessionsRange(c.clubs[0], dayStart(now), 5)
        .filter((x) => x.instructorId === c.id)
        .slice(0, 3)
    : []
  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        backHref="/training"
        backLabel="Training"
        title={c.name}
        eyebrow={c.specialties.join(" · ")}
        description={`Coaching since ${c.since} · ${c.clubs.map((x) => CLUB_BY_SLUG[x].name).join(", ")}`}
      />
      <div className="grid gap-x-10 gap-y-8 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <div className="flex flex-col gap-8">
          <div className="grid gap-6 sm:grid-cols-[minmax(0,280px)_1fr]">
            <CoachArt
              name={c.name}
              roles={c.specialties}
              shape="square"
              className="aspect-square w-full max-w-[280px] rounded-lg"
            />
            <div className="flex flex-col gap-5">
              <p className="max-w-[58ch] text-body">{c.about}</p>
              <div>
                <p className="mb-2 eyebrow text-muted-foreground">Good for</p>
                <ul className="flex flex-wrap gap-2">
                  {c.goodFor.map((g) => (
                    <li
                      key={g}
                      className="rounded-full bg-muted px-3 py-1 text-caption"
                    >
                      {g}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="mb-2 eyebrow text-muted-foreground">
                  A first session looks like
                </p>
                <ul className="flex flex-col gap-1 text-body">
                  {c.firstSession.map((g) => (
                    <li key={g} className="flex gap-2">
                      <span aria-hidden="true">•</span>
                      {g}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
          <section aria-labelledby="no">
            <SectionTitle id="no">Next open times</SectionTitle>
            {Object.keys(byDay).length ? (
              <div className="mt-3 flex flex-col gap-3">
                {Object.entries(byDay).map(([d, list]) => (
                  <div key={d} className="flex flex-wrap items-center gap-3">
                    <p className="w-28 text-label">{fmtDay(Number(d))}</p>
                    <ul className="flex flex-wrap gap-2">
                      {list.map((t) => (
                        <li key={t}>
                          <Button
                            variant="outline"
                            size="sm"
                            render={
                              <Link
                                href={`/training/coaches/${slug}/book?t=${t}`}
                              />
                            }
                          >
                            <span
                              className="size-2 rounded-full bg-success"
                              aria-hidden="true"
                              data-icon="inline-start"
                            />
                            <span className="num">{fmtTime(t)}</span>
                          </Button>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-3 text-muted-foreground">
                No open times with {first} in the next 14 days. Try another
                coach, or message the front desk.
              </p>
            )}
            <p className="mt-3 text-detail text-muted-foreground">
              Arizona time (no daylight saving)
            </p>
          </section>
          {classes.length ? (
            <section aria-labelledby="ct">
              <SectionTitle id="ct">Classes {first} teaches</SectionTitle>
              <ul className="mt-3 flex flex-wrap gap-6">
                {classes.map((x) => (
                  <li key={x.id}>
                    <CompactClass se={x} />
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </div>
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="flex flex-col gap-3 rounded-lg bg-card p-5 edge ring-border">
            <p className="font-heading text-h3 display-stretch">
              45-minute session
            </p>
            <p className="text-body">
              Single <span className="num">{fmtMoney(PT_PRICE, false)}</span> ·
              Pack from{" "}
              <span className="num">
                {fmtMoney(PT_PACKS[2].price / 12, false)}
              </span>{" "}
              each
            </p>
            <p className="text-caption text-muted-foreground">
              Free to move until 24 hours before.
            </p>
            {hh.plan === "summit" ? (
              <p className="text-caption">
                Use your Summit intro session.{" "}
                <span className="num">{hh.ptIntroLeft}</span> left this quarter.
              </p>
            ) : null}
            {me.role === "teen" ? (
              <p className="text-caption text-muted-foreground">
                Your parent approves training requests.
              </p>
            ) : null}
            <Button
              size="lg"
              render={<Link href={`/training/coaches/${slug}/book`} />}
            >
              Book a session
            </Button>
            <Button
              variant="outline"
              loading={busy}
              onClick={() => {
                setBusy(true)
                const id = ensureThread(`Coach ${c.name}`, "Your first session")
                setTimeout(() => router.push(`/inbox/${id}`), 200)
              }}
            >
              Message {first}
            </Button>
          </div>
        </aside>
      </div>
    </div>
  )
}
