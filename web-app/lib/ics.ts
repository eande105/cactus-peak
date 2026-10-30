import { DOW } from "@/lib/time"

export interface CalEvent {
  title: string
  start: number
  end: number
  location?: string
  description?: string
  uid?: string
  url?: string
}
const z = (ms: number) =>
  new Date(ms)
    .toISOString()
    .replace(/[-:]/g, "")
    .replace(/\.\d{3}/, "")
const esc = (t: string) =>
  t
    .replace(/\\/g, "\\\\")
    .replace(/;/g, ";")
    .replace(/,/g, "\\,")
    .replace(/\n/g, "\\n")

export function buildIcs(events: CalEvent[]) {
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Cactus Peak Athletic//Member app//EN",
    "CALSCALE:GREGORIAN",
    "X-WR-TIMEZONE:America/Phoenix",
    "BEGIN:VTIMEZONE",
    "TZID:America/Phoenix",
    "BEGIN:STANDARD",
    "DTSTART:19700101T000000",
    "TZOFFSETFROM:-0700",
    "TZOFFSETTO:-0700",
    "TZNAME:MST",
    "END:STANDARD",
    "END:VTIMEZONE",
  ]
  for (const e of events) {
    lines.push(
      "BEGIN:VEVENT",
      `UID:${e.uid ?? `${e.start}-${esc(e.title)}`}@cactuspeakathletic.example`,
      `DTSTAMP:${z(Date.now())}`,
      "SEQUENCE:0",
      `DTSTART:${z(e.start)}`,
      `DTEND:${z(e.end)}`,
      `SUMMARY:${esc(e.title)}`
    )
    if (e.location) lines.push(`LOCATION:${esc(e.location)}`)
    if (e.description) lines.push(`DESCRIPTION:${esc(e.description)}`)
    lines.push(
      "BEGIN:VALARM",
      "TRIGGER:-PT60M",
      "ACTION:DISPLAY",
      "DESCRIPTION:Reminder",
      "END:VALARM",
      "END:VEVENT"
    )
  }
  lines.push("END:VCALENDAR")
  return lines.join("\r\n")
}
export function downloadIcs(e: CalEvent) {
  const blob = new Blob([buildIcs([e])], { type: "text/calendar" })
  const a = document.createElement("a")
  a.href = URL.createObjectURL(blob)
  const d = new Date(e.start - 7 * 3600_000)
  a.download = `${e.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(d.getUTCDate()).padStart(2, "0")}.ics`
  document.body.appendChild(a)
  a.click()
  a.remove()
}
export function googleUrl(e: CalEvent) {
  const q = new URLSearchParams({
    action: "TEMPLATE",
    text: e.title,
    dates: `${z(e.start)}/${z(e.end)}`,
    details: e.description ?? "",
    location: e.location ?? "",
    ctz: "America/Phoenix",
  })
  return `https://calendar.google.com/calendar/render?${q}`
}
void DOW
