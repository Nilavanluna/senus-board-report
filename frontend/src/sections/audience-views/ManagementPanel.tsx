import { Card } from '../../components/Card'
import { StatTile } from '../../components/StatTile'
import { formatEUR, formatPercent } from '../../lib/format'
import { comparePeriods } from '../../lib/periods'
import type { FinancialFact, StrategyKpis } from '../../api/types'

export function ManagementPanel({ facts, kpis }: { facts: FinancialFact[]; kpis: StrategyKpis }) {
  const costBase = facts
    .filter((f) => f.item === 'admin_expenses')
    .sort((a, b) => comparePeriods(a.period, b.period))

  const channelEntries = Object.entries(kpis.channel_mix_fy2025)
  const acvEntries = Object.entries(kpis.acv_by_product)
  const maxAcv = Math.max(...acvEntries.map(([, v]) => v))

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card title="Cost base" subtitle="Admin expenses per period">
          <ul className="space-y-2">
            {costBase.map((f) => (
              <li key={f.period} className="flex items-center justify-between text-sm">
                <span className="text-zinc-500">{f.period}</span>
                <span className="tabular-nums text-zinc-200">{formatEUR(f.value)}</span>
              </li>
            ))}
          </ul>
        </Card>

        <Card title="Channel mix" subtitle={`FY2025 · ${kpis.customer_accounts_fy2025} customer accounts`}>
          <ul className="space-y-3">
            {channelEntries.map(([channel, share]) => (
              <li key={channel}>
                <div className="flex items-center justify-between text-sm">
                  <span className="capitalize text-zinc-300">{channel}</span>
                  <span className="text-zinc-500">
                    {formatPercent(share * 100, 0)} · {kpis.customers_by_channel_fy2025[channel] ?? '—'} accounts
                  </span>
                </div>
                <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-zinc-800">
                  <div className="h-full rounded-full bg-blue-600" style={{ width: `${share * 100}%` }} />
                </div>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card title="ACV by product" subtitle="Average contract value, FY2025">
          <ul className="space-y-3">
            {acvEntries.map(([product, value]) => (
              <li key={product}>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-zinc-300">{product}</span>
                  <span className="tabular-nums text-zinc-200">{formatEUR(value)}</span>
                </div>
                <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-zinc-800">
                  <div
                    className="h-full rounded-full bg-blue-600"
                    style={{ width: `${(value / maxAcv) * 100}%` }}
                  />
                </div>
              </li>
            ))}
          </ul>
        </Card>

        <Card title="H1 FY26 pipeline">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <StatTile label="Deals" value={String(kpis.h1fy2026_deals.count)} />
            <StatTile label="Closed value" value={formatEUR(kpis.h1fy2026_deals.closed_value, true)} />
            <StatTile label="Open pipeline" value={formatEUR(kpis.h1fy2026_deals.open_pipeline, true)} />
          </div>
        </Card>
      </div>
    </div>
  )
}
