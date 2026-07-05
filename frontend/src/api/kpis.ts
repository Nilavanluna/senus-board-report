import { useQuery } from '@tanstack/react-query'
import { apiGet } from './client'
import type { StrategyKpis } from './types'

export function fetchKpis() {
  return apiGet<StrategyKpis>('/api/kpis')
}

export function useKpis() {
  return useQuery({ queryKey: ['kpis'], queryFn: fetchKpis })
}
