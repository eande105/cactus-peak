// The publishable key is safe in the browser. Row level security protects the data (../supabase/README.md).
export const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ""
export const supabasePublishableKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? ""

export const isSupabaseConfigured = Boolean(
  supabaseUrl && supabasePublishableKey
)

export function assertConfigured() {
  if (!isSupabaseConfigured)
    throw new Error(
      "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY in .env.local."
    )
}
