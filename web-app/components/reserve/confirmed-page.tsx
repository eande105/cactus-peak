"use client"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { useApp } from "@/components/app/use-app"
import { CancelDialog } from "@/components/booking/cancel-dialog"
import { SuccessPanel } from "@/components/booking/success-panel"
import { EmptyState, PageHeader } from "@/components/kit/ui"
import { Button } from "@/components/ui/button"
import { CLUB_BY_SLUG } from "@/lib/data/catalog"
import { cancelNote } from "@/lib/engine"
import { fmtDay, fmtRange } from "@/lib/time"
import { cn } from "@/lib/utils"

export default function ConfirmedPage({ id }: { id: string }) {
  const { s, now } = useApp()
  const router = useRouter()
  const [cancel, setCancel] = useState(false)
  const b = s.bookings.find((x) => x.id === id)
  useEffect(() => {
    if (b)
      document.title = `${b.resource ?? b.title}, ${fmtRange(b.start, b.end)} · Cactus Peak Athletic`
  }, [b])
  if (!b)
    return (
      <EmptyState
        title="We couldn't find that reservation."
        action={
          <Button render={<Link href="/reserve" />}>Back to Reserve</Button>
        }
      />
    )
  const club = CLUB_BY_SLUG[b.clubSlug]
  const cn0 = cancelNote(s, b.memberId, b.start, now, b.kind)
  return (
    <div className="max-w-[560px]">
      <PageHeader title="Reservation confirmed" className="sr-only" />
      <SuccessPanel
        pill="Reserved"
        headline={`${b.resource ?? b.title}, ${fmtRange(b.start, b.end)}`}
        summary={[
          {
            label: "Sport",
            value: (b.sport ?? "").replace(/^./, (c) => c.toUpperCase()),
          },
          { label: "Club", value: club.name },
          { label: "Court", value: b.resource },
          {
            label: "When",
            value: `${fmtDay(b.start)} · ${fmtRange(b.start, b.end)}`,
          },
          { label: "Reference", value: b.ref },
        ]}
        event={{
          title: b.title,
          start: b.start,
          end: b.end,
          location: `${club.name}, ${club.address}`,
          uid: b.id,
        }}
        shareText={`https://my.cactuspeakathletic.example/invite/${b.ref}`}
        extra={
          b.players?.length ? (
            <ul className="flex w-full flex-col rule-rows" aria-label="Players">
              {b.players.map((p) => (
                <li
                  key={p.name}
                  className="flex items-center justify-between gap-3 py-2 text-caption"
                >
                  <span>{p.name}</span>
                  <span className="rounded-full bg-muted px-2 py-0.5 text-detail">
                    {p.status === "confirmed"
                      ? "Confirmed"
                      : p.status === "guest"
                        ? "Guest pass sent"
                        : "Invited"}
                  </span>
                </li>
              ))}
            </ul>
          ) : null
        }
        rows={[
          {
            label: "Get directions",
            href: `https://maps.google.com/?q=${encodeURIComponent(club.address)}`,
          },
          {
            label: "Call the club",
            href: `tel:${club.phone.replace(/\D/g, "")}`,
          },
          { label: "Club details", href: `/clubs/${club.slug}` },
        ]}
        onDone={() => router.push("/reserve")}
      />
      <p
        className={cn(
          "mt-4 text-caption",
          cn0.late
            ? "rounded-md bg-warning-subtle px-3 py-2"
            : "text-muted-foreground"
        )}
      >
        {cn0.text}{" "}
        <button
          type="button"
          className="text-link underline"
          onClick={() => setCancel(true)}
        >
          Cancel reservation
        </button>
      </p>
      <CancelDialog booking={b} open={cancel} onOpenChange={setCancel} />
      <span className="sr-only">{now}</span>
    </div>
  )
}
