import { Bar, BarChart, CartesianGrid, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Card } from '../../components/Card'
import { findMetric } from '../../lib/metrics'
import { chartChrome, chartColor } from '../../lib/chartColors'
import { formatEUR } from '../../lib/format'
import type { MetricResult } from '../../api/types'

export function RevenueChart({ metrics }: { metrics: MetricResult[] }) {
  const fyGrowth = findMetric(metrics, 'revenue_growth', 'FY2025')
  const h1Growth = findMetric(metrics, 'revenue_growth', 'H1FY2026')

  if (!fyGrowth || !h1Growth) {
    return (
      <Card title="Revenue by period">
        <p className="text-sm text-zinc-500">Revenue metrics unavailable.</p>
      </Card>
    )
  }

  const data = [
    { period: 'FY2024', revenue: fyGrowth.inputs.prior ?? 0 },
    { period: 'FY2025', revenue: fyGrowth.inputs.current ?? 0 },
    { period: 'H1 FY2025', revenue: h1Growth.inputs.prior ?? 0 },
    { period: 'H1 FY2026', revenue: h1Growth.inputs.current ?? 0 },
  ]

  return (
    <Card
      title="Revenue by period"
      subtitle="Annual periods vs. half-year comparison — H2 is structurally larger (soil-sampling seasonality)"
    >
      <ResponsiveContainer width="100%" height={240}>
        <BarChart data={data} margin={{ top: 20, right: 8, left: 8, bottom: 0 }} barCategoryGap="24%">
          <CartesianGrid vertical={false} stroke={chartChrome.grid} />
          <XAxis
            dataKey="period"
            tick={{ fill: chartChrome.mutedText, fontSize: 12 }}
            axisLine={{ stroke: chartChrome.axis }}
            tickLine={false}
          />
          <YAxis
            tickFormatter={(v: any) => formatEUR(v, true)}
            tick={{ fill: chartChrome.mutedText, fontSize: 12 }}
            axisLine={false}
            tickLine={false}
            width={64}
          />
          <Tooltip
            cursor={{ fill: 'rgba(255,255,255,0.04)' }}
            contentStyle={{ background: '#18181b', border: '1px solid #27272a', borderRadius: 8, fontSize: 12 }}
            labelStyle={{ color: chartChrome.primaryText }}
            formatter={(v: any) => [formatEUR(v), 'Revenue']}
          />
          <Bar dataKey="revenue" fill={chartColor.primary} radius={[4, 4, 0, 0]} maxBarSize={56}>
            <LabelList
              dataKey="revenue"
              position="top"
              formatter={(v: any) => formatEUR(v, true)}
              style={{ fill: chartChrome.secondaryText, fontSize: 11 }}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </Card>
  )
}
