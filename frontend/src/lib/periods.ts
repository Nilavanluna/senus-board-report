// Fixed display order for known reporting periods (not a financial value —
// just column ordering for tables/charts). Unknown periods sort after these,
// alphabetically, so a future period the backend adds doesn't crash the UI.
const PERIOD_ORDER = ['FY2024', 'FY2025', 'H1FY2025', 'H1FY2026']

export function comparePeriods(a: string, b: string): number {
  const ai = PERIOD_ORDER.indexOf(a)
  const bi = PERIOD_ORDER.indexOf(b)
  if (ai !== -1 && bi !== -1) return ai - bi
  if (ai !== -1) return -1
  if (bi !== -1) return 1
  return a.localeCompare(b)
}

export function humanizeItem(item: string): string {
  return item
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}
