import "server-only"
import { isSupabaseConfigured } from "./env"
import { createClient } from "./server"

export type SessionUser = { id: string; email: string | null }

// The signed-in user from the auth cookie, or null. getClaims checks the token signature,
// so a Server Component can trust it for redirects.
export async function getSessionUser(): Promise<SessionUser | null> {
  if (!isSupabaseConfigured) return null
  const supabase = await createClient()
  const { data } = await supabase.auth.getClaims()
  const claims = data?.claims
  if (!claims?.sub) return null
  return {
    id: claims.sub,
    email: typeof claims.email === "string" ? claims.email : null,
  }
}
