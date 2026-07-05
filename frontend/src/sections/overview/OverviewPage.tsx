import { useMetrics } from '../../api/metrics'
import { useFacts } from '../../api/facts'
import { useValidation } from '../../api/validation'
import { Async } from '../../components/Async'
import { findMetric } from '../../lib/metrics'
import { KpiCards } from './KpiCards'
import { RevenueChart } from './RevenueChart'
import { Senus2030Tracker } from './Senus2030Tracker'
import { MarginTrendChart } from './MarginTrendChart'
import { ValidationBanner } from './ValidationBanner'

export function OverviewPage() {
  const metricsQuery = useMetrics()
  const factsQuery = useFacts()
  const validationQuery = useValidation()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-semibold text-zinc-100">Overview</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Senus PLC — H1 FY2026 half-year results, validated against source documents.
        </p>
      </div>

      <Async query={metricsQuery} loadingRows={2}>
        {(data) => (
          <div className="space-y-6">
            <KpiCards metrics={data.metrics} />
            <Senus2030Tracker metric={findMetric(data.metrics, 'senus2030_gap', 'FY2026')} />
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <RevenueChart metrics={data.metrics} />
              <Async query={factsQuery} loadingRows={3}>
                {(facts) => <MarginTrendChart metrics={data.metrics} facts={facts} />}
              </Async>
            </div>
          </div>
        )}
      </Async>

      <Async query={validationQuery} loadingRows={1}>
        {(report) => <ValidationBanner report={report} />}
      </Async>
    </div>
  )
}
