import type { Statement } from '../../api/types'

const TABS: { key: Statement; label: string }[] = [
  { key: 'pnl', label: 'P&L' },
  { key: 'balance', label: 'Balance Sheet' },
  { key: 'cashflow', label: 'Cash Flow' },
]

export function StatementTabs({
  active,
  onChange,
}: {
  active: Statement
  onChange: (statement: Statement) => void
}) {
  return (
    <div className="flex gap-1 border-b border-zinc-800">
      {TABS.map((tab) => (
        <button
          key={tab.key}
          onClick={() => onChange(tab.key)}
          className={`border-b-2 px-4 py-2 text-sm font-medium transition-colors ${
            active === tab.key
              ? 'border-blue-500 text-zinc-100'
              : 'border-transparent text-zinc-500 hover:text-zinc-300'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}
