import { useQuery, type QueryKey } from '@tanstack/react-query'
import { api } from '@/lib/api'

interface UseApiQueryOptions {
  enabled?: boolean
  retry?: boolean | number
}

/**
 * Generic `GET /api/...` query: every read-only hook across the feature `api.ts` files was the
 * same three lines (queryKey, `() => api.get<T>(url)`, enabled) with only the type parameter and
 * the URL changing. This is that shape, pulled out once and reused with whatever `T` the endpoint
 * returns — the mutations stay hand-written per feature since their invalidation logic actually
 * differs.
 */
export function useApiQuery<T>(queryKey: QueryKey, path: string, options?: UseApiQueryOptions) {
  return useQuery<T>({
    queryKey,
    queryFn: () => api.get<T>(path),
    ...options,
  })
}
