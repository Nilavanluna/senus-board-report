import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { Card } from '../../components/Card'
import { findMetric } from '../../lib/metrics'
import { chartChrome, chartColor } from '../../lib/chartColors'
import { numericFontFamily } from '../../lib/tokens'
import { formatEUR } from '../../lib/format'
import type { MetricResult } from '../../api/types'

interface Step {
  name: string
  delta: number
  isTotal?: boolean
}

interface Row {
  name: string
  base: number
  range: number
  end: number
  delta: number
  isTotal: boolean
}

export function FcfBridgeChart({ metrics }: { metrics: MetricResult[] }) {
  const fcf = findMetric(metrics, 'fcf', 'H1FY2026')

  if (!fcf || fcf.value === null) {
    return (
      <Card title="EBITDA → FCF bridge">
        <p className="text-sm text-zinc-500">FCF bridge unavailable.</p>
      </Card>
    )
  }

  const ebitda = fcf.inputs.ebitda ?? 0
  const workingCapital = fcf.inputs.working_capital ?? 0
  const interest = fcf.inputs.interest ?? 0
  const capex = fcf.inputs.capex ?? 0

  const steps: Step[] = [
    { name: 'EBITDA', delta: ebitda, isTotal: true },
    { name: 'Working capital', delta: workingCapital },
    { name: 'Interest', delta: interest },
    { name: 'Capex', delta: capex },
    { name: 'FCF', delta: fcf.value, isTotal: true },
  ]

  let running = 0
  const rows: Row[] = steps.map((s) => {
    const start = s.isTotal ? 0 : running
    const end = s.isTotal ? s.delta : running + s.delta
    running = end
    return {
      name: s.name,
      base: Math.min(start, end),
      range: Math.abs(end - start),
      end,
      delta: s.delta,
      isTotal: !!s.isTotal,
    }
  })

  const colorFor = (row: Row) => {
    if (row.isTotal) return chartColor.primary
    return row.delta >= 0 ? chartColor.positive : chartColor.negative
  }

  return (
    <Card
      title="EBITDA → FCF bridge"
      subtitle={`H1 FY2026 · ${fcf.formula}`}
    >
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={rows} margin={{ top: 24, right: 16, left: 8, bottom: 0 }} barCategoryGap="28%">
          <CartesianGrid vertical={false} stroke={chartChrome.grid} />
          <XAxis
            dataKey="name"
            tick={{ fill: chartChrome.mutedText, fontSize: 12 }}
            axisLine={{ stroke: chartChrome.axis }}
            tickLine={false}
          />
          <YAxis
            tickFormatter={(v: any) => formatEUR(v, true)}
            tick={{ fill: chartChrome.mutedText, fontSize: 12, fontFamily: numericFontFamily }}
            axisLine={false}
            tickLine={false}
            width={72}
          />
          <ReferenceLine y={0} stroke={chartChrome.axis} />
          <Tooltip
            cursor={{ fill: 'rgba(255,255,255,0.04)' }}
            contentStyle={{ background: '#18181b', border: '1px solid #27272a', borderRadius: 8, fontSize: 12 }}
            labelStyle={{ color: chartChrome.primaryText }}
            formatter={(_v: unknown, _k: unknown, ctx: any) => [
              formatEUR(ctx.payload.delta),
              ctx.payload.isTotal ? 'Total' : 'Change',
            ]}
          />
          <Bar dataKey="base" stackId="bridge" fill="transparent" isAnimationActive={false} />
          <Bar dataKey="range" stackId="bridge" radius={[4, 4, 4, 4]} isAnimationActive={false}>
            {rows.map((row, i) => (
              <Cell key={i} fill={colorFor(row)} />
            ))}
            <LabelList
              dataKey="delta"
              position="top"
              formatter={(v: any) => formatEUR(v, true)}
              style={{ fill: chartChrome.secondaryText, fontSize: 11, fontFamily: numericFontFamily }}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </Card>
  )
}
