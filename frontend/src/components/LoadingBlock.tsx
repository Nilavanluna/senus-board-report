export function LoadingBlock({ label = 'Loading…', rows = 3 }: { label?: string; rows?: number }) {
  return (
    <div role="status" aria-label={label} className="animate-pulse space-y-2">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-4 rounded bg-zinc-800" style={{ width: `${85 - i * 12}%` }} />
      ))}
    </div>
  )
}
