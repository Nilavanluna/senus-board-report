import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Card } from '../../components/Card'
import { findMetric, factsIndex, getFact } from '../../lib/metrics'
import { chartChrome, chartColor } from '../../lib/chartColors'
import { formatPercent } from '../../lib/format'
import type { FinancialFact, MetricResult } from '../../api/types'

interface EndLabelProps {
  x?: number
  y?: number
  index?: number
  value?: number | null
}

export function MarginTrendChart({
  metrics,
  facts,
}: {
  metrics: MetricResult[]
  facts: FinancialFact[]
}) {
  const idx = factsIndex(facts)
  const fy24Rev = getFact(idx, 'FY2024', 'revenue')
  const fy24Gp = getFact(idx, 'FY2024', 'gross_profit')
  const fy24Margin = fy24Rev && fy24Gp !== null ? (fy24Gp / fy24Rev) * 100 : null

  const fy25 = findMetric(metrics, 'gross_margin', 'FY2025')
  const h1 = findMetric(metrics, 'gross_margin', 'H1FY2026')

  const data = [
    { period: 'FY2024', margin: fy24Margin },
    { period: 'FY2025', margin: fy25?.value ?? null },
    { period: 'H1 FY2026', margin: h1?.value ?? null },
  ]

  const lastIndex = data.length - 1
  const renderEndLabel = (props: EndLabelProps) => {
    const { x, y, index, value } = props
    if (index !== lastIndex || value == null || x === undefined || y === undefined) return <g />
    return (
      <text x={x} y={y - 12} textAnchor="middle" fill={chartChrome.primaryText} fontSize={12} fontWeight={600}>
        {formatPercent(value)}
      </text>
    )
  }

  return (
    <Card title="Gross margin trend" subtitle="FY2024 → FY2025 → H1 FY2026">
      <ResponsiveContainer width="100%" height={240}>
        <LineChart data={data} margin={{ top: 20, right: 24, left: 8, bottom: 0 }}>
          <CartesianGrid vertical={false} stroke={chartChrome.grid} />
          <XAxis
            dataKey="period"
            tick={{ fill: chartChrome.mutedText, fontSize: 12 }}
            axisLine={{ stroke: chartChrome.axis }}
            tickLine={false}
          />
          <YAxis
            domain={[0, 100]}
            tickFormatter={(v: any) => `${v}%`}
            tick={{ fill: chartChrome.mutedText, fontSize: 12 }}
            axisLine={false}
            tickLine={false}
            width={40}
          />
          <Tooltip
            contentStyle={{ background: '#18181b', border: '1px solid #27272a', borderRadius: 8, fontSize: 12 }}
            labelStyle={{ color: chartChrome.primaryText }}
            formatter={(v: any) => [formatPercent(v), 'Gross margin']}
          />
          <Line
            type="monotone"
            dataKey="margin"
            stroke={chartColor.primary}
            strokeWidth={2}
            dot={{ r: 4, fill: chartColor.primary, stroke: '#09090b', strokeWidth: 2 }}
            activeDot={{ r: 5 }}
            label={renderEndLabel as any}
            connectNulls
          />
        </LineChart>
      </ResponsiveContainer>
    </Card>
  )
}
