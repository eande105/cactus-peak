import "server-only"
import { createClient } from "@supabase/supabase-js"
import type { Database } from "./database.types"
import { supabasePublishableKey, supabaseUrl } from "./env"

// The catalog (clubs, classes, coaches, plans) is the same for every member.
// This client sends no cookies, so its reads can be cached. Next.js keeps each fetch for an hour.
export const CATALOG_REVALIDATE_SECONDS = 3600
export const CATALOG_TAG = "catalog"

let client: ReturnType<typeof build> | undefined
function build() {
  return createClient<Database>(supabaseUrl, supabasePublishableKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
    global: {
      fetch: (input, init) =>
        fetch(input, {
          ...init,
          next: { revalidate: CATALOG_REVALIDATE_SECONDS, tags: [CATALOG_TAG] },
        }),
    },
  })
}
export function getPublicClient() {
  client ??= build()
  return client
}
