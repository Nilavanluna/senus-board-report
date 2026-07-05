import type { ReactNode } from 'react'
import type { MetricResult } from '../api/types'

// The backend never lets the LLM see raw documents or invent numbers - it
// only sees the /api/metrics payload (see backend/app/services/insights.py).
// This mirrors that contract on the frontend: any number in the commentary
// that isn't traceable to a value in that payload is flagged, not trusted.
function collectPayloadValues(metrics: MetricResult[]): number[] {
  const values: number[] = []
  for (const m of metrics) {
    if (m.value !== null) values.push(m.value)
    for (const v of Object.values(m.inputs)) {
      if (v !== null && v !== undefined) values.push(v)
    }
  }
  return values
}

function isClose(a: number, b: number): boolean {
  if (b === 0) return Math.abs(a) < 0.5
  const tolerance = Math.max(Math.abs(b) * 0.01, Math.abs(b) >= 100 ? 1 : 0.15)
  return Math.abs(a - b) <= tolerance
}

function isVerified(parsed: number, candidates: number[]): boolean {
  for (const c of candidates) {
    const variants = [c, Math.abs(c), c / 1_000, Math.abs(c) / 1_000, c / 1_000_000, Math.abs(c) / 1_000_000]
    if (variants.some((v) => isClose(parsed, v))) return true
  }
  return false
}

const NUMBER_RE = /-?(?:\d{1,3}(?:,\d{3})+(?:\.\d+)?|\d+\.\d+|\d+)(?:\s?[%kKmM])?/g

export function renderVerifiedCommentary(text: string, metrics: MetricResult[]): ReactNode[] {
  const candidates = collectPayloadValues(metrics)
  const nodes: ReactNode[] = []
  let lastIndex = 0
  let key = 0
  let match: RegExpExecArray | null
  NUMBER_RE.lastIndex = 0

  while ((match = NUMBER_RE.exec(text))) {
    const raw = match[0]
    const suffix = raw.trim().slice(-1).toLowerCase()
    const isSuffixed = suffix === 'k' || suffix === 'm'
    const numeric = raw.replace(/[, ]/g, '').replace(/[%kKmM]$/, '')
    let parsed = parseFloat(numeric)
    if (Number.isNaN(parsed)) continue
    if (isSuffixed) parsed *= suffix === 'k' ? 1_000 : 1_000_000

    if (match.index > lastIndex) nodes.push(text.slice(lastIndex, match.index))

    const verified = isVerified(parsed, candidates)
    nodes.push(
      <span
        key={key++}
        title={verified ? 'Verified against the metrics payload' : 'Not found in the metrics payload — unverified'}
        className={
          verified
            ? 'underline decoration-emerald-500/70 decoration-2 underline-offset-2'
            : 'rounded bg-amber-500/10 px-0.5 text-amber-300'
        }
      >
        {raw}
      </span>,
    )
    lastIndex = match.index + raw.length
  }
  if (lastIndex < text.length) nodes.push(text.slice(lastIndex))
  return nodes
}
