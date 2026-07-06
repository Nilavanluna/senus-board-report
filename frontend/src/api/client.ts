export class ApiError extends Error {
  status: number

  constructor(status: number, message: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

// Empty string keeps requests relative so the Vite dev proxy (see
// vite.config.ts) still handles /api/* locally. Set VITE_API_URL to the
// deployed backend's origin when the frontend is served from a different
// origin (e.g. separate Render static site + web service).
const API_BASE = import.meta.env.VITE_API_URL ?? ''

export async function apiGet<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`)
  if (!res.ok) {
    const body = await res.text().catch(() => '')
    throw new ApiError(res.status, body || res.statusText)
  }
  return res.json() as Promise<T>
}
