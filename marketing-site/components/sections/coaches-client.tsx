"use client"

import Link from "next/link"
import { useState } from "react"
import { LinkButton } from "@/components/brand/atoms"
import { CoachAvatar } from "@/components/brand/class-parts"
import { useCatalog, useSessions } from "@/components/site/catalog-context"
import { Button } from "@/components/ui/button"
import { CheckRow, SelectBox } from "@/components/ui/controls"
import { dayInfo, fmtTime } from "@/lib/time"
import type { Session } from "@/lib/types"
import { EmptyState } from "./common"

function teachLine(
  sessions: Session[],
  name: string,
  now: { dayNum: number; min: number }
) {
  const s = sessions
    .filter((x) => x.coach === name && (x.day > 0 || x.start >= now.min))
    .slice(0, 2)
  return s.length
    ? "Next: " +
        s
          .map(
            (x) =>
              `${dayInfo(x.day, now.dayNum).short} ${fmtTime(x.start)} at ${x.clubShort}`
          )
          .join(", ")
    : "No classes this week"
}
const any = (label: string, values: string[]) => [
  { value: "", label },
  ...values.map((v) => ({ value: v, label: v })),
]

export function CoachFilter() {
  const { profileCoaches: coaches } = useCatalog()
  const [spec, setSpec] = useState("")
  const list = coaches
    .filter((c) => !spec || c.specialties.includes(spec))
    .slice(0, 4)
  return (
    <div>
      <SelectBox
        inline
        label="Specialty"
        value={spec}
        onChange={setSpec}
        options={any("Any", [
          "Strength",
          "Cycle",
          "Mind & Body",
          "Aqua",
          "Return to training",
          "Youth",
        ])}
      />
      <ul
        className="mt-8 grid grid-cols-2 gap-x-4 gap-y-10 lg:grid-cols-4"
        aria-live="polite"
      >
        {list.map((c) => (
          <li key={c.slug} className="flex flex-col items-start gap-3">
            <CoachAvatar
              slug={c.slug}
              name={c.name}
              className="size-20 md:size-28"
            />
            <div>
              <h3 className="font-display-wide text-h3">
                <Link href={`/coaches/${c.slug}`} className="hover:underline">
                  {c.name}
                </Link>
              </h3>
              <p className="text-body text-muted-foreground">
                {spec && c.specialties.includes(spec) ? spec : c.specialties[0]}
              </p>
            </div>
            <LinkButton
              href={`/tour?coach=${c.slug}&club=${c.clubs[0]}`}
              variant="outline"
              size="sm"
            >
              Book intro
            </LinkButton>
          </li>
        ))}
      </ul>
      {!list.length ? (
        <EmptyState
          title="No coach has that specialty here."
          text="Try another one."
        />
      ) : null}
    </div>
  )
}

export function CoachGrid({
  init,
}: {
  init: { club?: string; specialty?: string }
}) {
  const {
    profileCoaches: coaches,
    clubs,
    classTypes,
    classBySlug,
    clubBySlug,
  } = useCatalog()
  const { sessions, now } = useSessions()
  const specs = [...new Set(coaches.flatMap((c) => c.specialties))].sort()
  const [club, setClub] = useState(init.club ?? "")
  const [spec, setSpec] = useState(init.specialty ?? "")
  const [cls, setCls] = useState("")
  const [pt, setPt] = useState(false)
  const list = coaches.filter(
    (c) =>
      (!club || c.clubs.includes(club)) &&
      (!spec || c.specialties.includes(spec)) &&
      (!cls || c.teaches.includes(cls)) &&
      (!pt || c.pt)
  )
  const reset = () => {
    setClub("")
    setSpec("")
    setCls("")
    setPt(false)
  }
  return (
    <div>
      <div className="flex flex-wrap items-center gap-4">
        <SelectBox
          inline
          label="Club"
          value={club}
          onChange={setClub}
          options={[
            { value: "", label: "All clubs" },
            ...clubs.map((c) => ({ value: c.slug, label: c.name })),
          ]}
        />
        <SelectBox
          inline
          label="Specialty"
          value={spec}
          onChange={setSpec}
          options={any("Any", specs)}
        />
        <SelectBox
          inline
          label="Class"
          value={cls}
          onChange={setCls}
          options={[
            { value: "", label: "Any class" },
            ...classTypes
              .filter((t) => coaches.some((c) => c.teaches.includes(t.slug)))
              .map((c) => ({ value: c.slug, label: c.name })),
          ]}
        />
        <CheckRow checked={pt} onChange={setPt}>
          Takes personal training clients
        </CheckRow>
      </div>
      <p className="mt-3 text-body text-muted-foreground" aria-live="polite">
        {list.length} {list.length === 1 ? "coach" : "coaches"}
      </p>
      {list.length ? (
        <ul className="mt-6 grid border-t-2 border-foreground md:grid-cols-2 md:gap-x-12">
          {list.map((c) => (
            <li
              key={c.slug}
              className="grid grid-cols-[72px_1fr] items-start gap-x-4 border-b border-border py-5 sm:grid-cols-[96px_1fr_auto]"
            >
              <CoachAvatar
                slug={c.slug}
                name={c.name}
                className="size-[72px] sm:size-24"
              />
              <div>
                <h2 className="font-display-wide text-h2">
                  <Link href={`/coaches/${c.slug}`} className="hover:underline">
                    {c.name}
                  </Link>
                </h2>
                <p className="text-body text-muted-foreground">
                  {c.credential || c.specialties.join(", ")}
                </p>
                {c.teaches.length ? (
                  <p className="mt-2 text-body">
                    Favorite classes:{" "}
                    {c.teaches
                      .slice(0, 2)
                      .map((t) => classBySlug(t)?.name)
                      .filter(Boolean)
                      .join(", ")}
                  </p>
                ) : null}
                <p className="tabular text-caption text-muted-foreground">
                  {c.pt && !c.teaches.length
                    ? "Personal training by appointment"
                    : teachLine(sessions, c.name, now)}
                </p>
                <p className="text-body text-muted-foreground">
                  {c.clubs
                    .map((k) => clubBySlug(k)?.name)
                    .filter(Boolean)
                    .join(" · ")}
                </p>
              </div>
              <LinkButton
                href={`/tour?coach=${c.slug}&club=${c.clubs[0]}`}
                variant="outline"
                size="sm"
              >
                Book intro
              </LinkButton>
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState
          className="mt-6"
          title="No coaches match."
          text="Remove a filter."
        >
          <Button variant="outline" onClick={reset}>
            Reset filters
          </Button>
        </EmptyState>
      )}
    </div>
  )
}
