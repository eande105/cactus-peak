"use client"
import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import { useApp } from "@/components/app/use-app"
import { ClubMap } from "@/components/clubs/club-map"
import { Toggle } from "@/components/graphical"
import { Lock, MapPin, Search } from "@/components/icons"
import { ArtFrame, ClubArt } from "@/components/kit/brand-art"
import { BusynessMeter } from "@/components/kit/ribs"
import {
  EmptyState,
  LoadingBlock,
  PageHeader,
  Segmented,
  SelectBox,
  StatusPill,
} from "@/components/kit/ui"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useMedia } from "@/hooks/use-media"
import { setPrefs } from "@/lib/actions"
import { CLUB_BY_SLUG, CLUBS } from "@/lib/data/catalog"
import { clubOpen, liveBusyness } from "@/lib/engine"
import { fmtTime } from "@/lib/time"
import { miles, setCoords, useCoords, useOffline } from "@/lib/ui-state"
import { cn } from "@/lib/utils"

const AMEN = [
  { id: "pool", label: "Pool" },
  { id: "courts", label: "Courts" },
  { id: "kids", label: "Kids club" },
  { id: "recovery", label: "Recovery" },
  { id: "cafe", label: "Café" },
  { id: "open", label: "Open now" },
]
type Sort = "nearest" | "quiet" | "name"

