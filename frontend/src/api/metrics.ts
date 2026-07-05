import { useQuery } from '@tanstack/react-query'
import { apiGet } from './client'
import type { MetricsResponse } from './types'

export function fetchMetrics() {
  return apiGet<MetricsResponse>('/api/metrics')
}

export function useMetrics() {
  return useQuery({ queryKey: ['metrics'], queryFn: fetchMetrics })
}
