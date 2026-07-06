import { Chip } from '../../components/Chip'
import { formatDate } from '../../lib/format'
import type { CorporateEvent } from '../../api/types'

const TYPE_META: Record<string, { label: string; tone: 'amber' | 'emerald' | 'zinc' }> = {
  m_and_a: { label: 'M&A', tone: 'zinc' },
  capital_markets: { label: 'Capital Markets', tone: 'emerald' },
  governance: { label: 'Governance', tone: 'zinc' },
  governance_risk: { label: 'Governance Risk', tone: 'amber' },
  reporting: { label: 'Reporting', tone: 'zinc' },
}

export function EventTimeline({ events }: { events: CorporateEvent[] }) {
  const sorted = [...events].sort((a, b) => a.date.localeCompare(b.date))

  return (
    <ol className="relative border-l border-zinc-800 pl-6">
      {sorted.map((e, i) => {
        const meta = TYPE_META[e.type] ?? { label: e.type, tone: 'zinc' as const }
        return (
          <li key={i} className="mb-8 last:mb-0">
            <span className="absolute -left-[5px] mt-1.5 h-2.5 w-2.5 rounded-full border-2 border-zinc-950 bg-brand" />
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-xs text-zinc-500">{formatDate(e.date)}</p>
              <Chip tone={meta.tone}>{meta.label}</Chip>
            </div>
            <p className="mt-1.5 text-sm leading-relaxed text-zinc-300">{e.event}</p>
          </li>
        )
      })}
    </ol>
  )
}