export default function ClubsPage() {
  const { me, hh, now, club: viewing } = useApp()
  const wide = useMedia("(min-width: 1024px)")
  const offline = useOffline()
  const coords = useCoords()
  const [loading, setLoading] = useState(false)
  const [q, setQ] = useState("")
  const [f, setF] = useState<string[]>([])
  const [sort, setSort] = useState<Sort>("name")
  const [sel, setSel] = useState<string>()
  const [hover, setHover] = useState<string | null>(null)
  const [mapView, setMapView] = useState<"list" | "map">("list")
  const [note, setNote] = useState("")
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 300)
    return () => clearTimeout(t)
  }, [])
  const open = clubOpen(now).open
  const list = useMemo(() => {
    let l = CLUBS.filter((c) =>
      (c.name + c.address).toLowerCase().includes(q.toLowerCase())
    )
    l = l.filter((c) =>
      f.every((k) =>
        k === "pool"
          ? !!c.pool
          : k === "courts"
            ? c.courts.length > 0
            : k === "kids"
              ? c.kidsClub
              : k === "recovery"
                ? c.recovery !== "none"
                : k === "cafe"
                  ? c.amenities.includes("Café")
                  : open
      )
    )
    if (sort === "quiet")
      l = [...l].sort(
        (a, b) =>
          liveBusyness(a.slug, now).level - liveBusyness(b.slug, now).level
      )
    if (sort === "nearest" && coords)
      l = [...l].sort((a, b) => miles(coords, a) - miles(coords, b))
    return l
  }, [q, f, sort, coords, now, open])
  const locate = () =>
    navigator.geolocation?.getCurrentPosition(
      (p) => {
        setCoords({ lat: p.coords.latitude, lng: p.coords.longitude })
        setSort("nearest")
        setNote("")
      },
      () => setNote("No problem. We'll keep listing clubs by name.")
    )
  if (loading) return <LoadingBlock text="Loading clubs…" rows={5} />
  const card = (c: (typeof CLUBS)[number]) => {
    const b = liveBusyness(c.slug, now)
    const locked = hh.plan === "trailhead" && c.slug !== me.homeClub
    const on = hover === c.slug || sel === c.slug
    return (
      <li
        key={c.slug}
        onMouseEnter={() => setHover(c.slug)}
        onMouseLeave={() => setHover(null)}
        className={cn(
          "grid gap-4 py-5 sm:grid-cols-[minmax(0,25%)_1fr]",
          on && "bg-muted/60"
        )}
      >
        <ArtFrame
          className="aspect-[4/3] rounded-md max-sm:aspect-[16/9]"
          art={
            <>
              <ClubArt
                slug={c.slug}
                ratio="4/3"
                layout="spotlight"
                fill
                className="max-sm:hidden"
              />
              <ClubArt
                slug={c.slug}
                ratio="16/9"
                layout="spotlight"
                fill
                className="sm:hidden"
              />
            </>
          }
        />
        <div className="flex min-w-0 flex-col gap-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-heading text-h3 display-stretch">
              <Link
                href={`/clubs/${c.slug}`}
                className="inline-flex min-h-11 items-center hover:underline"
              >
                {c.name}
              </Link>
            </h3>
            {c.slug === me.homeClub ? (
              <StatusPill tone="neutral">Home</StatusPill>
            ) : null}
            {locked ? (
              <StatusPill tone="outline" icon={Lock}>
                Ridge or Summit
              </StatusPill>
            ) : null}
          </div>
          <p className="text-caption text-muted-foreground">
            {c.address}
            {coords ? (
              <span className="num"> · {miles(coords, c).toFixed(1)} mi</span>
            ) : null}
          </p>
          <p className="text-body">{c.personality}</p>
          <ul className="flex flex-wrap gap-1.5">
            {[
              c.pool ? "Pool" : "",
              c.courts.length ? "Courts" : "",
              c.kidsClub ? "Kids club" : "",
              c.recovery !== "none" ? "Recovery" : "",
              c.amenities.includes("Café") ? "Café" : "",
            ]
              .filter(Boolean)
              .map((a) => (
                <li
                  key={a}
                  className="rounded-sm bg-muted px-2 py-0.5 text-detail"
                >
                  {a}
                </li>
              ))}
          </ul>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
            <BusynessMeter level={b.level} variant="inline" />
            {clubOpen(now).open ? (
              <span className="text-detail text-muted-foreground">
                Open now · closes{" "}
                <span className="num">{fmtTime(clubOpen(now).closeAt)}</span>
              </span>
            ) : (
              <span className="text-detail text-muted-foreground">
                Closed now · opens {fmtTime(clubOpen(now).openAt)}
              </span>
            )}
          </div>
          <div className="mt-1 flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              render={<Link href={`/clubs/${c.slug}`} />}
            >
              View club
            </Button>
            {viewing === c.slug ? (
              <span className="inline-flex min-h-9 items-center text-caption text-muted-foreground">
                Viewing this club
              </span>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setPrefs(me.id, { viewingClub: c.slug })
                }}
              >
                Set as my club
              </Button>
            )}
          </div>
        </div>
      </li>
    )
  }
  const grouped = (["Mesa", "Gilbert"] as const).map((city) => ({
    city,
    clubs: list.filter((c) => c.city === city),
    total: CLUBS.filter((c) => c.city === city).length,
  }))
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Clubs"
        description="5 clubs. One climb."
        actions={
          !wide ? (
            <Segmented
              label="View"
              value={mapView}
              onChange={setMapView}
              options={[
                { value: "list", label: "List" },
                { value: "map", label: "Map" },
              ]}
            />
          ) : null
        }
      />
      <div className="flex flex-wrap items-end gap-3">
        <div className="relative min-w-52 flex-1 sm:max-w-xs">
          <Search
            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            aria-label="Search clubs"
            placeholder="Search clubs"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button variant="ghost" onClick={locate}>
          <MapPin aria-hidden="true" data-icon="inline-start" />
          Use my location
        </Button>
        <SelectBox
          label="Sort"
          value={sort}
          onChange={setSort}
          options={[
            { value: "name", label: "Name" },
            { value: "nearest", label: "Nearest", disabled: !coords },
            { value: "quiet", label: "Quietest now" },
          ]}
          className="w-44"
        />
      </div>
      <ul className="flex flex-wrap gap-2" aria-label="Amenities">
        {AMEN.map((a) => (
          <li key={a.id}>
            <Toggle
              pressed={f.includes(a.id)}
              onPressedChange={() =>
                setF((x) =>
                  x.includes(a.id) ? x.filter((y) => y !== a.id) : [...x, a.id]
                )
              }
              className="max-md:min-h-11"
            >
              {a.label}
            </Toggle>
          </li>
        ))}
      </ul>
      {note ? (
        <p role="status" className="text-caption text-muted-foreground">
          {note}
        </p>
      ) : null}
      {offline ? (
        <p className="text-caption text-muted-foreground">
          Offline: showing saved clubs. The map is unavailable.
        </p>
      ) : null}
      {!list.length ? (
        <EmptyState
          title="No club matches."
          body="Clear a filter."
          action={
            <Button
              onClick={() => {
                setF([])
                setQ("")
              }}
            >
              Clear filters
            </Button>
          }
        />
      ) : (
        <div className="grid gap-8 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
          {wide || mapView === "list" ? (
            <div className="min-w-0">
              {grouped
                .filter((g) => g.clubs.length)
                .map((g) => (
                  <section key={g.city} aria-labelledby={`g-${g.city}`}>
                    <h2
                      id={`g-${g.city}`}
                      className="border-b border-border pb-2 eyebrow text-muted-foreground"
                    >
                      {g.city} · {g.total}
                    </h2>
                    <ul className="rule-rows">{g.clubs.map(card)}</ul>
                  </section>
                ))}
            </div>
          ) : null}
          {(wide || mapView === "map") && !offline ? (
            <div className="lg:sticky lg:top-24 lg:self-start">
              <ClubMap
                now={now}
                selected={sel}
                hover={hover ?? undefined}
                onSelect={(s) => setSel(s)}
                onHover={setHover}
              />
              {sel ? (
                (() => {
                  const c = CLUB_BY_SLUG[sel]
                  return (
                    <div className="mt-3 flex flex-wrap items-center justify-between gap-3 pt-3 rule-t">
                      <div>
                        <p className="text-label">{c.name}</p>
                        <BusynessMeter
                          level={liveBusyness(c.slug, now).level}
                          variant="inline"
                        />
                      </div>
                      <Button
                        size="sm"
                        render={<Link href={`/clubs/${c.slug}`} />}
                      >
                        View club
                      </Button>
                    </div>
                  )
                })()
              ) : (
                <p className="mt-2 text-detail text-muted-foreground">
                  Pick a pin to see the club. The list works without the map.
                </p>
              )}
              {!wide ? (
                <Button
                  variant="outline"
                  className="mt-3"
                  onClick={() => setMapView("list")}
                >
                  Show list
                </Button>
              ) : null}
            </div>
          ) : null}
        </div>
      )}
    </div>
  )
}
