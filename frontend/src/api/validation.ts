import { useQuery } from '@tanstack/react-query'
import { apiGet } from './client'
import type { ValidationReport } from './types'

export function fetchValidation() {
  return apiGet<ValidationReport>('/api/validation')
}

export function useValidation() {
  return useQuery({ queryKey: ['validation'], queryFn: fetchValidation })
}
