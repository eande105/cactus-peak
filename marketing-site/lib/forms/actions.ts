"use server"

import { randomInt } from "node:crypto"
import { getCatalog } from "@/lib/catalog/server"
import { getWriteClient } from "@/lib/supabase/public"

// Server actions for the marketing forms. Each one validates on the server again (the client checks are only for
// speed), drops bot posts that fill the honeypot, and inserts one row. The request tables allow anon inserts but
// no reads, so no insert asks for the row back. Nothing here puts personal data in a URL.

export type FormResult<T = object> =
  | ({ ok: true } & T)
  | { ok: false; error: string; fields?: Record<string, string> }

const EMAIL = /^[^@\s]+@[^@\s]+\.[^@\s]+$/
const NETWORK_ERROR =
  "We could not send that. Check your connection and try again, or call (480) 555-0100."

const str = (v: unknown, max: number) =>
  typeof v === "string" ? v.trim().slice(0, max + 1) : ""
const digitsOf = (v: string) => v.replace(/\D/g, "")
const isEmail = (v: string) => v.length <= 200 && EMAIL.test(v)
const isPhone = (v: string) => digitsOf(v).length === 10
/** A bot fills every field it sees, including the hidden one. A person never sees it. */
const isBot = (honeypot: unknown) =>
  typeof honeypot === "string" && honeypot.trim() !== ""

function fail(fields: Record<string, string>): FormResult<never> {
  return {
    ok: false,
    error: "Fix the fields below and try again.",
    fields,
  }
}

async function knownClub(slug: string) {
  const { clubs } = await getCatalog()
  return clubs.some((c) => c.slug === slug)
}

/** Turns an insert result into a FormResult. Logs the database error on the server only. */
function done<T extends object>(
  table: string,
  error: unknown,
  extra: T
): FormResult<T> {
  if (error) {
    console.error(`Insert into ${table} failed`, error)
    return { ok: false, error: NETWORK_ERROR }
  }
  return { ok: true, ...extra }
}

// ---------------------------------------------------------------------------------------------
// Tour
// ---------------------------------------------------------------------------------------------

export type TourInput = {
  club: string
  /** Start of the tour, ISO 8601 with zone. */
  slotAt: string
  firstName: string
  contact: string
  note: string
  remind: boolean
  withCoach: string
  company?: string
}

export async function submitTour(
  input: TourInput
): Promise<FormResult<{ ref: string }>> {
  const ref = `T${randomInt(1000, 10000)}`
  if (isBot(input.company)) return { ok: true, ref }

  const firstName = str(input.firstName, 80)
  const contact = str(input.contact, 200)
  const note = str(input.note, 1000)
  const withCoach = str(input.withCoach, 80)
  const slot = new Date(str(input.slotAt, 40))
  const fields: Record<string, string> = {}
  if (!firstName || firstName.length > 80)
    fields.first = "Enter your first name (80 characters or fewer)."
  if (!(isEmail(contact) || isPhone(contact)))
    fields.contact = "Enter an email or a 10-digit mobile number."
  if (note.length > 1000) fields.note = "Use 1,000 characters or fewer."
  const ms = slot.getTime()
  if (Number.isNaN(ms) || ms < Date.now() || ms > Date.now() + 31 * 86_400_000)
    fields.time = "Pick a time in the next two weeks."
  if (!(await knownClub(input.club))) fields.club = "Pick a club."
  if (Object.keys(fields).length) return fail(fields)

  const { error } = await getWriteClient()
    .from("tour_requests")
    .insert({
      ref,
      club_slug: input.club,
      slot_at: slot.toISOString(),
      first_name: firstName,
      contact,
      note: note || null,
      remind: Boolean(input.remind) && isPhone(contact),
      with_coach: withCoach || null,
    })
  return done("tour_requests", error, { ref })
}

// ---------------------------------------------------------------------------------------------
// 3-day pass
// ---------------------------------------------------------------------------------------------

export type TrialInput = {
  club: string
  firstName: string
  contact: string
  remind: boolean
  company?: string
}

export async function submitTrial(
  input: TrialInput
): Promise<FormResult<{ code: string }>> {
  const code = `${randomInt(1000, 10000)} ${randomInt(1000, 10000)}`
  if (isBot(input.company)) return { ok: true, code }

  const firstName = str(input.firstName, 80)
  const contact = str(input.contact, 200)
  const fields: Record<string, string> = {}
  if (!(await knownClub(input.club))) fields.club = "Pick a club."
  if (!firstName || firstName.length > 80)
    fields.first = "Enter your first name (80 characters or fewer)."
  if (!(isEmail(contact) || isPhone(contact)))
    fields.contact =
      "Enter an email like name@example.com or a 10-digit mobile number."
  if (Object.keys(fields).length) return fail(fields)

  const { error } = await getWriteClient()
    .from("trial_passes")
    .insert({
      code,
      club_slug: input.club,
      first_name: firstName,
      contact,
      remind: Boolean(input.remind) && isPhone(contact),
    })
  return done("trial_passes", error, { code })
}

