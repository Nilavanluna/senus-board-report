import { useFactProvenance } from '../../api/facts'
import { StatusDot } from '../../components/StatusDot'
import { UnauditedChip } from '../../components/Chip'
import { LoadingBlock } from '../../components/LoadingBlock'
import { ErrorBlock } from '../../components/ErrorBlock'
import { formatDate, formatEUR, formatPercent } from '../../lib/format'

export function ProvenanceDrawer({
  factId,
  onClose,
}: {
  factId: number | null
  onClose: () => void
}) {
  const query = useFactProvenance(factId)
  const open = factId !== null

  return (
    <>
      <div
        className={`fixed inset-0 z-40 bg-black/50 transition-opacity ${
          open ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
        }`}
        onClick={onClose}
      />
      <aside
        className={`fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col border-l border-zinc-800 bg-zinc-950 shadow-2xl transition-transform ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between border-b border-zinc-800 px-5 py-4">
          <h2 className="text-sm font-semibold text-zinc-100">Provenance</h2>
          <button
            onClick={onClose}
            className="rounded p-1 text-zinc-500 hover:bg-zinc-900 hover:text-zinc-200"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-5">
          {!open ? null : query.isPending ? (
            <LoadingBlock rows={5} />
          ) : query.isError ? (
            <ErrorBlock message={query.error instanceof Error ? query.error.message : 'unknown error'} />
          ) : (
            <div className="space-y-5 text-sm">
              <div>
                <p className="text-xs text-zinc-500">Line item</p>
                <p className="mt-1 font-medium text-zinc-100">{query.data.item}</p>
                <p className="mt-0.5 text-xs text-zinc-500">{query.data.period}</p>
              </div>

              <div>
                <p className="text-xs text-zinc-500">Reported value</p>
                <p className="mt-1 text-lg font-semibold text-zinc-100">{formatEUR(query.data.value)}</p>
              </div>

              <div className="flex items-center gap-2">
                <StatusDot status={query.data.validation_status} />
                <span className="text-xs capitalize text-zinc-400">{query.data.validation_status}</span>
                {!query.data.audited && <UnauditedChip />}
              </div>
              {query.data.validation_note && (
                <p className="rounded-lg border border-amber-900/40 bg-amber-950/20 px-3 py-2 text-xs text-amber-300">
                  {query.data.validation_note}
                </p>
              )}

              <div className="border-t border-zinc-800 pt-4">
                <p className="text-xs text-zinc-500">Source document</p>
                <a
                  href={query.data.source_url}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-1 block text-sm font-medium text-blue-400 hover:underline"
                >
                  {query.data.document}
                </a>
                <p className="mt-1 text-xs text-zinc-500">
                  Published {formatDate(query.data.published)}
                  {query.data.source_page !== null ? ` · page ${query.data.source_page}` : ''}
                </p>
              </div>

              {query.data.source_excerpt && (
                <div>
                  <p className="text-xs text-zinc-500">Verbatim excerpt</p>
                  <blockquote className="mt-1 border-l-2 border-zinc-700 pl-3 text-xs italic leading-relaxed text-zinc-400">
                    "{query.data.source_excerpt}"
                  </blockquote>
                </div>
              )}

              <div>
                <p className="text-xs text-zinc-500">Extraction confidence</p>
                <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-zinc-800">
                  <div
                    className="h-full rounded-full bg-blue-600"
                    style={{ width: `${query.data.extraction_confidence * 100}%` }}
                  />
                </div>
                <p className="mt-1 text-xs text-zinc-500">
                  {formatPercent(query.data.extraction_confidence * 100, 0)}
                </p>
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  )
}
