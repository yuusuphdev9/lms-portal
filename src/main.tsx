import '@fontsource-variable/fraunces'
import '@fontsource/ibm-plex-sans/400.css'
import '@fontsource/ibm-plex-sans/500.css'
import '@fontsource/ibm-plex-sans/600.css'
import '@fontsource/ibm-plex-mono/500.css'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from '@/app/App'
import '@/styles/globals.css'

async function enableMocking() {
  // This app has no real backend yet: mocking stays on in every environment until
  // `VITE_API_BASE_URL` points at a real server, so a plain production deploy still
  // demonstrates working features instead of showing nothing but error states.
  if (import.meta.env.VITE_API_BASE_URL) return
  const { worker } = await import('@/mocks/browser')
  return worker.start({ onUnhandledRequest: 'bypass' })
}

const rootElement = document.getElementById('root')
if (!rootElement) {
  throw new Error('Root element not found')
}

void enableMocking().then(() => {
  createRoot(rootElement).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
})
