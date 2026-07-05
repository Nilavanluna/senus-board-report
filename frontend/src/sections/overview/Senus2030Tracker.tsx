import { Card } from '../../components/Card'
import { chartColor } from '../../lib/chartColors'
import { formatEUR, formatPercent } from '../../lib/format'
import type { MetricResult } from '../../api/types'

export function Senus2030Tracker({ metric }: { metric: MetricResult | undefined }) {
  if (!metric || metric.value === null || !metric.inputs.fy26_target) {
    return (
      <Card title="Senus 2030 · FY26 Tracker">
        <p className="text-sm text-zinc-500">Senus 2030 tracker unavailable — required facts missing.</p>
      </Card>
    )
  }

  const target = metric.inputs.fy26_target ?? 0
  const delivered = metric.inputs.h1_delivered ?? 0
  const required = metric.inputs.h2_required ?? 0
  const priorYearH2 = metric.inputs.h2_prior_year ?? null
  const accelerationPct = metric.inputs.required_h2_acceleration_pct ?? null

  const deliveredPct = target ? (delivered / target) * 100 : 0
  const requiredPct = target ? (required / target) * 100 : 0
  const priorPacePct = target && priorYearH2 !== null ? ((delivered + priorYearH2) / target) * 100 : null

  return (
    <div className="rounded-xl border border-blue-900/40 bg-gradient-to-br from-blue-950/30 via-zinc-900/40 to-zinc-900/40 p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-blue-400">
            Senus 2030 · FY26 Revenue Tracker
          </p>
          <p className="mt-1 text-sm text-zinc-400">
            Progress toward the &gt;=50% revenue CAGR commitment made at listing
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs text-zinc-500">FY26 target</p>
          <p className="text-2xl font-semibold text-zinc-100">{formatEUR(target)}</p>
        </div>
      </div>

      <div className="relative mt-8 h-11 w-full overflow-hidden rounded-lg bg-zinc-800/60">
        <div
          className="absolute inset-y-0 left-0 flex items-center justify-end rounded-l-lg pr-2"
          style={{ width: `${deliveredPct}%`, backgroundColor: chartColor.primary }}
        >
          {deliveredPct > 14 && (
            <span className="text-xs font-medium text-white">{formatEUR(delivered, true)}</span>
          )}
        </div>
        <div
          className="absolute inset-y-0 flex items-center justify-start pl-2"
          style={{ left: `${deliveredPct}%`, width: `${requiredPct}%`, backgroundColor: chartColor.warning }}
        >
          {requiredPct > 14 && (
            <span className="text-xs font-medium text-white">{formatEUR(required, true)}</span>
          )}
        </div>
        {priorPacePct !== null && (
          <div
            className="absolute inset-y-0 border-l-2 border-dashed border-zinc-100/70"
            style={{ left: `${priorPacePct}%` }}
          />
        )}
      </div>
      <div className="relative mt-2 h-4 text-[11px] text-zinc-500">
        <span className="absolute left-0">H1 delivered</span>
        {priorPacePct !== null && (
          <span
            className="absolute -translate-x-1/2 whitespace-nowrap text-zinc-400"
            style={{ left: `${priorPacePct}%` }}
          >
            H2 FY25 pace
          </span>
        )}
        <span className="absolute right-0">H2 required</span>
      </div>

      <p className="mt-6 text-sm leading-relaxed text-zinc-300">{metric.caveats[0]}</p>

      <div className="mt-6 grid grid-cols-1 gap-4 border-t border-zinc-800 pt-5 sm:grid-cols-3">
        <div>
          <p className="text-xs text-zinc-500">H1 FY26 delivered</p>
          <p className="mt-1 text-lg font-medium text-zinc-100">{formatEUR(delivered)}</p>
        </div>
        <div>
          <p className="text-xs text-zinc-500">H2 FY26 required</p>
          <p className="mt-1 text-lg font-medium text-amber-400">{formatEUR(required)}</p>
        </div>
        <div>
          <p className="text-xs text-zinc-500">Required H2 acceleration</p>
          <p className="mt-1 text-lg font-medium text-amber-400">
            {accelerationPct !== null ? `+${formatPercent(accelerationPct)}` : '—'} vs H2 FY25
          </p>
        </div>
      </div>
    </div>
  )
}
