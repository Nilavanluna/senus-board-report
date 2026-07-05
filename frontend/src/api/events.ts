import { useQuery } from '@tanstack/react-query'
import { apiGet } from './client'
import type { EventsResponse } from './types'

export function fetchEvents() {
  return apiGet<EventsResponse>('/api/events')
}

export function useEvents() {
  return useQuery({ queryKey: ['events'], queryFn: fetchEvents })
}
