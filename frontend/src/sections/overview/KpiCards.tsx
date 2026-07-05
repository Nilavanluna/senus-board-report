import { StatTile } from '../../components/StatTile'
import { findMetric } from '../../lib/metrics'
import { formatEUR, formatMonths, formatPercent } from '../../lib/format'
import type { MetricResult } from '../../api/types'

export function KpiCards({ metrics }: { metrics: MetricResult[] }) {
  const revGrowth = findMetric(metrics, 'revenue_growth', 'H1FY2026')
  const grossMargin = findMetric(metrics, 'gross_margin', 'H1FY2026')
  const runway = findMetric(metrics, 'cash_runway', 'H1FY2026')
  const ebitda = findMetric(metrics, 'ebitda', 'H1FY2026')

  const revenue = revGrowth?.inputs.current ?? null
  const cash = runway?.inputs.cash ?? null

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
      <StatTile
        label="H1 FY26 Revenue"
        value={formatEUR(revenue, true)}
        delta={
          revGrowth?.value != null
            ? {
                value: `${revGrowth.value >= 0 ? '+' : ''}${formatPercent(revGrowth.value)} YoY`,
                positive: revGrowth.value >= 0,
              }
            : undefined
        }
      />
      <StatTile
        label="Gross Margin"
        value={formatPercent(grossMargin?.value ?? null)}
        caption="H1 FY26"
      />
      <StatTile label="Cash" value={formatEUR(cash, true)} caption="H1 FY26 closing" />
      <StatTile
        label="Cash Runway"
        value={formatMonths(runway?.value ?? null)}
        caption="at current burn rate"
      />
      <StatTile
        label="EBITDA"
        value={formatEUR(ebitda?.value ?? null, true)}
        caption="H1 FY26"
      />
    </div>
  )
}
