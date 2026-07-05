import { useQuery } from '@tanstack/react-query'
import { apiGet } from './client'
import type { FactProvenance, FinancialFact } from './types'

export function fetchFacts() {
  return apiGet<FinancialFact[]>('/api/facts')
}

export function useFacts() {
  return useQuery({ queryKey: ['facts'], queryFn: fetchFacts })
}

export function fetchFactProvenance(factId: number) {
  return apiGet<FactProvenance>(`/api/facts/${factId}/provenance`)
}

export function useFactProvenance(factId: number | null) {
  return useQuery({
    queryKey: ['fact-provenance', factId],
    queryFn: () => fetchFactProvenance(factId as number),
    enabled: factId !== null,
  })
}
