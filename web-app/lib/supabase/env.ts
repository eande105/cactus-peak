// The publishable key is safe in the browser. Row level security protects the data.
// Never put a service or secret key in this app.
export const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ""
export const supabasePublishableKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? ""

export const isSupabaseConfigured = Boolean(
  supabaseUrl && supabasePublishableKey
)
