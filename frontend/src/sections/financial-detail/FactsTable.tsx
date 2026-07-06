import { StatusDot } from '../../components/StatusDot'
import { UnauditedChip } from '../../components/Chip'
import { formatEUR } from '../../lib/format'
import { comparePeriods, humanizeItem } from '../../lib/periods'
import { sortItemsByStatement } from '../../lib/statementOrder'
import type { DocumentMeta } from '../../lib/useDocumentMeta'
import type { FinancialFact, Statement } from '../../api/types'

export function FactsTable({
  facts,
  statement,
  documentMeta,
  onSelectFact,
}: {
  facts: FinancialFact[]
  statement: Statement
  documentMeta: Map<string, DocumentMeta>
  onSelectFact: (factId: number) => void
}) {
  const rows = facts.filter((f) => f.statement === statement)

  const periods = [...new Set(rows.map((f) => f.period))].sort(comparePeriods)
  const items: string[] = []
  for (const f of rows) if (!items.includes(f.item)) items.push(f.item)
  const orderedItems = sortItemsByStatement(items, statement)

  const cell = new Map<string, FinancialFact>()
  for (const f of rows) cell.set(`${f.item}:${f.period}`, f)

  const periodUnaudited = new Map<string, boolean>()
  for (const p of periods) {
    const fact = rows.find((f) => f.period === p)
    const meta = fact ? documentMeta.get(fact.doc) : undefined
    periodUnaudited.set(p, meta ? !meta.audited : false)
  }

  if (orderedItems.length === 0) {
    return <p className="px-1 py-6 text-sm text-zinc-500">No facts extracted for this statement.</p>
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b border-zinc-800 text-left text-xs text-zinc-500">
            <th className="py-2 pr-4 font-medium">Line item</th>
            {periods.map((p) => (
              <th key={p} className="py-2 px-4 text-right font-medium">
                <span className="inline-flex items-center gap-1.5">
                  {p}
                  {periodUnaudited.get(p) && <UnauditedChip />}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {orderedItems.map((item) => (
            <tr key={item} className="border-b border-zinc-900 hover:bg-zinc-900/40">
              <td className="py-2 pr-4 text-zinc-300">{humanizeItem(item)}</td>
              {periods.map((p) => {
                const fact = cell.get(`${item}:${p}`)
                if (!fact) {
                  return (
                    <td key={p} className="py-2 px-4 text-right text-zinc-700">
                      —
                    </td>
                  )
                }
                const isAnomalous = fact.validation_status === 'anomaly' || fact.validation_status === 'failed'
                return (
                  <td key={p} className="py-2 px-4 text-right">
                    <button
                      onClick={() => onSelectFact(fact.id)}
                      className="font-numeric group inline-flex items-center gap-1.5 rounded px-1.5 py-0.5 text-right tabular-nums text-zinc-200 hover:bg-zinc-800/60 hover:text-white"
                    >
                      {isAnomalous && (
                        <StatusDot
                          status={fact.validation_status}
                          title={fact.validation_note ?? 'Validation anomaly'}
                        />
                      )}
                      <span className="underline decoration-zinc-700 underline-offset-2 group-hover:decoration-zinc-400">
                        {formatEUR(fact.value)}
                      </span>
                    </button>
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
