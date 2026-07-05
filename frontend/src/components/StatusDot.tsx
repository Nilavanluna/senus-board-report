import type { FindingStatus, ValidationStatus } from '../api/types'

const COLORS: Record<string, string> = {
  passed: 'bg-emerald-500',
  anomaly: 'bg-amber-500',
  failed: 'bg-rose-500',
  unchecked: 'bg-zinc-600',
}

export function StatusDot({
  status,
  title,
}: {
  status: ValidationStatus | FindingStatus
  title?: string
}) {
  return (
    <span
      title={title}
      className={`inline-block h-1.5 w-1.5 shrink-0 rounded-full ${COLORS[status] ?? 'bg-zinc-600'}`}
    />
  )
}
