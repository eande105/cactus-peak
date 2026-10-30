"use client"
import { useMemo, useState } from "react"
import { useApp } from "@/components/app/use-app"
import { Popover } from "@/components/graphical"
import { Check, ChevronsUpDown, Lock, MapPin, Search } from "@/components/icons"
import { ClubArt } from "@/components/kit/brand-art"
import { Drawer } from "@/components/kit/overlays"
import { BusynessMeter } from "@/components/kit/ribs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useMedia } from "@/hooks/use-media"
import { setPrefs } from "@/lib/actions"
import { announce } from "@/lib/announce"
import { BUSY_WORDS, CLUB_BY_SLUG, CLUBS } from "@/lib/data/catalog"
import { liveBusyness } from "@/lib/engine"
import { miles, setCoords, useCoords } from "@/lib/ui-state"
import { cn } from "@/lib/utils"

export function ClubList({
  onPick,
  selected,
}: {
  onPick: (slug: string) => void
  selected: string
}) {
  const { s, me, hh, now } = useApp()
  const [q, setQ] = useState("")
  const coords = useCoords()
  const [note, setNote] = useState("")
  const list = useMemo(
    () =>
      CLUBS.filter(
        (c) =>
          c.name.toLowerCase().includes(q.toLowerCase()) ||
          c.address.toLowerCase().includes(q.toLowerCase())
      ),
    [q]
  )
  void s
  return (
    <div className="flex flex-col gap-3">
      <div className="relative">
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
      <Button
        variant="ghost"
        size="sm"
        className="w-fit"
        onClick={() => {
          if (!navigator.geolocation)
            return setNote("Location isn't available in this browser.")
          navigator.geolocation.getCurrentPosition(
            (p) => {
              setCoords({ lat: p.coords.latitude, lng: p.coords.longitude })
              setNote("")
            },
            () => setNote("No problem. We'll keep listing clubs by name.")
          )
        }}
      >
        <MapPin aria-hidden="true" data-icon="inline-start" />
        Use my location
      </Button>
      {note ? (
        <p role="status" className="text-detail text-muted-foreground">
          {note}
        </p>
      ) : null}
      {(["Mesa", "Gilbert"] as const).map((city) => {
        const clubs = list.filter((c) => c.city === city)
        if (!clubs.length) return null
        return (
          // biome-ignore lint/a11y/useSemanticElements: labelled group of lists, a fieldset would add legend and border styles
          <div key={city} role="group" aria-label={city}>
            <p className="mb-1 eyebrow text-muted-foreground">
              {city} · {CLUBS.filter((c) => c.city === city).length}
            </p>
            <ul className="flex flex-col">
              {clubs.map((c) => {
                const locked = hh.plan === "trailhead" && c.slug !== me.homeClub
                const b = liveBusyness(c.slug, now)
                const sel = c.slug === selected
                return (
                  <li key={c.slug}>
                    <button
                      type="button"
                      onClick={() => onPick(c.slug)}
                      aria-current={sel || undefined}
                      className={cn(
                        "flex min-h-14 w-full items-center gap-3 rounded-md px-2 py-2 text-left hover:bg-muted",
                        sel && "bg-accent"
                      )}
                    >
                      <ClubArt
                        slug={c.slug}
                        ratio={1}
                        detail="simple"
                        className="size-10 shrink-0 rounded-sm"
                      />
                      <span className="min-w-0 flex-1">
                        <span className="flex items-center gap-2 text-label">
                          {c.name}
                          {c.slug === me.homeClub ? (
                            <span className="rounded-xs bg-muted px-1.5 text-detail">
                              Home
                            </span>
                          ) : null}
                          {locked ? (
                            <Lock
                              className="size-3.5 text-muted-foreground"
                              aria-label="Ridge or Summit"
                            />
                          ) : null}
                        </span>
                        <span className="flex items-center gap-2 text-detail text-muted-foreground">
                          <BusynessMeter level={b.level} variant="inline" />
                          {coords ? (
                            <span className="num">
                              · {miles(coords, c).toFixed(1)} mi
                            </span>
                          ) : null}
                        </span>
                      </span>
                      {sel ? (
                        <Check
                          className="size-4 text-primary"
                          aria-label="Viewing"
                        />
                      ) : null}
                    </button>
                  </li>
                )
              })}
            </ul>
          </div>
        )
      })}
      {!list.length ? (
        <p className="text-caption text-muted-foreground">
          No club matches. Clear the search.
        </p>
      ) : null}
    </div>
  )
}

export function ClubSwitcher() {
  const { me, club, now } = useApp()
  const [open, setOpen] = useState(false)
  const wide = useMedia("(min-width: 768px)", true)
  const c = CLUB_BY_SLUG[club]
  const b = liveBusyness(club, now)
  const pick = (slug: string) => {
    setPrefs(me.id, { viewingClub: slug })
    setOpen(false)
    announce(
      `Viewing ${CLUB_BY_SLUG[slug].name}. Busyness: ${BUSY_WORDS[liveBusyness(slug, now).level]}.`
    )
  }
  const trigger = (
    <span className="flex min-h-11 items-center gap-2 rounded-md px-2 text-left hover:bg-muted max-md:gap-1.5 max-md:px-1">
      <MapPin
        className="size-4 shrink-0 text-muted-foreground"
        aria-hidden="true"
      />
      <span className="min-w-0">
        <span className="block max-w-[11rem] truncate text-label max-md:max-w-[7.5rem]">
          {c.name}
        </span>
        <span className="block">
          <BusynessMeter
            level={b.level}
            variant="inline"
            className="max-md:hidden"
          />
        </span>
      </span>
      <ChevronsUpDown
        className="size-4 shrink-0 text-muted-foreground"
        aria-hidden="true"
      />
    </span>
  )
  if (!wide)
    return (
      <Drawer.Root open={open} onOpenChange={setOpen}>
        <Drawer.Trigger
          aria-label={`Viewing club: ${c.name}. Change club`}
          className="!bg-transparent !p-0"
        >
          {trigger}
        </Drawer.Trigger>
        <Drawer.Portal>
          <Drawer.Backdrop />
          <Drawer.Viewport>
            <Drawer.Popup>
              <Drawer.Content>
                <Drawer.Title className="font-heading text-h2">
                  Viewing club
                </Drawer.Title>
                <Drawer.Description className="sr-only">
                  Pick the club that Schedule, Reserve and Today show.
                </Drawer.Description>
                <ClubList onPick={pick} selected={club} />
              </Drawer.Content>
            </Drawer.Popup>
          </Drawer.Viewport>
        </Drawer.Portal>
      </Drawer.Root>
    )
  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger
        aria-label={`Viewing club: ${c.name}. Change club`}
        className="!bg-transparent !p-0"
      >
        {trigger}
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Positioner align="start" sideOffset={8}>
          <Popover.Popup className="!w-[360px]">
            <Popover.Title className="sr-only">Viewing club</Popover.Title>
            <ClubList onPick={pick} selected={club} />
          </Popover.Popup>
        </Popover.Positioner>
      </Popover.Portal>
    </Popover.Root>
  )
}
