import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    // Return a dummy client during build or if variables are missing
    // This prevents the entire build from crashing
    console.warn('Supabase credentials missing. Using dummy client.')
    return {} as any
  }

  return createBrowserClient(supabaseUrl, supabaseKey)
}
