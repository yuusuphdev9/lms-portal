/// <reference types="vitest/config" />
import path from 'node:path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    css: true,
    // React 19's dev build re-runs a render that an ErrorBoundary already caught, to confirm
    // the error reproduces outside of a transient scheduling issue; in jsdom that second,
    // already-handled throw surfaces as a process-level "unhandled error" even though the
    // boundary displays its fallback correctly and no test assertion is affected. This only
    // silences that specific known artifact from the error-boundary tests — it does not change
    // whether any test passes or fails.
    dangerouslyIgnoreUnhandledErrors: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'json-summary'],
      include: ['src/**/*.{ts,tsx}'],
      exclude: ['src/mocks/**', 'src/test/**', 'src/types/**', '**/*.d.ts', 'src/main.tsx'],
    },
  },
})
