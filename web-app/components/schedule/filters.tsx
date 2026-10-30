"use client"
import { useState } from "react"
import { useApp } from "@/components/app/use-app"
import { Collapsible, Toggle } from "@/components/graphical"
import { ChevronDown, Lock, Minus, Plus } from "@/components/icons"
import { CategoryBadge } from "@/components/kit/category"
import { CheckRow, Segmented, SelectBox, SwitchRow } from "@/components/kit/ui"
import { Button } from "@/components/ui/button"
import { setPrefs } from "@/lib/actions"
import { CATEGORIES, CLUBS, INSTRUCTORS } from "@/lib/data/catalog"
import {
  activeCount,
  EMPTY,
  type Filters,
  type TimeBand,
} from "@/lib/schedule-filters"
import type { CategoryId } from "@/lib/types"

function Group({
  title,
  children,
  defaultOpen = true,
}: {
  title: string
  children: React.ReactNode
  defaultOpen?: boolean
}) {
  return (
    <Collapsible.Root
      defaultOpen={defaultOpen}
      className="py-3 rule-t first:pt-0 first:shadow-none"
    >
      <Collapsible.Trigger className="group flex min-h-9 w-full items-center justify-between !bg-transparent !p-0 text-label !shadow-none">
        {title}
        <ChevronDown
          className="size-4 transition-transform group-data-[panel-open]:rotate-180"
          aria-hidden="true"
        />
      </Collapsible.Trigger>
      <Collapsible.Content className="pt-2">
        <div className="flex flex-col gap-2">{children}</div>
      </Collapsible.Content>
    </Collapsible.Root>
  )
}

const BANDS: { value: TimeBand; label: string; sr: string }[] = [
  { value: "early", label: "Early", sr: "Early, 4:30 to 7 a.m." },
  { value: "morning", label: "Morning", sr: "Morning, 7 a.m. to noon" },
  { value: "midday", label: "Midday", sr: "Midday, noon to 4 p.m." },
  { value: "evening", label: "Evening", sr: "Evening, 4 to 10 p.m." },
]

