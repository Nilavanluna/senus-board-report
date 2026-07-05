import { useState } from 'react'
import { useFacts } from '../../api/facts'
import { useMetrics } from '../../api/metrics'
import { Async } from '../../components/Async'
import { Card } from '../../components/Card'
import { useDocumentMeta } from '../../lib/useDocumentMeta'
import { StatementTabs } from './StatementTabs'
import { FactsTable } from './FactsTable'
import { ProvenanceDrawer } from './ProvenanceDrawer'
import { FcfBridgeChart } from './FcfBridgeChart'
import type { Statement } from '../../api/types'

export function FinancialDetailPage() {
  const [statement, setStatement] = useState<Statement>('pnl')
  const [selectedFactId, setSelectedFactId] = useState<number | null>(null)

  const factsQuery = useFacts()
  const metricsQuery = useMetrics()
  const { map: documentMeta } = useDocumentMeta(factsQuery.data)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-semibold text-zinc-100">Financial Detail</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Every figure is clickable — open the provenance drawer for source document, page, and validation status.
        </p>
      </div>

      <Card>
        <StatementTabs active={statement} onChange={setStatement} />
        <div className="mt-4">
          <Async query={factsQuery} loadingRows={6}>
            {(facts) => (
              <FactsTable
                facts={facts}
                statement={statement}
                documentMeta={documentMeta}
                onSelectFact={setSelectedFactId}
              />
            )}
          </Async>
        </div>
      </Card>

      {statement === 'cashflow' && (
        <Async query={metricsQuery} loadingRows={4}>
          {(data) => <FcfBridgeChart metrics={data.metrics} />}
        </Async>
      )}

      <ProvenanceDrawer factId={selectedFactId} onClose={() => setSelectedFactId(null)} />
    </div>
  )
}
