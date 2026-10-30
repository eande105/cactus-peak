import "server-only"

import { createClient } from "@supabase/supabase-js"
import type { Database } from "./database.types"
import { assertConfigured, supabasePublishableKey, supabaseUrl } from "./env"

// Catalog data (clubs, classes, plans, copy) is the same for every visitor.
// This client sends no cookies and caches every request in the Next.js data cache,
// so the pages that read it stay static and regenerate at most once an hour.
// `revalidateTag(CATALOG_TAG)` refreshes it on demand.
export const CATALOG_REVALIDATE_SECONDS = 3600
export const CATALOG_TAG = "catalog"

const authOff = {
  persistSession: false,
  autoRefreshToken: false,
  detectSessionInUrl: false,
}

let catalogClient: ReturnType<typeof buildCatalog> | undefined
function buildCatalog() {
  return createClient<Database>(supabaseUrl, supabasePublishableKey, {
    auth: authOff,
    global: {
      fetch: (input, init) =>
        fetch(input, {
          ...init,
          next: { revalidate: CATALOG_REVALIDATE_SECONDS, tags: [CATALOG_TAG] },
        }),
    },
  })
}
export function getCatalogClient() {
  assertConfigured()
  catalogClient ??= buildCatalog()
  return catalogClient
}

// Inserts from the marketing forms. Never cached. Anon can insert into the request tables but cannot read them.
let writeClient: ReturnType<typeof buildWrite> | undefined
function buildWrite() {
  return createClient<Database>(supabaseUrl, supabasePublishableKey, {
    auth: authOff,
    global: {
      fetch: (input, init) => fetch(input, { ...init, cache: "no-store" }),
    },
  })
}
export function getWriteClient() {
  assertConfigured()
  writeClient ??= buildWrite()
  return writeClient
}
