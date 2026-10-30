import { createBrowserClient } from "@supabase/ssr"
import type { Database } from "./database.types"
import { supabasePublishableKey, supabaseUrl } from "./env"

let client: ReturnType<typeof createBrowserClient<Database>> | undefined

// One browser client per tab. It keeps the session in cookies, so the server sees the same session.
export function createClient() {
  client ??= createBrowserClient<Database>(supabaseUrl, supabasePublishableKey)
  return client
}
