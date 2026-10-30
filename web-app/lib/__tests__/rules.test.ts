import { describe, expect, it } from "vitest"
import { previewUpgrade } from "@/lib/actions"
import { busyHint, cancelNote, nextBillingDate } from "@/lib/engine"
import {
  atTime,
  DEMO_START,
  endSentence,
  fmtDelta,
  fmtTime,
  fromKey,
  HOUR,
  MIN,
} from "@/lib/time"
import { seedState } from "./fixture"

describe("time copy", () => {
  it("formats times with a.m. and p.m.", () => {
    expect(fmtTime(atTime(fromKey("2026-10-27"), "06:00"))).toBe("6:00 a.m.")
    expect(fmtTime(atTime(fromKey("2026-10-27"), "12:00"))).toBe("12:00 p.m.")
  })
  it("endSentence never doubles the full stop", () => {
    expect(endSentence("Free to cancel until 4:00 a.m.")).toBe(
      "Free to cancel until 4:00 a.m."
    )
    expect(endSentence("Free to cancel until 4:00 a.m..")).toBe(
      "Free to cancel until 4:00 a.m."
    )
    expect(endSentence("Booked")).toBe("Booked.")
  })
  it("fmtDelta uses a real minus", () => {
    expect(fmtDelta(-25)).toBe("−$25")
    expect(fmtDelta(50)).toBe("+$50")
    expect(fmtDelta(-25)).not.toContain("$-")
  })
})

describe("cancelNote", () => {
  const s = seedState()
  const now = DEMO_START
  it("class far away is free and ends in one full stop", () => {
    const t = cancelNote(s, "maya", now + 10 * HOUR, now, "class").text
    expect(t.startsWith("Free to cancel until")).toBe(true)
    expect(t).not.toContain("..")
  })
  it("class inside 2 hours is a late cancel with the strike count", () => {
    const c = cancelNote(s, "maya", now + 20 * MIN, now, "class")
    expect(c.late).toBe(true)
    expect(c.text).toContain("strike 2 of 3")
  })
  it("class that started says Started, not starts in", () => {
    const c = cancelNote(s, "maya", now - 5 * MIN, now, "class")
    expect(c.text.startsWith("Started.")).toBe(true)
    expect(c.text).not.toContain("starts in")
  })
  it("PT inside 24 hours uses the session and never says free until yesterday", () => {
    const c = cancelNote(s, "maya", now + 7 * HOUR, now, "pt")
    expect(c.late).toBe(true)
    expect(c.text).toContain("uses the session")
  })
  it("PT beyond 24 hours names the free-until time", () => {
    expect(cancelNote(s, "maya", now + 40 * HOUR, now, "pt").text).toMatch(
      /^Free to cancel or move until/
    )
  })
})

describe("billing date", () => {
  it("Maya's next charge is Nov 12", () => {
    const s = seedState()
    const d = nextBillingDate(s.households.h1, DEMO_START)
    expect(new Date(d - 7 * HOUR).toISOString().slice(0, 10)).toBe("2026-11-12")
  })
  it("upgrade preview next charge equals the household next billing date", () => {
    const s = seedState()
    const hh = s.households.h1
    expect(previewUpgrade(s, hh, "summit", DEMO_START).next).toBe(
      nextBillingDate(hh, DEMO_START)
    )
    expect(previewUpgrade(s, hh, "summit", DEMO_START).today).toBe(25.81)
  })
  it("busyness hint has no double stop", () => {
    expect(busyHint("gilbert-val-vista", DEMO_START)).not.toContain("..")
  })
})
