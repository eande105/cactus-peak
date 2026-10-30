// Club time is Arizona time (America/Phoenix). Arizona has no daylight saving, so it is UTC-7 all year.
// Never use the viewer's time zone for club hours or class times.
export const CLUB_TIME_ZONE = "America/Phoenix"
const AZ_OFFSET_MIN = 7 * 60

/** Minutes since 1970-01-01 00:00 Arizona time. One number, so React can compare clock snapshots by value. */
export function azNowKey(ms: number = Date.now()) {
  return Math.floor(ms / 60_000) - AZ_OFFSET_MIN
}

export type ClubNow = {
  /** Days since 1970-01-01 in Arizona. */
  dayNum: number
  /** 0 = Sunday. */
  weekday: number
  /** Minutes after midnight. */
  min: number
}
export function clubNowFromKey(key: number): ClubNow {
  const dayNum = Math.floor(key / 1440)
  return { dayNum, weekday: (dayNum + 4) % 7, min: key - dayNum * 1440 }
}

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
const DAYS_LONG = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
]
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

export type DayInfo = {
  /** Days from today. */
  i: number
  short: string
  long: string
  dom: number
  month: string
  label: string
  weekend: boolean
  /** 0 = Sunday. */
  weekday: number
  /** "YYYY-MM-DD" */
  iso: string
}

/** The day `i` days after `today` (an Arizona day number from ClubNow). */
export function dayInfo(i: number, today: number): DayInfo {
  const dayNum = today + i
  const date = new Date(dayNum * 86_400_000)
  const weekday = (dayNum + 4) % 7
  return {
    i,
    short: DAYS[weekday],
    long: DAYS_LONG[weekday],
    dom: date.getUTCDate(),
    month: MONTHS[date.getUTCMonth()],
    label: i === 0 ? "Today" : DAYS[weekday],
    weekend: weekday === 0 || weekday === 6,
    weekday,
    iso: date.toISOString().slice(0, 10),
  }
}

/** "2026-10-12" -> "Oct 12, 2026". A date with no time has no zone, so it is read as UTC. */
export function fmtDateOnly(iso: string) {
  const d = new Date(`${iso}T00:00:00Z`)
  return `${MONTHS[d.getUTCMonth()]} ${d.getUTCDate()}, ${d.getUTCFullYear()}`
}

/** "05:30:00" -> 330 */
export function timeToMinutes(time: string) {
  const [h, m] = time.split(":")
  return Number(h) * 60 + Number(m)
}

export function fmtTime(min: number, bare = false) {
  const h24 = Math.floor(min / 60) % 24
  const m = min % 60
  const h = h24 % 12 === 0 ? 12 : h24 % 12
  const s = `${h}:${String(m).padStart(2, "0")}`
  return bare ? s : `${s} ${h24 < 12 ? "a.m." : "p.m."}`
}
export function fmtTimeShort(min: number) {
  const h24 = Math.floor(min / 60) % 24
  const m = min % 60
  const h = h24 % 12 === 0 ? 12 : h24 % 12
  return `${h}${m ? `:${String(m).padStart(2, "0")}` : ""} ${h24 < 12 ? "a.m." : "p.m."}`
}
export function fmtRange(a: number, b: number) {
  return `${fmtTime(a)}–${fmtTime(b)}`
}

// Hours are the same at all five clubs (00-foundation.md §2): Mon–Fri 4:30 a.m.–10 p.m., Sat–Sun 6 a.m.–8 p.m.
// Pools close 30 minutes before the club. The database has no hours table yet.
export const WEEKDAY_HOURS: [number, number] = [4 * 60 + 30, 22 * 60]
export const WEEKEND_HOURS: [number, number] = [6 * 60, 20 * 60]
export const POOL_CLOSES_EARLY_MIN = 30
const CLOSING_SOON_MIN = 60

/** Club hours for a weekday (0 = Sunday). */
export function clubHours(weekday: number): [number, number] {
  return weekday === 0 || weekday === 6 ? WEEKEND_HOURS : WEEKDAY_HOURS
}

export type OpenState = "open" | "closingSoon" | "opensLater" | "closed"
export type ClubStatus = {
  state: OpenState
  open: boolean
  /** "Open · until 10 p.m." */
  text: string
  /** "Open until 10 p.m." */
  short: string
  /** Today's hours, "4:30 a.m.–10:00 p.m." */
  hours: string
}

export function clubStatus(now: ClubNow): ClubStatus {
  const [open, close] = clubHours(now.weekday)
  const hours = fmtRange(open, close)
  if (now.min < open)
    return {
      state: "opensLater",
      open: false,
      text: `Closed · opens ${fmtTimeShort(open)}`,
      short: `Closed, opens ${fmtTimeShort(open)}`,
      hours,
    }
  if (now.min >= close) {
    const [next] = clubHours((now.weekday + 1) % 7)
    return {
      state: "closed",
      open: false,
      text: `Closed · opens ${fmtTimeShort(next)} tomorrow`,
      short: `Closed, opens ${fmtTimeShort(next)}`,
      hours,
    }
  }
  if (close - now.min <= CLOSING_SOON_MIN)
    return {
      state: "closingSoon",
      open: true,
      text: `Closing soon · ${fmtTimeShort(close)}`,
      short: `Closes at ${fmtTimeShort(close)}`,
      hours,
    }
  return {
    state: "open",
    open: true,
    text: `Open · until ${fmtTimeShort(close)}`,
    short: `Open until ${fmtTimeShort(close)}`,
    hours,
  }
}
