interface StatTileProps {
  label: string
  value: string
  delta?: { value: string; positive: boolean }
  caption?: string
}

export function StatTile({ label, value, delta, caption }: StatTileProps) {
  return (
    <div className="rounded-panel border border-zinc-800 bg-zinc-900/40 p-5">
      <p className="text-xs text-zinc-500">{label}</p>
      <div className="mt-2 flex items-baseline gap-2">
        <span className="font-numeric text-2xl font-semibold tracking-tight tabular-nums text-zinc-100">{value}</span>
        {delta && (
          <span className={`text-xs font-medium ${delta.positive ? 'text-emerald-400' : 'text-rose-400'}`}>
            {delta.value}
          </span>
        )}
      </div>
      {caption && <p className="mt-1 text-xs text-zinc-600">{caption}</p>}
    </div>
  )
}
