import { createServerClient } from "@supabase/ssr"
import { type NextRequest, NextResponse } from "next/server"
import { safeNext } from "@/lib/safe-next"
import {
  isSupabaseConfigured,
  supabasePublishableKey,
  supabaseUrl,
} from "./env"

// Pages a signed-out visitor may open. Every other page is a member page.
const PUBLIC = ["/sign-in", "/offline"]
const isPublic = (path: string) =>
  PUBLIC.some((p) => path === p || path.startsWith(`${p}/`))

// Refreshes the auth cookie on each request, so Server Components see a valid session.
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request })
  if (!isSupabaseConfigured) return response

  const supabase = createServerClient(supabaseUrl, supabasePublishableKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet, headers) {
        for (const { name, value } of cookiesToSet)
          request.cookies.set(name, value)
        response = NextResponse.next({ request })
        for (const { name, value, options } of cookiesToSet)
          response.cookies.set(name, value, options)
        for (const [key, value] of Object.entries(headers))
          response.headers.set(key, value)
      },
    },
  })

  // Call this before the response returns, or a refreshed token is lost.
  const { data } = await supabase.auth.getClaims()
  const signedIn = Boolean(data?.claims?.sub)
  const { pathname, search } = request.nextUrl

  const redirectTo = (path: string, query = "") => {
    const url = request.nextUrl.clone()
    url.pathname = path
    url.search = query
    const out = NextResponse.redirect(url, 307)
    // Keep any cookies that the session refresh set.
    for (const c of response.cookies.getAll()) out.cookies.set(c)
    return out
  }

  // A signed-out request for a member page gets a real 307 before anything renders.
  // The (app) layout checks the session again as a second line of defense.
  if (!signedIn && !isPublic(pathname))
    return redirectTo(
      "/sign-in",
      `?next=${encodeURIComponent(pathname + search)}`
    )
  if (signedIn && pathname === "/sign-in")
    return redirectTo(
      safeNext(request.nextUrl.searchParams.get("next"), "/today")
    )
  return response
}
