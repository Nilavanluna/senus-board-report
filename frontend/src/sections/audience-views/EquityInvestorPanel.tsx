import { Card } from '../../components/Card'
import { StatTile } from '../../components/StatTile'
import { findMetric } from '../../lib/metrics'
import { formatEUR, formatNumber, formatPercent } from '../../lib/format'
import type { CorporateEvent, MetricResult, StrategyKpis } from '../../api/types'

export function EquityInvestorPanel({
  metrics,
  kpis,
  events,
}: {
  metrics: MetricResult[]
  kpis: StrategyKpis
  events: CorporateEvent[]
}) {
  const revGrowthH1 = findMetric(metrics, 'revenue_growth', 'H1FY2026')
  const gap = findMetric(metrics, 'senus2030_gap', 'FY2026')
  const ebitda = findMetric(metrics, 'ebitda', 'H1FY2026')
  const placement = events.find((e) => e.type === 'capital_markets')
  const marketCap = kpis.shares_in_issue * kpis.listing_price_eur

  return (
    <div className="space-y-6">
      <Card title="Growth vs. the Senus 2030 commitment" subtitle={kpis.cagr_period}>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatTile label="Target revenue CAGR" value={formatPercent(kpis.revenue_cagr_target * 100, 0)} />
          <StatTile
            label="H1 FY26 growth"
            value={revGrowthH1?.value != null ? formatPercent(revGrowthH1.value) : '—'}
            caption="vs H1 FY25"
          />
          <StatTile
            label="H2 FY26 required growth"
            value={
              gap?.inputs.required_h2_acceleration_pct != null
                ? `+${formatPercent(gap.inputs.required_h2_acceleration_pct)}`
                : '—'
            }
            caption="vs H2 FY25"
          />
        </div>
        {gap?.caveats[0] && <p className="mt-4 text-sm leading-relaxed text-zinc-400">{gap.caveats[0]}</p>}
      </Card>

      <Card title="Path to EBITDA positive" subtitle={`Target: ${kpis.ebitda_positive_target}`}>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <StatTile label="EBITDA (H1 FY26)" value={ebitda?.value != null ? formatEUR(ebitda.value, true) : '—'} />
          <StatTile label="Target" value={kpis.ebitda_positive_target} />
        </div>
        {ebitda?.caveats[0] && <p className="mt-4 text-sm leading-relaxed text-zinc-400">{ebitda.caveats[0]}</p>}
      </Card>

      <Card title="Dilution context">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatTile label="Shares in issue" value={formatNumber(kpis.shares_in_issue)} />
          <StatTile label="Listing price" value={`€${kpis.listing_price_eur}`} />
          <StatTile label="Market cap at listing" value={formatEUR(marketCap, true)} />
        </div>
        {placement && (
          <p className="mt-4 text-sm leading-relaxed text-zinc-400">
            <span className="text-xs text-zinc-500">{placement.date} · </span>
            {placement.event}
          </p>
        )}
      </Card>
    </div>
  )
}
