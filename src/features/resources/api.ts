import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { useApiQuery } from '@/lib/use-api-query'
import type { Resource } from '@/types'

export const resourceKeys = {
  list: (courseId?: string) => ['resources', courseId ?? 'all'] as const,
}

export function useResources(courseId?: string) {
  const query = courseId ? `?courseId=${courseId}` : ''
  return useApiQuery<Resource[]>(resourceKeys.list(courseId), `/api/resources${query}`)
}

export function useDownloadResource() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (resourceId: string) =>
      api.post<Resource>(`/api/resources/${resourceId}/download`),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['resources'] })
    },
  })
}
