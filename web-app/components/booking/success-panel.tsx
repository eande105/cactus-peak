"use client"
import Link from "next/link"
import type { ReactNode } from "react"
import { AddToCalendar } from "@/components/booking/calendar-menu"
import { ChevronRight } from "@/components/icons"
import type { CalEvent } from "@/lib/ics"
import { toast } from "@/lib/toast"

// A confirmation is a page about the thing that happened: the fact as the title, the rule that applies, the details as
// hairline rows, one next step in copper (only when there is one), then plain links. No box, no check, no Done button.
export function SuccessPanel({
  headline,
  pill,
  summary,
  event,
  primary,
  shareText,
  shareLabel = "Copy link",
  rows,
  onDone,
  doneLabel = "Back",
  extra,
  className,
}: {
  headline: string
  pill?: string
  summary: { label: string; value: ReactNode }[]
  event?: CalEvent
  primary?: ReactNode
  shareText?: string
  shareLabel?: string
  rows?: { label: string; href?: string; onClick?: () => void }[]
  onDone?: () => void
  doneLabel?: string
  extra?: ReactNode
  className?: string
}) {
  const row =
    "flex min-h-12 w-full items-center justify-between text-left text-body hover:text-link"
  return (
    <div
      className={`flex flex-col items-start gap-4 ${className ?? ""}`}
      role="status"
    >
      <div className="flex flex-col gap-1">
        {pill ? <p className="eyebrow text-success">{pill}</p> : null}
        <h2 className="font-heading text-h2 display-stretch">{headline}</h2>
      </div>
      {extra}
      <dl className="w-full rule-rows rule-t">
        {summary.map((r) => (
          <div
            key={r.label}
            className="flex justify-between gap-4 py-2.5 text-caption"
          >
            <dt className="text-muted-foreground">{r.label}</dt>
            <dd className="min-w-0 text-right num">{r.value}</dd>
          </div>
        ))}
      </dl>
      {primary ??
        (event ? <AddToCalendar event={event} variant="primary" /> : null)}
      {rows?.length || shareText ? (
        <ul className="w-full rule-rows rule-t">
          {rows?.map((r) => (
            <li key={r.label}>
              {r.href ? (
                <Link href={r.href} className={row}>
                  {r.label}
                  <ChevronRight
                    className="size-4 text-muted-foreground"
                    aria-hidden="true"
                  />
                </Link>
              ) : (
                <button type="button" onClick={r.onClick} className={row}>
                  {r.label}
                  <ChevronRight
                    className="size-4 text-muted-foreground"
                    aria-hidden="true"
                  />
                </button>
              )}
            </li>
          ))}
          {shareText ? (
            <li>
              <button
                type="button"
                className={row}
                onClick={() => {
                  void navigator.clipboard?.writeText(shareText)
                  toast({ title: "Link copied" })
                }}
              >
                {shareLabel}
                <ChevronRight
                  className="size-4 text-muted-foreground"
                  aria-hidden="true"
                />
              </button>
            </li>
          ) : null}
        </ul>
      ) : null}
      {onDone ? (
        <button
          type="button"
          onClick={onDone}
          className="text-link min-h-11 text-label underline underline-offset-4"
        >
          {doneLabel}
        </button>
      ) : null}
    </div>
  )
}
