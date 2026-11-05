import { createClient } from '@supabase/supabase-js'

/**
 * Single shared Supabase client. `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY`
 * come from `.env.local` in development and from the matching project
 * environment variables in Vercel — see `.env.local.example` at the repo root.
 * The anon/publishable key is safe to ship to the browser: every table it can
 * touch is locked down with Row Level Security (see `sql/001_schema_and_rls.sql`).
 *
 * No `Database` generic here: hand-writing one well enough to satisfy
 * supabase-js's query-builder types (insert/update especially) needs the same
 * shape its own codegen produces, which isn't worth maintaining by hand for a
 * schema this size. Each feature's `api.ts` instead types every row explicitly
 * via `@/lib/db-mappers`'s `Result<T>` helper, so nothing here is ever an
 * untyped `any` by the time it reaches a mapper.
 */
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY. Copy .env.local.example to .env.local and fill them in.',
  )
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
