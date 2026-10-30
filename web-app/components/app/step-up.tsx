"use client"
import { useEffect, useState } from "react"
import { Modal } from "@/components/kit/overlays"
import { FormField } from "@/components/kit/ui"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { createClient } from "@/lib/supabase/client"

// Time of the last password check in this browser. Sign-in sets it.
const KEY = "cp-auth-at"
export function touchAuth() {
  try {
    localStorage.setItem(KEY, String(Date.now()))
  } catch {}
}

// Sensitive pages ask the member for their password again if the last check is older than 30 minutes.
// The password is checked with Supabase Auth.
export function StepUp() {
  const [open, setOpen] = useState(() => {
    try {
      const at = Number(localStorage.getItem(KEY) ?? 0)
      return !!at && Date.now() - at > 30 * 60_000
    } catch {
      return false
    }
  })
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [busy, setBusy] = useState(false)
  useEffect(() => {
    try {
      if (!localStorage.getItem(KEY)) touchAuth()
    } catch {}
  }, [])
  const confirm = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!password) return setError("Enter your password.")
    setBusy(true)
    setError("")
    try {
      const db = createClient()
      const { data } = await db.auth.getUser()
      const email = data.user?.email
      if (!email) throw new Error("no session")
      const { error: authError } = await db.auth.signInWithPassword({
        email,
        password,
      })
      if (authError) {
        setError(
          authError.status === 400
            ? "That password is not right. Try again."
            : "We couldn't reach Cactus Peak. Check your connection and try again."
        )
        return
      }
      touchAuth()
      setPassword("")
      setOpen(false)
    } catch {
      setError(
        "We couldn't reach Cactus Peak. Check your connection and try again."
      )
    } finally {
      setBusy(false)
    }
  }
  return (
    <Modal
      open={open}
      onOpenChange={setOpen}
      title="Confirm it's you"
      description="Enter your password again to change billing or your membership."
    >
      <form onSubmit={confirm} className="flex flex-col gap-4" noValidate>
        <FormField label="Password" error={error}>
          {(p) => (
            <Input
              {...p}
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          )}
        </FormField>
        <Button type="submit" loading={busy}>
          Confirm
        </Button>
      </form>
    </Modal>
  )
}
