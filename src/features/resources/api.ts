import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { assertFound, mapResource, type ResourceRow, type Result } from '@/lib/db-mappers'
import { supabase } from '@/lib/supabase'
import type { Resource } from '@/types'

export const resourceKeys = {
  list: (courseId?: string) => ['resources', courseId ?? 'all'] as const,
}

export function useResources(courseId?: string) {
  return useQuery<Resource[]>({
    queryKey: resourceKeys.list(courseId),
    queryFn: async () => {
      let query = supabase.from('resources').select('*')
      if (courseId) query = query.eq('course_id', courseId)
      const { data, error } = (await query) as Result<ResourceRow[]>
      if (error) throw error
      return (data ?? []).map(mapResource)
    },
  })
}

export function useDownloadResource() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (resourceId: string) => {
      // Goes through a Postgres function (see sql/001_schema_and_rls.sql) rather than a
      // direct UPDATE, so a student can bump the download counter without also being
      // granted the ability to rewrite a resource's title, url, etc.
      const { data, error } = (await supabase.rpc('increment_resource_download', {
        resource_id: resourceId,
      })) as Result<ResourceRow>
      if (error) throw error
      return mapResource(assertFound(data, 'Resource'))
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['resources'] })
    },
  })
}
