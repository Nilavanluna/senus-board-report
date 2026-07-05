import { useInsights } from '../../api/insights'
import { Card } from '../../components/Card'
import { LoadingBlock } from '../../components/LoadingBlock'
import { ErrorBlock } from '../../components/ErrorBlock'
import { renderVerifiedCommentary } from '../../lib/verifyCommentary'
import { PERSONAS } from './PersonaToggle'
import type { Audience, MetricResult } from '../../api/types'

export function CommentaryPanel({ audience, metrics }: { audience: Audience; metrics: MetricResult[] }) {
  const query = useInsights(audience)
  const label = PERSONAS.find((p) => p.key === audience)?.label ?? audience

  return (
    <Card>
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-medium text-zinc-300">AI Commentary</h3>
          <p className="mt-0.5 text-xs text-zinc-500">{label} lens · numbers verified against the metrics payload</p>
        </div>
        <button
          onClick={() => query.refetch()}
          disabled={query.isFetching}
          className="shrink-0 rounded border border-zinc-700 px-2.5 py-1 text-xs text-zinc-300 hover:bg-zinc-800 disabled:opacity-50"
        >
          {query.isFetching ? 'Regenerating…' : 'Regenerate'}
        </button>
      </div>

      <div className="mt-4">
        {query.isPending ? (
          <LoadingBlock rows={4} />
        ) : query.isError ? (
          <ErrorBlock message={query.error instanceof Error ? query.error.message : 'unknown error'} />
        ) : query.data.commentary === null ? (
          <p className="rounded-lg border border-zinc-800 bg-zinc-900/60 px-4 py-3 text-sm text-zinc-500">
            {query.data.note ?? 'AI commentary is not available.'}
          </p>
        ) : (
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-zinc-300">
            {renderVerifiedCommentary(query.data.commentary, metrics)}
          </p>
        )}
      </div>
    </Card>
  )
}
