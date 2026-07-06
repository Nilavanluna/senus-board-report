import type { FindingStatus, ValidationStatus } from '../api/types'

const STATUS_META: Record<string, { label: string; className: string }> = {
  passed: { label: 'Validated', className: 'bg-emerald-950/40 text-emerald-400 border-emerald-800/60' },
  anomaly: { label: 'Anomaly', className: 'bg-amber-950/40 text-amber-400 border-amber-800/60' },
  failed: { label: 'Failed', className: 'bg-rose-950/40 text-rose-400 border-rose-800/60' },
  unchecked: { label: 'Unchecked', className: 'bg-zinc-800/60 text-zinc-400 border-zinc-700' },
}

export function StatusBadge({ status }: { status: ValidationStatus | FindingStatus }) {
  const meta = STATUS_META[status] ?? STATUS_META.unchecked
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${meta.className}`}
    >
      {meta.label}
    </span>
  )
}
