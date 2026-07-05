import { useEvents } from '../../api/events'
import { useKpis } from '../../api/kpis'
import { Async } from '../../components/Async'
import { Card } from '../../components/Card'
import { EventTimeline } from './EventTimeline'
import { RiskCallout } from './RiskCallout'
import type { CorporateEvent } from '../../api/types'

export function EventsGovernancePage() {
  const eventsQuery = useEvents()
  const kpisQuery = useKpis()

  return (
    <div className='space-y-6'>
      <div>
        <h1 className='text-lg font-semibold text-zinc-100'>Events &amp; Governance</h1>
        <p className='mt-1 text-sm text-zinc-500'>Corporate events timeline, from /api/events.</p>
      </div>

      <Async query={eventsQuery} loadingRows={4}>
        {(data) => {
          const risk = data.events.find((e: CorporateEvent) => e.type === 'governance_risk')
          return (
            <div className='grid grid-cols-1 gap-6 lg:grid-cols-3'>
              <Card className='lg:col-span-2' title='Timeline'>
                <EventTimeline events={data.events} />
              </Card>
              <div className='space-y-6'>
                {risk && (
                  <Async query={kpisQuery} loadingRows={3}>
                    {(kpis) => <RiskCallout risk={risk} kpis={kpis} />}
                  </Async>
                )}
              </div>
            </div>
          )
        }}
      </Async>
    </div>
  )
}
