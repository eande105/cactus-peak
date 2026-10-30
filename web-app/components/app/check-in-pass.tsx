"use client"
import Link from "next/link"
import QRCode from "qrcode"
import { useEffect, useState } from "react"
import {
  type ClubId,
  clubObjects,
  ObjectRow,
} from "@/components/brand/graphics"
import { Pause, WifiOff } from "@/components/icons"
import { Button } from "@/components/ui/button"
import { CLUB_BY_SLUG, PLANS } from "@/lib/data/catalog"
import type { AppState } from "@/lib/data/state"
import { clubOpen, householdOf, paymentDaysLate } from "@/lib/engine"
import { DAY, fmtDay, fmtTime } from "@/lib/time"
import type { Member } from "@/lib/types"
import { useOffline } from "@/lib/ui-state"
import { cn } from "@/lib/utils"

export type PassState = {
  kind: "valid" | "frozen" | "past-due" | "ended"
  note?: string
  line?: string
}
export function passState(s: AppState, m: Member, now: number): PassState {
  const hh = householdOf(s, m.id)
  if (hh.status === "frozen" && hh.freeze)
    return {
      kind: "frozen",
      line: `Frozen until ${fmtDay(hh.freeze.resume - DAY)}`,
      note: "Ask the front desk.",
    }
  if (paymentDaysLate(s, m.id, now) >= 15)
    return { kind: "past-due", line: "Payment needed. See the front desk." }
  if (hh.status === "cancel_scheduled" && hh.cancelOn)
    return { kind: "valid", note: `Membership ends ${fmtDay(hh.cancelOn)}` }
  return { kind: "valid" }
}

// The QR is always black on a white square with a quiet zone, in both colour modes, so scanners can read it.
function Qr({ value, name }: { value: string; name: string }) {
  const [svg, setSvg] = useState("")
  useEffect(() => {
    let live = true
    QRCode.toString(value, {
      type: "svg",
      margin: 0,
      errorCorrectionLevel: "M",
      color: { dark: "#000000", light: "#ffffff" },
    }).then((s) => {
      if (live) setSvg(s)
    })
    return () => {
      live = false
    }
  }, [value])
  return (
    <div
      role="img"
      aria-label={`Check-in code for ${name}, updates every 60 seconds`}
      className="bg-white mx-auto grid aspect-square w-full max-w-[272px] place-items-center rounded-md p-4 [&_svg]:size-full"
      // biome-ignore lint/security/noDangerouslySetInnerHtml: SVG comes from the local QR library, not user HTML
      dangerouslySetInnerHTML={svg ? { __html: svg } : undefined}
    ></div>
  )
}

export function CheckInPass({
  s,
  member,
  now,
  variant = "full",
  className,
}: {
  s: AppState
  member: Member
  now: number
  variant?: "full" | "compact"
  className?: string
}) {
  const offline = useOffline()
  const st = passState(s, member, now)
  const hh = householdOf(s, member.id)
  const club = CLUB_BY_SLUG[member.homeClub]
  const bucket = Math.floor(now / 60_000)
  const token = `CPA|${member.memberNumber}|${bucket}|${(bucket * 7919) % 9973}`
  const scannable = st.kind === "valid"
  if (variant === "compact")
    return (
      <div
        className={cn(
          "flex items-center justify-between gap-4 rounded-md bg-night px-4 py-3 text-on-night",
          className
        )}
      >
        <div className="min-w-0">
          <p className="eyebrow text-on-night/80">Member number</p>
          <p className="truncate num text-body-strong">{member.memberNumber}</p>
        </div>
        <Button variant="secondary" size="sm" render={<Link href="/pass" />}>
          Show pass
        </Button>
      </div>
    )
  return (
    <section
      aria-label={`Check-in pass for ${member.firstName} ${member.lastName}`}
      className={cn(
        "rounded-xl overflow-hidden bg-night text-on-night",
        className
      )}
    >
      <div className="flex items-center justify-between gap-3 px-6 pt-6">
        {/* biome-ignore lint/performance/noImgElement: static SVG brand mark, next/image adds nothing */}
        <img
          src="/brand/cpa-horizontal-reversed.svg"
          alt="Cactus Peak Athletic"
          className="h-8 w-auto"
        />
        <span className="rounded-sm border border-dawn px-2 py-0.5 text-caption font-semibold text-dawn">
          {PLANS[hh.plan].name}
        </span>
      </div>
      {member.homeClub in clubObjects ? (
        // The home club's Set: three objects that mark the club this pass opens.
        <ObjectRow
          ids={clubObjects[member.homeClub as ClubId]}
          scheme="night"
          className="mx-6 mt-5 h-9 w-auto"
        />
      ) : null}
      <div className="flex flex-col gap-1 px-6 pt-6">
        <p className="font-heading text-h2 display-stretch">
          {member.firstName} {member.lastName}
        </p>
        <p className="eyebrow text-on-night/80">Member number</p>
        <p className="num-l break-all">{member.memberNumber}</p>
        {st.note ? (
          <p className="text-caption text-on-night/80">{st.note}</p>
        ) : null}
      </div>
      <div className="px-6 py-6">
        {scannable ? (
          <>
            <Qr value={token} name={`${member.firstName} ${member.lastName}`} />
            <p className="mt-3 text-caption text-on-night/90">
              Scan at the front desk. Updates every 60 seconds.
            </p>
          </>
        ) : (
          <div className="flex flex-col gap-2 rounded-md bg-on-night/10 p-4">
            <p className="inline-flex items-center gap-2 text-label">
              {st.kind === "frozen" ? (
                <Pause className="size-4" aria-hidden="true" />
              ) : null}
              {st.line}
            </p>
            {st.note ? (
              <p className="text-caption text-on-night/90">{st.note}</p>
            ) : null}
            <p className="text-caption text-on-night/90">
              Your member number stays valid:{" "}
              <span className="num">{member.memberNumber}</span>
            </p>
          </div>
        )}
        {offline && scannable ? (
          <p className="mt-3 inline-flex items-start gap-2 rounded-sm bg-warning-subtle p-2 text-caption text-foreground">
            <WifiOff
              className="mt-0.5 size-4 shrink-0 text-warning"
              aria-hidden="true"
            />
            Offline. This code may not scan. Show your member number:{" "}
            {member.memberNumber}.
          </p>
        ) : null}
      </div>
      <p className="border-t border-on-night/15 px-6 py-3 text-caption text-on-night/90">
        Home club: {club.name} ·{" "}
        {clubOpen(now).open
          ? `Open now, closes ${fmtTime(clubOpen(now).closeAt)}`
          : `Closed now, opens ${fmtTime(clubOpen(now).openAt)}`}
      </p>
    </section>
  )
}
