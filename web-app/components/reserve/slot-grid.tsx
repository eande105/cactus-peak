"use client"
import { useRef } from "react"
import { fmtTime, parts } from "@/lib/time"
import { cn } from "@/lib/utils"

export type CellStatus =
  | "open"
  | "mine"
  | "taken"
  | "closed"
  | "past"
  | "short"
  | "notOpen"
  | "full"
export interface CellInfo {
  status: CellStatus
  swimmers?: number
  label?: string
}
export interface GridRow {
  id: number
  label: string
  sub?: string
}

// Matrix of resources (rows) by start times (columns). One radiogroup, roving focus, arrow-key movement.
export function SlotGrid({
  kind,
  rows,
  slots,
  info,
  selected,
  rangeCells = 1,
  onSelect,
  onHeaderClick,
  label,
  disabled,
}: {
  kind: "court" | "lane"
  rows: GridRow[]
  slots: number[]
  info: (row: number, slot: number) => CellInfo
  selected: { row: number; slot: number } | null
  rangeCells?: number
  onSelect: (row: number, slot: number) => void
  onHeaderClick?: (slot: number) => void
  label: string
  disabled?: boolean
  now?: number
}) {
  const ref = useRef<HTMLDivElement>(null)
  const am = slots.filter((s) => parts(s).h < 12)
  const pm = slots.filter((s) => parts(s).h >= 12)
  const cols = `104px repeat(${slots.length}, ${kind === "court" ? 68 : 84}px)`
  const move = (e: React.KeyboardEvent) => {
    const el = document.activeElement as HTMLElement
    if (el?.getAttribute("role") !== "radio") return
    const r = Number(el.dataset.row)
    const c = Number(el.dataset.col)
    let nr = r,
      nc = c
    if (e.key === "ArrowRight") nc++
    else if (e.key === "ArrowLeft") nc--
    else if (e.key === "ArrowDown") nr++
    else if (e.key === "ArrowUp") nr--
    else if (e.key === "Home") nc = 0
    else if (e.key === "End") nc = slots.length - 1
    else if (e.key === "PageDown") nc += kind === "court" ? 6 : 4
    else if (e.key === "PageUp") nc -= kind === "court" ? 6 : 4
    else if (e.key === "Escape") {
      ;(e.currentTarget as HTMLElement).dispatchEvent(
        new CustomEvent("clear", { bubbles: true })
      )
      return
    } else return
    e.preventDefault()
    nr = Math.max(0, Math.min(rows.length - 1, nr))
    nc = Math.max(0, Math.min(slots.length - 1, nc))
    ref.current
      ?.querySelector<HTMLElement>(`[data-row="${nr}"][data-col="${nc}"]`)
      ?.focus()
  }
  const firstOpen = (() => {
    for (let r = 0; r < rows.length; r++)
      for (let c = 0; c < slots.length; c++)
        if (info(rows[r].id, slots[c]).status === "open") return `${r}-${c}`
    return "0-0"
  })()
  return (
    <div className="relative">
      <div className="overflow-x-auto rounded-lg bg-card edge ring-border">
        <div
          ref={ref}
          role="radiogroup"
          aria-label={label}
          onKeyDown={move}
          className="relative grid w-max min-w-full"
          style={{ gridTemplateColumns: cols }}
        >
          <div className="sticky left-0 z-10 bg-card" />
          <div
            style={{ gridColumn: `span ${am.length}` }}
            className="border-b border-border px-2 py-1 eyebrow text-muted-foreground"
          >
            AM
          </div>
          {pm.length ? (
            <div
              style={{ gridColumn: `span ${pm.length}` }}
              className="border-b border-l border-border px-2 py-1 eyebrow text-muted-foreground"
            >
              PM
            </div>
          ) : null}
          <div className="sticky left-0 z-10 border-b border-border bg-card" />
          {slots.map((s) => (
            <div key={s} className="border-b border-border">
              {onHeaderClick ? (
                <button
                  type="button"
                  onClick={() => onHeaderClick(s)}
                  aria-label={`Any lane at ${fmtTime(s)}`}
                  className="grid min-h-11 w-full place-items-center num text-detail font-semibold hover:bg-muted"
                >
                  {fmtTime(s, false)}
                </button>
              ) : (
                <div className="grid min-h-11 place-items-center num text-detail font-semibold">
                  {fmtTime(s, false)}
                </div>
              )}
            </div>
          ))}
          {rows.map((row, r) => (
            <div key={row.id} className="contents">
              <div className="sticky left-0 z-10 flex min-h-12 flex-col justify-center border-b border-l-2 border-border border-l-[var(--cat-court)] bg-card px-3 text-label">
                {row.label}
                {row.sub ? (
                  <span className="text-detail font-normal text-muted-foreground">
                    {row.sub}
                  </span>
                ) : null}
              </div>
              {slots.map((s, c) => {
                const i = info(row.id, s)
                const sel =
                  selected &&
                  selected.row === row.id &&
                  selected.slot <= s &&
                  s <
                    selected.slot +
                      rangeCells * (kind === "court" ? 1800000 : 2700000)
                const start = selected?.row === row.id && selected.slot === s
                const free = i.status === "open"
                const name = `${row.label}, ${fmtTime(s)}, ${i.status === "open" ? (i.swimmers === 1 ? "1 of 2 swimmers" : "available") : i.status === "mine" ? "yours" : i.status === "taken" || i.status === "full" ? "taken" : i.status === "closed" ? "closed" : i.status === "short" ? "not enough time for this length" : i.status === "notOpen" ? i.label : "past"}`
                return (
                  <div
                    key={s}
                    className={cn(
                      "border-b border-border",
                      c === am.length && "border-l"
                    )}
                  >
                    {/* biome-ignore lint/a11y/useSemanticElements: slot picker with roving tabindex, a native radio input cannot fill the grid cell */}
                    <button
                      type="button"
                      role="radio"
                      aria-checked={!!start}
                      aria-label={name}
                      aria-disabled={!free || disabled || undefined}
                      data-row={r}
                      data-col={c}
                      tabIndex={
                        selected
                          ? start
                            ? 0
                            : -1
                          : firstOpen === `${r}-${c}`
                            ? 0
                            : -1
                      }
                      onClick={() => {
                        if (free && !disabled) onSelect(row.id, s)
                      }}
                      className={cn(
                        "relative grid size-full min-h-12 place-items-center text-detail transition-colors",
                        sel
                          ? "bg-night text-on-night"
                          : i.status === "mine"
                            ? "bg-accent"
                            : i.status === "taken" || i.status === "full"
                              ? "bg-muted hatch text-muted-foreground"
                              : i.status === "closed"
                                ? "bg-muted hatch text-muted-foreground"
                                : i.status === "past" || i.status === "notOpen"
                                  ? "bg-muted/40 text-muted-foreground"
                                  : i.status === "short"
                                    ? "text-muted-foreground opacity-60"
                                    : "hover:bg-muted"
                      )}
                    >
                      {sel ? (
                        start ? (
                          <span className="num font-semibold">
                            {kind === "lane" ? (
                              <span className="flex items-center gap-0.5">
                                {[0, 1].map((k) => (
                                  <span
                                    key={k}
                                    className={cn(
                                      "size-2 rounded-full",
                                      k < (i.swimmers ?? 0) + 1
                                        ? "bg-on-night"
                                        : "border border-on-night"
                                    )}
                                  />
                                ))}
                              </span>
                            ) : (
                              "✓"
                            )}
                          </span>
                        ) : null
                      ) : i.status === "open" ? (
                        kind === "lane" ? (
                          <span className="flex flex-col items-center gap-0.5">
                            <span className="flex gap-0.5">
                              {[0, 1].map((k) => (
                                <span
                                  key={k}
                                  className={cn(
                                    "size-2 rounded-full",
                                    k < (i.swimmers ?? 0)
                                      ? "bg-foreground"
                                      : "border border-input"
                                  )}
                                />
                              ))}
                            </span>
                            {i.swimmers === 1 ? (
                              <span className="text-tab leading-none text-muted-foreground">
                                1 of 2
                              </span>
                            ) : null}
                          </span>
                        ) : (
                          <span
                            aria-hidden="true"
                            className="size-2 rounded-full bg-success"
                          />
                        )
                      ) : i.status === "mine" ? (
                        <span className="text-tab font-semibold">Yours</span>
                      ) : i.status === "taken" || i.status === "full" ? (
                        <span className="sr-only">Taken</span>
                      ) : i.status === "closed" ? (
                        <span className="text-tab">Closed</span>
                      ) : null}
                    </button>
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      </div>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 right-0 w-10 rounded-r-lg bg-gradient-to-l from-card to-transparent"
      />
      <p className="mt-1 text-detail text-muted-foreground">
        Scroll sideways for later times.
      </p>
    </div>
  )
}

// Below 1024px: one row per start time, resources as 44px chips. No horizontal scroll.
export function SlotList({
  kind,
  rows,
  slots,
  info,
  selected,
  onSelect,
  label,
  disabled,
}: {
  kind: "court" | "lane"
  rows: GridRow[]
  slots: number[]
  info: (row: number, slot: number) => CellInfo
  selected: { row: number; slot: number } | null
  onSelect: (row: number, slot: number) => void
  label: string
  disabled?: boolean
}) {
  return (
    <div
      role="radiogroup"
      aria-label={label}
      className="flex flex-col rule-rows"
    >
      {slots.map((s) => (
        <div key={s} className="flex flex-col gap-1.5 py-3 first:pt-0">
          <p className="num text-label">{fmtTime(s)}</p>
          <div className="flex flex-wrap gap-2">
            {rows.map((r) => {
              const i = info(r.id, s)
              const on = selected?.row === r.id && selected.slot === s
              const free = i.status === "open"
              return (
                // biome-ignore lint/a11y/useSemanticElements: slot picker with roving tabindex, a native radio input cannot fill the grid cell
                <button
                  key={r.id}
                  type="button"
                  role="radio"
                  aria-checked={on}
                  aria-disabled={!free || disabled || undefined}
                  aria-label={`${r.label}, ${fmtTime(s)}, ${free ? (i.swimmers === 1 ? "1 of 2 swimmers" : "available") : i.status === "mine" ? "yours" : i.status === "short" ? "not enough time" : i.status}`}
                  onClick={() => {
                    if (free && !disabled) onSelect(r.id, s)
                  }}
                  className={cn(
                    "min-h-11 min-w-20 rounded-md px-3 text-caption edge ring-input",
                    on
                      ? "bg-night text-on-night"
                      : free
                        ? "bg-card hover:bg-muted"
                        : "bg-muted hatch text-muted-foreground opacity-70"
                  )}
                >
                  <span className="flex flex-col items-center leading-tight">
                    <span>{r.label}</span>
                    {kind === "lane" && free && i.swimmers === 1 ? (
                      <span className="text-detail text-muted-foreground">
                        1 of 2 swimmers
                      </span>
                    ) : null}
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
