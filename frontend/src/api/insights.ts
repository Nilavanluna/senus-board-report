import { useQuery } from '@tanstack/react-query'
import { apiGet } from './client'
import type { Audience, InsightsResponse } from './types'

export function fetchInsights(audience: Audience) {
  return apiGet<InsightsResponse>(`/api/insights/${audience}`)
}

export function useInsights(audience: Audience) {
  return useQuery({
    queryKey: ['insights', audience],
    queryFn: () => fetchInsights(audience),
  })
}
