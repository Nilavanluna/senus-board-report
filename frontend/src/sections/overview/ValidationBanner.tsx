import { useState } from 'react'
import { StatusDot } from '../../components/StatusDot'
import type { ValidationReport } from '../../api/types'

export function ValidationBanner({ report }: { report: ValidationReport }) {
  const [open, setOpen] = useState(false)
  const { passed, anomalies, failed } = report.summary
  const total = passed + anomalies + failed
  const overallStatus = failed > 0 ? 'failed' : anomalies > 0 ? 'anomaly' : 'passed'

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/40">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-3 px-5 py-3 text-left text-sm text-zinc-300 transition-colors hover:bg-zinc-900/70"
      >
        <span className="flex items-center gap-2">
          <StatusDot status={overallStatus} />
          {total} validation checks · {passed} passed
          {anomalies > 0 ? `, ${anomalies} anomalies` : ''}
          {failed > 0 ? `, ${failed} failed` : ''} — click to review
        </span>
        <span className="text-zinc-500">{open ? '−' : '+'}</span>
      </button>
      {open && (
        <div className="space-y-3 border-t border-zinc-800 px-5 py-4">
          {report.findings.map((f, i) => (
            <div key={i} className="flex items-start gap-2 text-xs">
              <span className="mt-1">
                <StatusDot status={f.status} />
              </span>
              <div>
                <p className="font-medium text-zinc-300">
                  {f.period_id} · {f.rule}
                </p>
                <p className="mt-0.5 text-zinc-500">{f.detail}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
