import type { Audience } from '../../api/types'

export const PERSONAS: { key: Audience; label: string }[] = [
  { key: 'board', label: 'Board' },
  { key: 'management', label: 'Management' },
  { key: 'equity_investor', label: 'Equity Investor' },
  { key: 'credit_provider', label: 'Credit Provider' },
]

export function PersonaToggle({
  active,
  onChange,
}: {
  active: Audience
  onChange: (audience: Audience) => void
}) {
  return (
    <div className="inline-flex rounded-lg border border-zinc-800 bg-zinc-900/40 p-1">
      {PERSONAS.map((p) => (
        <button
          key={p.key}
          onClick={() => onChange(p.key)}
          className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
            active === p.key ? 'bg-zinc-800 text-zinc-100' : 'text-zinc-500 hover:text-zinc-300'
          }`}
        >
          {p.label}
        </button>
      ))}
    </div>
  )
}