// ---------------------------------------------------------------------------------------------
// Join
// ---------------------------------------------------------------------------------------------

type Person = { first: string; last: string; birth?: string; dob?: string }
export type JoinInput = {
  plan: string
  club: string
  first: string
  last: string
  email: string
  phone: string
  birthDate: string
  zip: string
  smsOptIn: boolean
  newsOptIn: boolean
  mode: "solo" | "family"
  family: { adults: Person[]; kids: Person[] }
  promo: string
  company?: string
}

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/
function cleanPeople(list: unknown, max: number) {
  if (!Array.isArray(list)) return []
  return list.slice(0, max).map((p: Person) => ({
    first: str(p?.first, 80),
    last: str(p?.last, 80),
    birth: ISO_DATE.test(str(p?.birth ?? p?.dob, 10))
      ? str(p?.birth ?? p?.dob, 10)
      : null,
  }))
}

/** Sends the plan and the people. The demo payment step sends nothing: no card data reaches the server. */
export async function submitJoin(input: JoinInput): Promise<FormResult> {
  if (isBot(input.company)) return { ok: true }

  const first = str(input.first, 80)
  const last = str(input.last, 80)
  const email = str(input.email, 200)
  const phone = str(input.phone, 30)
  const zip = str(input.zip, 10)
  const birth = str(input.birthDate, 10)
  const promo = str(input.promo, 40)
  const fields: Record<string, string> = {}
  if (!first || first.length > 80) fields.first = "Enter your first name."
  if (!last || last.length > 80) fields.last = "Enter your last name."
  if (!isEmail(email)) fields.email = "Enter an email like name@example.com."
  if (phone && !isPhone(phone)) fields.phone = "Enter a 10-digit number."
  if (zip && !/^\d{5}$/.test(zip)) fields.zip = "Enter a 5-digit ZIP code."
  if (birth && !ISO_DATE.test(birth)) fields.birth = "Enter your date of birth."
  const { plans } = await getCatalog()
  if (!plans.some((p) => p.slug === input.plan)) fields.plan = "Pick a plan."
  if (!(await knownClub(input.club))) fields.club = "Pick a home club."
  if (Object.keys(fields).length) return fail(fields)

  const family = {
    adults: input.mode === "family" ? cleanPeople(input.family?.adults, 4) : [],
    kids: input.mode === "family" ? cleanPeople(input.family?.kids, 6) : [],
  }
  const { error } = await getWriteClient()
    .from("join_requests")
    .insert({
      plan_id: input.plan,
      club_slug: input.club,
      first_name: first,
      last_name: last,
      email,
      phone: phone ? digitsOf(phone) : "",
      birth_date: birth || null,
      zip,
      sms_opt_in: Boolean(input.smsOptIn),
      news_opt_in: Boolean(input.newsOptIn),
      mode: input.mode === "family" ? "family" : "solo",
      family,
      promo,
    })
  return done("join_requests", error, {})
}

// ---------------------------------------------------------------------------------------------
// Contact
// ---------------------------------------------------------------------------------------------

export type ContactInput = {
  first: string
  email: string
  topic: string
  club: string
  message: string
  company?: string
}

export async function submitContact(input: ContactInput): Promise<FormResult> {
  if (isBot(input.company)) return { ok: true }

  const first = str(input.first, 80)
  const email = str(input.email, 200)
  const topic = str(input.topic, 80)
  const message = str(input.message, 4000)
  const fields: Record<string, string> = {}
  if (!first || first.length > 80) fields.first = "Enter your first name."
  if (!isEmail(email)) fields.email = "Enter an email like name@example.com."
  if (!message) fields.message = "Write a short message."
  else if (message.length > 4000)
    fields.message = "Use 4,000 characters or fewer."
  const club = input.club && (await knownClub(input.club)) ? input.club : null
  if (Object.keys(fields).length) return fail(fields)

  const { error } = await getWriteClient().from("contact_messages").insert({
    first_name: first,
    email,
    topic,
    club_slug: club,
    message,
  })
  return done("contact_messages", error, {})
}

// ---------------------------------------------------------------------------------------------
// Email sign-ups (newsletter, job alerts)
// ---------------------------------------------------------------------------------------------

export type SignupInput = {
  email: string
  source: "newsletter" | "job_alert" | "pass_reminder"
  details?: Record<string, string>
  company?: string
}

export async function submitSignup(input: SignupInput): Promise<FormResult> {
  if (isBot(input.company)) return { ok: true }
  const email = str(input.email, 200)
  if (!isEmail(email))
    return fail({ email: "Enter an email like name@example.com." })
  const source = ["newsletter", "job_alert", "pass_reminder"].includes(
    input.source
  )
    ? input.source
    : "newsletter"
  const details: Record<string, string> = {}
  for (const [k, v] of Object.entries(input.details ?? {}).slice(0, 5))
    details[str(k, 20)] = str(v, 80)
  const { error } = await getWriteClient()
    .from("email_signups")
    .insert({ email, source, details })
  return done("email_signups", error, {})
}
