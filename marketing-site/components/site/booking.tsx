"use client"

import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react"
import { CategoryBadge, LinkButton } from "@/components/brand/atoms"
import { InstructorChip } from "@/components/brand/class-parts"
import { CapacityIndicator, IntensityRibs } from "@/components/brand/meters"
import { Button } from "@/components/ui/button"
import {
  Overlay,
  OverlayDescription,
  OverlayPopup,
  OverlayTitle,
} from "@/components/ui/overlay"
import { MEMBER_SIGN_IN_URL } from "@/lib/links"
import { dayInfo, fmtTime } from "@/lib/time"
import type { Session } from "@/lib/types"
import { useCatalog, useClubNow } from "./catalog-context"

type Ctx = {
  open: (s: Session, kind: "book" | "waitlist") => void
  openPanel: (s: Session) => void
}
const C = createContext<Ctx>({ open: () => {}, openPanel: () => {} })
export const useBooking = () => useContext(C)

/** Signed-out hand-off dialog (spec 03 section 6.6). */
export function BookingProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<{
    s: Session
    kind: "book" | "waitlist"
  } | null>(null)
  const [panel, setPanel] = useState<Session | null>(null)
  const open = useCallback(
    (s: Session, kind: "book" | "waitlist") => setState({ s, kind }),
    []
  )
  const openPanel = useCallback((s: Session) => setPanel(s), [])
  const v = useMemo(() => ({ open, openPanel }), [open, openPanel])
  const now = useClubNow()
  const s = state?.s
  const d = s ? dayInfo(s.day, now.dayNum) : null
  return (
    <C.Provider value={v}>
      {children}
      <ClassPanel s={panel} onClose={() => setPanel(null)} />
      <Overlay open={!!state} onOpenChange={(o) => !o && setState(null)}>
        <OverlayPopup label="Sign in to book">
          {/* The title keeps XL space at its end for the corner close (dialog.md). */}
          <OverlayTitle className="pr-8">
            {state?.kind === "waitlist"
              ? "Sign in to join the waitlist."
              : "Sign in to book."}
          </OverlayTitle>
          <OverlayDescription>
            {s?.className} · {d?.long}, {d?.month} {d?.dom},{" "}
            {s ? fmtTime(s.start) : ""} · {s?.clubName}
            {state?.kind === "waitlist" ? (
              <span className="mt-2 block text-caption text-muted-foreground">
                We will text you if a spot opens. You have 30 minutes to
                confirm.
              </span>
            ) : null}
          </OverlayDescription>
          <div className="mt-3 flex flex-col gap-3">
            <LinkButton href={MEMBER_SIGN_IN_URL} external size="lg">
              Sign in
            </LinkButton>
            <LinkButton href={`/trial?club=${s?.clubSlug}`} variant="outline">
              New here? Try a free 3-day pass
            </LinkButton>
            <LinkButton href={`/join/plan?club=${s?.clubSlug}`} variant="ghost">
              Join Cactus Peak
            </LinkButton>
          </div>
          <p className="text-caption text-muted-foreground">
            Members book up to 7 days ahead. Summit members book 9.
          </p>
        </OverlayPopup>
      </Overlay>
    </C.Provider>
  )
}

export function BookingStateButton({
  session,
  className,
  filled,
}: {
  session: Session
  className?: string
  filled?: boolean
}) {
  const { open } = useBooking()
  const now = useClubNow()
  const full = session.left === 0
  const started = session.day === 0 && session.start <= now.min
  if (started)
    return (
      <Button variant="outline" disabled className={className}>
        Started
      </Button>
    )
  return (
    <Button
      variant={filled ? "primary" : "outline"}
      size={filled ? "md" : "sm"}
      className={className}
      onClick={() => open(session, full ? "waitlist" : "book")}
    >
      {filled
        ? full
          ? "Join the waitlist in the app"
          : "Book in the app"
        : full
          ? "Waitlist"
          : "Book"}
      <span className="sr-only">
        {" "}
        {session.className}, {fmtTime(session.start)}
      </span>
    </Button>
  )
}

function ClassPanel({
  s,
  onClose,
}: {
  s: Session | null
  onClose: () => void
}) {
  const { classBySlug } = useCatalog()
  const now = useClubNow()
  const ct = s ? classBySlug(s.classSlug) : null
  const d = s ? dayInfo(s.day, now.dayNum) : null
  return (
    <Overlay
      placement="bottom"
      open={!!s}
      onOpenChange={(o) => !o && onClose()}
    >
      {/* No popup padding: the Night time block runs to the edges. The close sits on Night, so it uses the Sand
          foreground (review 2, P0-1); the Graphical ghost close is dark text for light surfaces. */}
      <OverlayPopup
        label="Class details"
        className="p-0"
        closeClassName="text-night-foreground hover:bg-night-foreground/10"
      >
        {s && ct && d ? (
          <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
            <div className="bg-night p-5 pr-14 text-night-foreground">
              <OverlayTitle className="sr-only">{ct.name}</OverlayTitle>
              <p className="eyebrow text-night-muted">
                {d.long}, {d.month} {d.dom}
              </p>
              <p className="tabular font-data text-h1 font-bold">
                {fmtTime(s.start)}
              </p>
              <p className="text-caption">{s.coach ?? "Self-guided"}</p>
              <div className="mt-4">
                <BookingStateButton session={s} filled />
              </div>
            </div>
            <div className="flex flex-col gap-4 p-5">
              <CategoryBadge id={ct.category} name={ct.categoryName} />
              <h2 className="font-display-wide text-h2">{ct.name}</h2>
              <p className="text-caption">
                {s.clubName}, {s.room}
              </p>
              <dl className="grid grid-cols-3 gap-3 border-y border-border py-3">
                <div>
                  <dt className="eyebrow text-muted-foreground">Duration</dt>
                  <dd className="tabular text-label">{ct.duration} min</dd>
                </div>
                <div>
                  <dt className="eyebrow text-muted-foreground">Intensity</dt>
                  <dd>
                    <IntensityRibs level={s.level} categoryId={ct.category} />
                  </dd>
                </div>
                <div>
                  <dt className="eyebrow text-muted-foreground">Spots</dt>
                  <dd>
                    {s.left > 5 ? (
                      "Plenty"
                    ) : (
                      <CapacityIndicator
                        left={s.left}
                        capacity={s.capacity}
                        noun={s.unit === "bikes" ? "bikes" : "spots"}
                      />
                    )}
                  </dd>
                </div>
              </dl>
              <InstructorChip name={s.coach} slug={s.coachSlug} size={40} />
              <p className="text-body">{ct.blurb}</p>
              <p className="text-caption text-muted-foreground">
                Bring: {ct.gear} Cancel free up to 2 hours before.
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <LinkButton href={`/classes/${ct.slug}`} variant="ghost">
                  View class page
                </LinkButton>
              </div>
            </div>
          </div>
        ) : null}
      </OverlayPopup>
    </Overlay>
  )
}

/** Whole-row tap target for the narrow schedule layout. */
export function RowOpen({
  s,
  onOpen,
}: {
  s: Session
  onOpen?: (s: Session) => void
}) {
  const { openPanel } = useBooking()
  return (
    <button
      type="button"
      onClick={() => (onOpen ?? openPanel)(s)}
      aria-label={`${s.className}, ${fmtTime(s.start)}. Open details`}
      className="absolute inset-0 z-0 @min-[780px]:hidden"
    />
  )
}
