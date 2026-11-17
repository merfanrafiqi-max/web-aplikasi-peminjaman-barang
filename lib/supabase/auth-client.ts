import 'server-only'
import { createClient } from '@supabase/supabase-js'

/**
 * Anon-key client used only on the server to verify borrower credentials.
 * A fresh, non-persisting instance per call keeps sessions from leaking
 * between requests.
 */
export function createAuthClient() {
  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL
  const key =
    process.env.SUPABASE_ANON_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  if (!url || !key) throw new Error('Supabase environment variables are missing.')

  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  })
}
