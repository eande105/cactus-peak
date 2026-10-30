"use client"

import { useRouter } from "next/navigation"
import { useId, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

/** Pass email row (spec 1.13). The email goes to /trial in session storage, never in the URL. */
export function PassEmailRow() {
  const id = useId()
  const [v, setV] = useState("")
  const [err, setErr] = useState("")
  const router = useRouter()
  return (
    <form
      noValidate
      onSubmit={(e) => {
        e.preventDefault()
        if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v)) {
          setErr("Enter an email like name@example.com.")
          return
        }
        try {
          sessionStorage.setItem("cpa_trial_email", v)
        } catch {}
        router.push("/trial")
      }}
    >
      <label
        htmlFor={id}
        className="mb-1 block text-caption text-night-foreground"
      >
        Email
      </label>
      <div className="flex gap-2">
        <Input
          id={id}
          type="email"
          autoComplete="email"
          value={v}
          onChange={(e) => {
            setV(e.target.value)
            setErr("")
          }}
          aria-invalid={!!err}
          aria-describedby={`${id}-m`}
          className="bg-card text-foreground"
        />
        <Button
          type="submit"
          variant="outline"
          className="shrink-0 bg-night-foreground text-foreground ring-night-foreground hover:bg-night-foreground/90"
        >
          Get a 3-day pass
        </Button>
      </div>
      <p
        id={`${id}-m`}
        className={
          err
            ? "mt-1 text-caption font-semibold text-night-foreground"
            : "mt-1 text-caption text-night-muted"
        }
        role={err ? "alert" : undefined}
      >
        {err || "No credit card required."}
      </p>
    </form>
  )
}
