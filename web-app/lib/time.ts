// All times are America/Phoenix (UTC-7, no daylight saving). We store epoch milliseconds and format with a fixed offset.
export const OFFSET = -7 * 3600_000
export const MIN = 60_000
export const HOUR = 3600_000
export const DAY = 86_400_000
// The demo starts on Tuesday, Oct 27, 2026 at 5:40 a.m. Arizona time.
export const DEMO_START = Date.UTC(2026, 9, 27, 12, 40)

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
]
const DOW = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
const DOW_LONG = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
]

export { DOW, DOW_LONG, MONTHS }

export function parts(ms: number) {
  const d = new Date(ms + OFFSET)
  return {
    y: d.getUTCFullYear(),
    m: d.getUTCMonth(),
    d: d.getUTCDate(),
    h: d.getUTCHours(),
    min: d.getUTCMinutes(),
    s: d.getUTCSeconds(),
    dow: d.getUTCDay(),
  }
}
export function dayStart(ms: number) {
  return Math.floor((ms + OFFSET) / DAY) * DAY - OFFSET
}
export function addDays(ms: number, n: number) {
  return dayStart(ms) + n * DAY
}
export function dateKey(ms: number) {
  const p = parts(ms)
  return `${p.y}-${String(p.m + 1).padStart(2, "0")}-${String(p.d).padStart(2, "0")}`
}
export function fromKey(key: string) {
  const [y, m, d] = key.split("-").map(Number)
  return Date.UTC(y, m - 1, d, 0, 0) - OFFSET
}
export function atTime(dayMs: number, hhmm: string) {
  const [h, m] = hhmm.split(":").map(Number)
  return dayStart(dayMs) + h * HOUR + m * MIN
}
export function minutesOfDay(ms: number) {
  const p = parts(ms)
  return p.h * 60 + p.min
}
export function fmtTime(ms: number, withSuffix = true) {
  const { h, min } = parts(ms)
  const h12 = h % 12 === 0 ? 12 : h % 12
  return `${h12}:${String(min).padStart(2, "0")}${withSuffix ? (h < 12 ? " a.m." : " p.m.") : ""}`
}
export function fmtRange(a: number, b: number) {
  const pa = parts(a)
  const pb = parts(b)
  const sameHalf = pa.h < 12 === pb.h < 12
  return `${fmtTime(a, !sameHalf)}–${fmtTime(b)}`.replace(/(\d)(–)/, "$1$2")
}
export function fmtDay(ms: number) {
  const p = parts(ms)
  return `${DOW[p.dow]}, ${MONTHS[p.m]} ${p.d}`
}
export function fmtDayShort(ms: number) {
  const p = parts(ms)
  return `${MONTHS[p.m]} ${p.d}`
}
export function fmtDayLong(ms: number) {
  const p = parts(ms)
  return `${DOW_LONG[p.dow]}, ${MONTHS[p.m]} ${p.d}`
}
export function fmtDayTime(ms: number) {
  return `${fmtDay(ms)}, ${fmtTime(ms)}`
}
export function fmtDowTime(ms: number) {
  return `${DOW[parts(ms).dow]} ${fmtTime(ms)}`
}
export function fmtDateFull(ms: number) {
  const p = parts(ms)
  return `${MONTHS[p.m]} ${p.d}, ${p.y}`
}
export function isSameDay(a: number, b: number) {
  return dayStart(a) === dayStart(b)
}
export function relDay(ms: number, now: number) {
  const diff = Math.round((dayStart(ms) - dayStart(now)) / DAY)
  if (diff === 0) return "Today"
  if (diff === 1) return "Tomorrow"
  return fmtDay(ms)
}
export function fmtCountdown(msLeft: number) {
  const t = Math.max(0, Math.ceil(msLeft / 1000))
  return `${Math.floor(t / 60)}:${String(t % 60).padStart(2, "0")}`
}
export function fmtRelative(ms: number, now: number) {
  const diff = now - ms
  if (diff < 0) return fmtDayTime(ms)
  if (diff < HOUR)
    return diff < 90_000 ? "Just now" : `${Math.round(diff / MIN)} min ago`
  if (isSameDay(ms, now)) return fmtTime(ms)
  if (isSameDay(ms, now - DAY)) return "Yesterday"
  return DOW[parts(ms).dow] + (now - ms > 6 * DAY ? ` ${fmtDayShort(ms)}` : "")
}
export function monthLabel(ms: number) {
  const p = parts(ms)
  return `${["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"][p.m]} ${p.y}`
}
export function fmtMoney(n: number, cents = true) {
  return `$${n.toLocaleString("en-US", { minimumFractionDigits: cents ? 2 : 0, maximumFractionDigits: cents ? 2 : 0 })}`
}
// A sentence that ends in a time ("9:30 a.m.") already carries its full stop. This never adds a second one.
export function endSentence(s: string) {
  const t = s.trimEnd().replace(/\.{2,}$/, ".")
  return /[.!?]$/.test(t) ? t : `${t}.`
}
// Money change with a real minus sign: "+$50.00" and "−$25.00".
export function fmtDelta(n: number, cents = false) {
  const abs = fmtMoney(Math.abs(n), cents)
  return n < 0 ? `−${abs}` : `+${abs}`
}
export function hourLabel(h: number) {
  return `${h % 12 === 0 ? 12 : h % 12}${h < 12 ? " a.m." : " p.m."}`
}
