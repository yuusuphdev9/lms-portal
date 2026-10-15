/// <reference types="vite/client" />

/**
 * Vite's own `ImportMetaEnv` falls back to an `any`-typed index signature for unknown keys.
 * Declaration-merging our own env vars onto it here gives `import.meta.env.VITE_API_BASE_URL`
 * a real type everywhere it's read, instead of `any`.
 */
interface ImportMetaEnv {
  /** Base URL for a real backend. Unset in development, where MSW intercepts same-origin requests. */
  readonly VITE_API_BASE_URL?: string
}
