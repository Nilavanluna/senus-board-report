import type { FinancialFact, MetricResult } from '../api/types'

export function findMetric(
  metrics: MetricResult[],
  name: string,
  period: string,
): MetricResult | undefined {
  return metrics.find((m) => m.name === name && m.period === period)
}

// Mirrors backend/app/db.py's facts_dict() so period/item lookups the
// metrics engine doesn't already expose can be computed client-side from the
// same live facts, with the identical (period, item) key shape.
export function factsIndex(facts: FinancialFact[]): Map<string, number> {
  const index = new Map<string, number>()
  for (const f of facts) index.set(`${f.period}:${f.item}`, f.value)
  return index
}

export function getFact(index: Map<string, number>, period: string, item: string): number | null {
  const v = index.get(`${period}:${item}`)
  return v === undefined ? null : v
}
