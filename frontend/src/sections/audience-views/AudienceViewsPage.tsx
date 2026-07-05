import { useState } from 'react'
import { useMetrics } from '../../api/metrics'
import { useFacts } from '../../api/facts'
import { useEvents } from '../../api/events'
import { useKpis } from '../../api/kpis'
import { Async } from '../../components/Async'
import { PersonaToggle } from './PersonaToggle'
import { BoardPanel } from './BoardPanel'
import { ManagementPanel } from './ManagementPanel'
import { EquityInvestorPanel } from './EquityInvestorPanel'
import { CreditProviderPanel } from './CreditProviderPanel'
import { CommentaryPanel } from './CommentaryPanel'
import type { Audience } from '../../api/types'

export function AudienceViewsPage() {
  const [audience, setAudience] = useState<Audience>('board')

  const metricsQuery = useMetrics()
  const factsQuery = useFacts()
  const eventsQuery = useEvents()
  const kpisQuery = useKpis()

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-lg font-semibold text-zinc-100">Audience Views</h1>
          <p className="mt-1 text-sm text-zinc-500">The same validated facts, read through a different lens.</p>
        </div>
        <PersonaToggle active={audience} onChange={setAudience} />
      </div>

      <Async query={metricsQuery} loadingRows={4}>
        {(metricsData) => (
          <Async query={factsQuery} loadingRows={4}>
            {(facts) => (
              <Async query={eventsQuery} loadingRows={2}>
                {(eventsData) => (
                  <Async query={kpisQuery} loadingRows={4}>
                    {(kpis) => (
                      <>
                        {audience === 'board' && (
                          <BoardPanel metrics={metricsData.metrics} events={eventsData.events} />
                        )}
                        {audience === 'management' && <ManagementPanel facts={facts} kpis={kpis} />}
                        {audience === 'equity_investor' && (
                          <EquityInvestorPanel
                            metrics={metricsData.metrics}
                            kpis={kpis}
                            events={eventsData.events}
                          />
                        )}
                        {audience === 'credit_provider' && (
                          <CreditProviderPanel metrics={metricsData.metrics} facts={facts} />
                        )}
                      </>
                    )}
                  </Async>
                )}
              </Async>
            )}
          </Async>
        )}
      </Async>

      <Async query={metricsQuery} loadingRows={3}>
        {(metricsData) => <CommentaryPanel audience={audience} metrics={metricsData.metrics} />}
      </Async>
    </div>
  )
}
