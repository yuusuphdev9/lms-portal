import { setupServer } from 'msw/node'
import { handlers } from './handlers'

/** Node-side MSW server, for use in Vitest once test setup is wired up. */
export const server = setupServer(...handlers)
