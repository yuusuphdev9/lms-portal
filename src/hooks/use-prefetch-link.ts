import { useForesight } from '@foresightjs/react'
import { useQueryClient, type QueryKey } from '@tanstack/react-query'

/**
 * Attach the returned ref to a navigation element (a <Link>, an <a>, …).
 * ForesightJS predicts an incoming click from mouse trajectory, keyboard
 * navigation, or scroll — and when it predicts one for this element, we
 * warm the TanStack Query cache with `queryFn`'s result *before* the click
 * actually happens, so the destination page has its data already cached
 * instead of showing a loading state.
 *
 * Pass `enabled: false` when the element isn't ready to be prefetched yet
 * (e.g. the thing it links to hasn't loaded) — ForesightJS then skips
 * tracking it entirely rather than firing a callback for a stale target.
 */
export function usePrefetchLink(
  name: string,
  queryKey: QueryKey,
  queryFn: () => Promise<unknown>,
  enabled = true,
): (node: HTMLElement | null) => void {
  const queryClient = useQueryClient()

  const { elementRef } = useForesight({
    name,
    enabled,
    hitSlop: 20,
    // Once a link has been prefetched, don't re-fire on it again for 5
    // minutes — the data's already warm, there's nothing more to gain.
    reactivateAfter: 5 * 60 * 1000,
    callback: () => {
      queryClient.query({ queryKey, queryFn }).catch(() => undefined)
    },
  })

  return elementRef
}