export function ScheduleFilters({
  f,
  onChange,
  count,
  counts,
  studios,
}: {
  f: Filters
  onChange: (f: Filters) => void
  count: number
  counts: Record<string, number>
  studios: string[]
}) {
  const { me, hh, prefs, club } = useApp()
  const [saved, setSaved] = useState(!!prefs.savedFilters)
  const multi = hh.plan !== "trailhead"
  const set = (p: Partial<Filters>) => onChange({ ...f, ...p })
  const toggle = <T,>(arr: T[], v: T) =>
    arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]
  return (
    <search className="flex flex-col gap-3" aria-label="Schedule filters">
      <Group title="Club">
        {CLUBS.map((c) => {
          const locked = !multi && c.slug !== me.homeClub
          return locked ? (
            <p
              key={c.slug}
              className="flex min-h-9 items-center gap-2 text-caption text-muted-foreground"
            >
              <Lock className="size-4" aria-hidden="true" />
              {c.name}
              <span className="text-detail">Ridge or Summit</span>
            </p>
          ) : (
            <CheckRow
              key={c.slug}
              checked={f.clubs.includes(c.slug)}
              onChange={() => {
                const next = toggle(f.clubs, c.slug)
                set({ clubs: next.length ? next : [club] })
              }}
            >
              {c.name}
            </CheckRow>
          )
        })}
      </Group>
      <Group title="Category">
        {CATEGORIES.filter(
          (c) => (counts[c.id] ?? 0) > 0 || f.cats.includes(c.id as CategoryId)
        ).map((c) => (
          <CheckRow
            key={c.id}
            checked={f.cats.includes(c.id as CategoryId)}
            onChange={() => set({ cats: toggle(f.cats, c.id as CategoryId) })}
          >
            <span className="flex items-center gap-2">
              <CategoryBadge id={c.id} />
              <span className="num text-detail text-muted-foreground">
                {counts[c.id] ?? 0}
              </span>
            </span>
          </CheckRow>
        ))}
      </Group>
      <Group title="Time of day">
        {/* biome-ignore lint/a11y/useSemanticElements: toggle-button group, a fieldset would add legend and border styles */}
        <div
          className="flex flex-wrap gap-2"
          role="group"
          aria-label="Time of day"
        >
          {BANDS.map((b) => (
            <Toggle
              key={b.value}
              pressed={f.times.includes(b.value)}
              aria-label={b.sr}
              onPressedChange={() => set({ times: toggle(f.times, b.value) })}
              className="max-md:min-h-11"
            >
              {b.label}
            </Toggle>
          ))}
        </div>
      </Group>
      <Group title="Intensity">
        <p className="text-detail text-muted-foreground">1 Easy · 5 All-out</p>
        {(["intMin", "intMax"] as const).map((k) => (
          <div key={k} className="flex items-center justify-between gap-3">
            <span className="text-caption">
              {k === "intMin" ? "At least" : "At most"}
            </span>
            <span className="flex items-center gap-1">
              <Button
                variant="outline"
                size="icon"
                aria-label={`Decrease ${k === "intMin" ? "minimum" : "maximum"} intensity`}
                onClick={() =>
                  set({ [k]: Math.max(1, f[k] - 1) } as Partial<Filters>)
                }
                disabled={f[k] <= 1}
              >
                <Minus aria-hidden="true" />
              </Button>
              <span
                className="w-8 text-center num text-body-strong"
                aria-live="polite"
              >
                {f[k]}
              </span>
              <Button
                variant="outline"
                size="icon"
                aria-label={`Increase ${k === "intMin" ? "minimum" : "maximum"} intensity`}
                onClick={() =>
                  set({ [k]: Math.min(5, f[k] + 1) } as Partial<Filters>)
                }
                disabled={f[k] >= 5}
              >
                <Plus aria-hidden="true" />
              </Button>
            </span>
          </div>
        ))}
      </Group>
      <Group title="Availability">
        <SwitchRow checked={f.open} onChange={(c) => set({ open: c })}>
          Open spots only
        </SwitchRow>
        <CheckRow checked={f.first} onChange={(c) => set({ first: c })}>
          Good for first-timers
        </CheckRow>
        <CheckRow checked={f.mine} onChange={(c) => set({ mine: c })}>
          Only my bookings
        </CheckRow>
      </Group>
      <Group title="More" defaultOpen={false}>
        <SelectBox
          label="Instructor"
          value={f.inst || "any"}
          onChange={(v) => set({ inst: v === "any" ? "" : v })}
          options={[
            { value: "any", label: "Any instructor" },
            ...INSTRUCTORS.map((i) => ({ value: i.id, label: i.name })),
          ]}
        />
        <SelectBox
          label="Studio or room"
          value={f.studio || "any"}
          onChange={(v) => set({ studio: v === "any" ? "" : v })}
          options={[
            { value: "any", label: "Any room" },
            ...studios.map((x) => ({ value: x, label: x })),
          ]}
        />
        <Segmented
          label="Duration"
          value={f.dur || "any"}
          onChange={(v) => set({ dur: v === "any" ? "" : v })}
          size="sm"
          options={[
            { value: "any", label: "Any" },
            { value: "30", label: "Up to 30" },
            { value: "45", label: "45" },
            { value: "60", label: "60+" },
          ]}
        />
      </Group>
      <div className="flex flex-col gap-3 pt-3 rule-t">
        <CheckRow
          checked={saved}
          onChange={(c) => {
            setSaved(c)
            setPrefs(me.id, { savedFilters: c ? JSON.stringify(f) : undefined })
          }}
        >
          Save as my filters
        </CheckRow>
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            disabled={activeCount(f, club) === 0}
            onClick={() => onChange({ ...EMPTY, clubs: [club] })}
          >
            Clear all
          </Button>
          <p role="status" className="num text-caption text-muted-foreground">
            {count} {count === 1 ? "class" : "classes"}
          </p>
        </div>
      </div>
    </search>
  )
}
