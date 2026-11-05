/// <reference types="vite/client" />

/**
 * Vite's own `ImportMetaEnv` falls back to an `any`-typed index signature for unknown keys.
 * Declaration-merging our own env vars onto it here gives `import.meta.env.VITE_SUPABASE_URL`
 * (and friends) a real type everywhere they're read, instead of `any`.
 */
interface ImportMetaEnv {
  /** Base URL for a real backend. Unused now that every feature talks to Supabase directly. */
  readonly VITE_API_BASE_URL?: string
  /** Supabase project URL, e.g. https://zjgpkhpkxzxwyumrhmod.supabase.co — see .env.local.example. */
  readonly VITE_SUPABASE_URL?: string
  /** Supabase anon/publishable key — safe to ship to the browser; every table it touches has RLS. */
  readonly VITE_SUPABASE_ANON_KEY?: string
}
