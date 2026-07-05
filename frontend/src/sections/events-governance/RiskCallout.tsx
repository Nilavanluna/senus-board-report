import { Card } from '../../components/Card'
import { formatDate, formatEUR } from '../../lib/format'
import type { CorporateEvent, StrategyKpis } from '../../api/types'

export function RiskCallout({ risk, kpis }: { risk: CorporateEvent; kpis: StrategyKpis }) {
  const acvEntries = Object.entries(kpis.acv_by_product)
  const [topProduct, topAcv] = acvEntries.reduce((a, b) => (b[1] > a[1] ? b : a))

  return (
    <Card title="Key-person risk" subtitle="Governance callout" className="border-amber-900/40">
      <p className="text-xs text-zinc-500">{formatDate(risk.date)}</p>
      <p className="mt-2 text-sm leading-relaxed text-amber-200">{risk.event}</p>
      <p className="mt-3 text-xs leading-relaxed text-zinc-500">
        {topProduct} carries the highest average contract value of any product line ({formatEUR(topAcv)}) —
        the ERA/financial-institutions vertical the transition narrative flags as instrumental.
      </p>
    </Card>
  )
}
