"use client"
import { useRouter, useSearchParams } from "next/navigation"
import { Suspense, useState } from "react"
import { touchAuth } from "@/components/app/step-up"
import { FormField } from "@/components/kit/ui"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { safeNext } from "@/lib/safe-next"
import { createClient } from "@/lib/supabase/client"
import { useOffline } from "@/lib/ui-state"

const WRONG = "Wrong email or password. Check both and try again."
const NETWORK =
  "We couldn't reach Cactus Peak. Check your connection and try again."

// Members who have not finished onboarding go to the step they stopped at.
async function landingFor(next: string, explicitNext: boolean) {
  if (explicitNext) return next
  try {
    const db = createClient()
    const { data: auth } = await db.auth.getUser()
    if (!auth.user) return next
    const { data } = await db
      .from("members")
      .select("prefs")
      .eq("auth_user_id", auth.user.id)
      .maybeSingle()
    const step = (data?.prefs as { onboardingStep?: number } | null)
      ?.onboardingStep
    return step !== undefined && step < 6 ? `/welcome?step=${step}` : next
  } catch {
    return next
  }
}

function SignIn() {
  const router = useRouter()
  const params = useSearchParams()
  const demo = params.get("demo") === "1"
  const rawNext = params.get("next")
  const next = safeNext(rawNext, "/today")
  const offline = useOffline()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [errors, setErrors] = useState<{
    email?: string
    password?: string
    form?: string
  }>({})
  const [busy, setBusy] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (offline)
      return setErrors({ form: "You're offline. Connect to sign in." })
    const errs: typeof errors = {}
    if (!email.trim()) errs.email = "Enter your email."
    else if (!/^\S+@\S+\.\S+$/.test(email.trim()))
      errs.email =
        "Check the email address. It should look like you@example.com."
    if (!password) errs.password = "Enter your password."
    setErrors(errs)
    if (errs.email || errs.password) return
    setBusy(true)
    try {
      const { error } = await createClient().auth.signInWithPassword({
        email: email.trim(),
        password,
      })
      if (error) {
        // Only a 400 from the auth server means the email or password is wrong. Anything else is the network
        // or the service.
        setErrors({ form: error.status === 400 ? WRONG : NETWORK })
        setBusy(false)
        return
      }
    } catch {
      setErrors({ form: NETWORK })
      setBusy(false)
      return
    }
    touchAuth()
    const target = await landingFor(next, safeNext(rawNext, "") !== "")
    router.replace(target)
    router.refresh()
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1
          id="page-title"
          className="font-heading text-h1 display-stretch md:text-display"
        >
          Welcome back
        </h1>
        <p className="text-muted-foreground">
          Sign in to book classes, courts and more.
        </p>
      </div>
      <form onSubmit={submit} className="flex flex-col gap-4" noValidate>
        {errors.form ? (
          <p
            role="alert"
            className="rounded-md bg-muted p-3 text-detail text-destructive"
          >
            {errors.form}
          </p>
        ) : null}
        <FormField label="Email" error={errors.email}>
          {(p) => (
            <Input
              {...p}
              type="email"
              name="email"
              autoComplete="username"
              placeholder="you@example.com"
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          )}
        </FormField>
        <FormField label="Password" error={errors.password}>
          {(p) => (
            <Input
              {...p}
              type="password"
              name="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          )}
        </FormField>
        <Button type="submit" size="lg" className="w-full" loading={busy}>
          {busy ? "Signing in…" : "Sign in"}
        </Button>
      </form>
      <p className="text-caption text-muted-foreground">
        Forgot your password? Call the front desk and we&apos;ll reset it.
      </p>
      {demo ? (
        <p className="rounded-md bg-muted p-3 text-detail text-muted-foreground">
          Demo logins: maya@, chris@, alicia@, jordan@, daniel@, ron@ and
          linda@example.com. They share one demo password, which the project
          owner keeps.
        </p>
      ) : null}
    </div>
  )
}

export default function SignInPage() {
  return (
    <Suspense>
      <SignIn />
    </Suspense>
  )
}
