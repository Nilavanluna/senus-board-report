import type { ReactNode } from 'react'

const TONES = {
  amber: 'border-amber-800/60 bg-amber-950/40 text-amber-400',
  emerald: 'border-emerald-800/60 bg-emerald-950/40 text-emerald-400',
  zinc: 'border-zinc-700 bg-zinc-900 text-zinc-400',
} as const

export function Chip({
  children,
  tone = 'zinc',
}: {
  children: ReactNode
  tone?: keyof typeof TONES
}) {
  return (
    <span
      className={`rounded border px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide ${TONES[tone]}`}
    >
      {children}
    </span>
  )
}

export function UnauditedChip() {
  return <Chip tone="amber">Unaudited</Chip>
}
