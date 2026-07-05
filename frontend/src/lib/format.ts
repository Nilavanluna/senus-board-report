export function formatEUR(value: number | null | undefined, compact = false): string {
  if (value === null || value === undefined) return '—'
  if (compact) {
    const abs = Math.abs(value)
    const sign = value < 0 ? '-' : ''
    if (abs >= 1_000_000) return `${sign}€${(abs / 1_000_000).toFixed(2)}M`
    if (abs >= 1_000) return `${sign}€${(abs / 1_000).toFixed(1)}k`
    return `${sign}€${abs.toFixed(0)}`
  }
  return new Intl.NumberFormat('en-IE', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }).format(value)
}

export function formatPercent(value: number | null | undefined, decimals = 1): string {
  if (value === null || value === undefined) return '—'
  return `${value.toFixed(decimals)}%`
}

export function formatNumber(value: number | null | undefined, decimals = 0): string {
  if (value === null || value === undefined) return '—'
  return new Intl.NumberFormat('en-IE', {
    maximumFractionDigits: decimals,
    minimumFractionDigits: decimals,
  }).format(value)
}

export function formatMonths(value: number | null | undefined): string {
  if (value === null || value === undefined) return '—'
  return `${formatNumber(value, 1)} mo`
}

export function formatMultiple(value: number | null | undefined): string {
  if (value === null || value === undefined) return '—'
  return `${formatNumber(value, 2)}x`
}

export function formatDate(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleDateString('en-IE', { year: 'numeric', month: 'short', day: 'numeric' })
}
