import { Card } from '../../components/Card'
import { Senus2030Tracker } from '../overview/Senus2030Tracker'
import { findMetric } from '../../lib/metrics'
import { formatDate } from '../../lib/format'
import type { CorporateEvent, MetricResult } from '../../api/types'

export function BoardPanel({ metrics, events }: { metrics: MetricResult[]; events: CorporateEvent[] }) {
  const risk = events.find((e) => e.type === 'governance_risk')
  const upcoming = [...events]
    .filter((e) => e.type !== 'governance_risk')
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(-3)

  return (
    <div className="space-y-6">
      <Senus2030Tracker metric={findMetric(metrics, 'senus2030_gap', 'FY2026')} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card title="Recent & upcoming events" subtitle="From /api/events">
          <ul className="space-y-3">
            {upcoming.map((e, i) => (
              <li key={i} className="text-sm">
                <p className="text-xs text-zinc-500">{formatDate(e.date)}</p>
                <p className="mt-0.5 text-zinc-300">{e.event}</p>
              </li>
            ))}
          </ul>
        </Card>

        {risk && (
          <Card
            title="Key-person risk"
            subtitle="Governance callout"
            className="border-amber-900/40"
          >
            <p className="text-xs text-zinc-500">{formatDate(risk.date)}</p>
            <p className="mt-2 text-sm leading-relaxed text-amber-200">{risk.event}</p>
          </Card>
        )}
      </div>
    </div>
  )
}
