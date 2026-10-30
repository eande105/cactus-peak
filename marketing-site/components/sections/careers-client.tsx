"use client"

import Link from "next/link"
import { useState } from "react"
import { LinkButton } from "@/components/brand/atoms"
import { useCatalog } from "@/components/site/catalog-context"
import { Button } from "@/components/ui/button"
import { SelectBox } from "@/components/ui/controls"
import { Input } from "@/components/ui/input"
import { submitSignup } from "@/lib/forms/actions"
import { isEmail } from "@/lib/store"
import { EmptyState } from "./common"
import { Honeypot, honeypotOf } from "./flow-ui"

export function JobList() {
  const { jobs } = useCatalog()
  const [club, setClub] = useState("")
  const [dept, setDept] = useState("")
  const [type, setType] = useState("")
  const [email, setEmail] = useState("")
  const [state, setState] = useState<
    "idle" | "busy" | "ok" | "error" | "failed"
  >("idle")
  const list = jobs.filter(
    (j) =>
      (!club || j.club === club) &&
      (!dept || j.dept === dept) &&
      (!type || j.type === type)
  )
  const opts = (k: "club" | "dept" | "type") => [
    ...new Set(jobs.map((j) => j[k])),
  ]
  return (
    <div>
      <div className="flex flex-wrap gap-4">
        {(
          [
            ["Club", club, setClub, "club"],
            ["Department", dept, setDept, "dept"],
            ["Type", type, setType, "type"],
          ] as const
        ).map(([l, v, s, k]) => (
          <SelectBox
            key={l}
            inline
            label={l}
            value={v}
            onChange={s}
            options={[
              { value: "", label: "All" },
              ...opts(k).map((o) => ({ value: o, label: o })),
            ]}
          />
        ))}
      </div>
      <p className="tabular mt-4 text-caption" aria-live="polite">
        {list.length} open roles
      </p>
      {list.length ? (
        <ul className="mt-2 border-t border-border">
          {list.map((j) => (
            <li
              key={j.slug}
              className="flex flex-wrap items-center justify-between gap-3 border-b border-border py-4"
            >
              <div>
                <Link
                  href={`/careers/${j.slug}`}
                  className="font-display-wide text-h3 hover:underline"
                >
                  {j.title}
                </Link>
                <p className="text-body text-muted-foreground">
                  {j.club} · {j.type} · {j.pay}
                </p>
              </div>
              <LinkButton
                href={`/careers/${j.slug}`}
                variant="outline"
                size="sm"
              >
                Apply
              </LinkButton>
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState
          className="mt-4"
          title="No open roles match."
          text="Send us your email for the next opening."
        >
          <form
            noValidate
            onSubmit={async (e) => {
              e.preventDefault()
              if (state === "busy") return
              if (!isEmail(email)) return setState("error")
              setState("busy")
              const r = await submitSignup({
                email,
                source: "job_alert",
                details: { club, dept, type },
                company: honeypotOf(e.currentTarget),
              }).catch(() => null)
              setState(r?.ok ? "ok" : "failed")
            }}
            className="relative flex w-full max-w-md gap-2"
          >
            <Honeypot />
            <label className="sr-only" htmlFor="tl">
              Email
            </label>
            <Input
              id="tl"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-card"
            />
            <Button type="submit" variant="outline" loading={state === "busy"}>
              Join the list
            </Button>
          </form>
          <p role="status" className="text-caption">
            {state === "ok"
              ? "Thanks. We will write when a role opens."
              : state === "error"
                ? "Enter an email like name@example.com."
                : state === "failed"
                  ? "We could not add you. Try again in a minute."
                  : null}
          </p>
        </EmptyState>
      )}
    </div>
  )
}
