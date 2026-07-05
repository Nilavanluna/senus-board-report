// Types mirror the FastAPI response shapes in backend/app/main.py exactly.
// Keep in sync with backend/app/models.py and backend/app/services/*.py.

export type Statement = 'pnl' | 'balance' | 'cashflow' | 'kpi'

export type ValidationStatus = 'unchecked' | 'passed' | 'anomaly' | 'failed'

export interface FinancialFact {
  id: number
  period: string
  statement: Statement
  item: string
  value: number
  doc: string
  validation_status: ValidationStatus
  note: string | null
}

export interface FactProvenance {
  item: string
  period: string
  value: number
  document: string
  published: string
  audited: boolean
  source_url: string
  source_page: number | null
  source_excerpt: string | null
  extraction_confidence: number
  validation_status: ValidationStatus
  validation_note: string | null
}

export type FindingStatus = 'passed' | 'anomaly' | 'failed'

export interface ValidationFinding {
  period_id: string
  rule: string
  status: FindingStatus
  detail: string
}

export interface ValidationReport {
  findings: ValidationFinding[]
  summary: {
    passed: number
    anomalies: number
    failed: number
  }
}

// The known metric names returned by MetricsEngine (backend/app/services/metrics.py).
// `name` is typed loosely as `string` on MetricResult itself since the backend does not
// constrain it, but this union documents what to expect when looking metrics up by name.
export type MetricName = 'revenue_growth' | 'senus2030_gap' | 'gross_margin' | 'operating_margin' | 'ebitda_margin' | 'ebitda' | 'cash_runway' | 'fcf' | 'dscr' | 'roce'

export type MetricUnit = '%' | 'EUR' | 'months' | 'x'

export interface MetricResult {
  name: string
  period: string
  value: number | null
  unit: string
  formula: string
  inputs: Record<string, number | null>
  caveats: string[]
}

export interface MetricsResponse {
  metrics: MetricResult[]
}

export interface EventsResponse {
  events: CorporateEvent[]
}

export type Audience = 'board' | 'management' | 'equity_investor' | 'credit_provider' | 'governance'

export interface InsightsResponse {
  audience: Audience
  commentary: string | null
  note?: string
}

// GET /api/kpis - the Senus 2030 strategy KPI set (backend/seed/senus_facts.json "kpis").
export interface StrategyKpis {
  strategy_name: string
  revenue_cagr_target: number
  cagr_period: string
  ebitda_positive_target: string
  customer_accounts_fy2025: number
  channel_mix_fy2025: Record<string, number>
  customers_by_channel_fy2025: Record<string, number>
  geography_fy2025: Record<string, number>
  acv_by_product: Record<string, number>
  shares_in_issue: number
  listing_price_eur: number
  h1fy2026_deals: {
    count: number
    closed_value: number
    open_pipeline: number
  }
}

export interface CorporateEvent {
  date: string
  doc: string
  type: string
  event: string
}
