import type { ReactNode } from 'react'

interface CardProps {
  title?: string
  subtitle?: string
  className?: string
  children: ReactNode
}

export function Card({ title, subtitle, className, children }: CardProps) {
  return (
    <div className={`rounded-xl border border-zinc-800 bg-zinc-900/40 p-5 ${className ?? ''}`}>
      {title && <h3 className="text-sm font-medium text-zinc-300">{title}</h3>}
      {subtitle && <p className="mt-0.5 text-xs text-zinc-500">{subtitle}</p>}
      <div className={title || subtitle ? 'mt-4' : ''}>{children}</div>
    </div>
  )
}
