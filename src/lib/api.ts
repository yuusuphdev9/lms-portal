/**
 * Thin fetch wrapper the query hooks build on. Throws on a non-2xx response so TanStack Query's
 * error state picks it up.
 *
 * Every endpoint is requested as a path (`/api/courses`, not a full URL). `BASE_URL` is what makes
 * that path resolve against either backend: left unset, it resolves against this origin, which is
 * where MSW intercepts it in development; set `VITE_API_BASE_URL` and it resolves against a real
 * server instead — nothing in a feature's `api.ts` has to change either way.
 */
const BASE_URL: string = import.meta.env.VITE_API_BASE_URL ?? ''

export class ApiError extends Error {
  status: number

  constructor(status: number, message: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const url = `${BASE_URL}${path}`
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...init,
  })
  if (!res.ok) {
    throw new ApiError(res.status, `${init?.method ?? 'GET'} ${url} failed with ${String(res.status)}`)
  }
  if (res.status === 204) return undefined as T
  return res.json() as Promise<T>
}

export const api = {
  get: <T>(url: string) => request<T>(url),
  post: <T>(url: string, body?: unknown) =>
    request<T>(url, { method: 'POST', ...(body !== undefined && { body: JSON.stringify(body) }) }),
  patch: <T>(url: string, body?: unknown) =>
    request<T>(url, { method: 'PATCH', ...(body !== undefined && { body: JSON.stringify(body) }) }),
  delete: <T>(url: string) => request<T>(url, { method: 'DELETE' }),
}
