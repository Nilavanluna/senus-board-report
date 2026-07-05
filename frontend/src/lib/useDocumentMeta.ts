import { useQueries } from '@tanstack/react-query'
import { fetchFactProvenance } from '../api/facts'
import type { FinancialFact } from '../api/types'

export interface DocumentMeta {
  audited: boolean
  document: string
  sourceUrl: string
}

// Document audited/title/source-url isn't on FinancialFact - only the
// per-fact provenance endpoint has it. Rather than fetching provenance for
// every fact, fetch it once per distinct doc_id (there are only ~2-3) and
// reuse the doc's metadata across every fact that shares that doc_id. This
// hits the same ['fact-provenance', id] query key the drawer uses, so
// opening the drawer for that representative fact is served from cache.
export function useDocumentMeta(facts: FinancialFact[] | undefined) {
  const representative = new Map<string, number>()
  for (const f of facts ?? []) {
    if (!representative.has(f.doc)) representative.set(f.doc, f.id)
  }
  const docIds = [...representative.keys()]
  const factIds = [...representative.values()]

  const results = useQueries({
    queries: factIds.map((id) => ({
      queryKey: ['fact-provenance', id],
      queryFn: () => fetchFactProvenance(id),
      enabled: facts !== undefined,
    })),
  })

  const map = new Map<string, DocumentMeta>()
  results.forEach((r, i) => {
    if (r.data) {
      map.set(docIds[i], {
        audited: r.data.audited,
        document: r.data.document,
        sourceUrl: r.data.source_url,
      })
    }
  })

  return { map, isLoading: facts !== undefined && results.some((r) => r.isPending) }
}
