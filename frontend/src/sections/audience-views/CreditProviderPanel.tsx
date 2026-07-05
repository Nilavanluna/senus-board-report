import { useState } from 'react'
import { Card } from '../../components/Card'
import { StatTile } from '../../components/StatTile'
import { findMetric, factsIndex, getFact } from '../../lib/metrics'
import { formatEUR, formatMonths, formatMultiple } from '../../lib/format'
import type { FinancialFact, MetricResult } from '../../api/types'

const PERIOD = 'H1FY2026'

export function CreditProviderPanel({ metrics, facts }: { metrics: MetricResult[]; facts: FinancialFact[] }) {
  const [excludeContingent, setExcludeContingent] = useState(false)

  const runway = findMetric(metrics, 'cash_runway', PERIOD)
  const dscr = findMetric(metrics, 'dscr', PERIOD)

  const idx = factsIndex(facts)
  const bankDebt = getFact(idx, PERIOD, 'bank_debt')
  const workingCapital = getFact(idx, PERIOD, 'working_capital_movement')
  const netAssets = getFact(idx, PERIOD, 'net_assets')
  const contingentConsideration = getFact(idx, PERIOD, 'contingent_consideration')
  const contingentNote = facts.find((f) => f.item === 'contingent_consideration' && f.period === PERIOD)?.note

  const adjustedNetAssets =
    netAssets !== null && contingentConsideration !== null ? netAssets - contingentConsideration : null
  const displayedNetAssets = excludeContingent ? adjustedNetAssets : netAssets

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatTile
          label="Cash runway"
          value={formatMonths(runway?.value ?? null)}
          caption="at current burn"
        />
        <StatTile label="DSCR" value={formatMultiple(dscr?.value ?? null)} caption="EBITDA / debt service" />
        <StatTile label="Bank debt" value={formatEUR(bankDebt)} caption="SBCI-backed" />
        <StatTile label="Working capital movement" value={formatEUR(workingCapital)} caption="H1 FY26" />
      </div>

      {dscr?.caveats[0] && (
        <Card>
          <p className="text-sm leading-relaxed text-zinc-400">{dscr.caveats[0]}</p>
        </Card>
      )}

      <Card title="Net assets" subtitle="Contingent consideration treatment">
        <div className="flex items-center justify-between">
          <p className="text-2xl font-semibold text-zinc-100">{formatEUR(displayedNetAssets)}</p>
          <label className="flex items-center gap-2 text-xs text-zinc-400">
            <input
              type="checkbox"
              checked={excludeContingent}
              onChange={(e) => setExcludeContingent(e.target.checked)}
              className="h-3.5 w-3.5 rounded border-zinc-600 bg-zinc-800 accent-blue-600"
            />
            Exclude contingent consideration
          </label>
        </div>
        <p className="mt-3 text-xs text-zinc-500">
          {excludeContingent
            ? `Adds back ${formatEUR(contingentConsideration !== null ? Math.abs(contingentConsideration) : null)} of contingent consideration.`
            : `Includes ${formatEUR(contingentConsideration !== null ? Math.abs(contingentConsideration) : null)} of contingent consideration as a current liability.`}
          {contingentNote ? ` ${contingentNote}` : ''}
        </p>
      </Card>
    </div>
  )
}
