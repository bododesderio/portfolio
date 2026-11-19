'use client'

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { Granularity } from '@/lib/domain/analytics-range'

type Series = { key: string; label: string; color: string }

function tickLabel(bucket: string, granularity: Granularity) {
  const date = new Date(`${bucket}T00:00:00Z`)
  return date.toLocaleDateString('en-GB', {
    timeZone: 'UTC',
    ...(granularity === 'month' ? { month: 'short', year: '2-digit' } : { day: 'numeric', month: 'short' }),
  })
}

const axis = {
  stroke: 'rgb(var(--ink-muted))',
  tick: { fontSize: 11, fill: 'rgb(var(--ink-muted))' },
  tickLine: false,
  axisLine: false,
} as const

const tooltipStyle = {
  contentStyle: {
    background: 'rgb(var(--card))',
    border: '1px solid rgb(var(--hairline) / 0.2)',
    borderRadius: 8,
    fontSize: 12,
    color: 'rgb(var(--ink))',
  },
  labelStyle: { color: 'rgb(var(--ink-muted))', fontSize: 11, marginBottom: 4 },
  itemStyle: { color: 'rgb(var(--ink))', padding: 0 },
}

/** One y-axis only: every series drawn together here shares the same unit (a count). */
export function SeriesChart({
  data,
  series,
  granularity,
  kind,
  label,
}: {
  data: Array<Record<string, string | number>>
  series: Series[]
  granularity: Granularity
  kind: 'line' | 'bar'
  label: string
}) {
  const common = {
    data,
    margin: { top: 8, right: 8, bottom: 0, left: -18 },
    accessibilityLayer: true,
  }
  const x = (
    <XAxis
      dataKey="bucket"
      {...axis}
      tickFormatter={(value: string) => tickLabel(value, granularity)}
      interval="preserveStartEnd"
      minTickGap={24}
    />
  )
  const y = <YAxis {...axis} allowDecimals={false} width={44} />
  const grid = <CartesianGrid stroke="rgb(var(--hairline) / 0.12)" vertical={false} />
  const tooltip = (
    <Tooltip
      {...tooltipStyle}
      labelFormatter={(value) => tickLabel(String(value), granularity)}
      cursor={kind === 'line' ? { stroke: 'rgb(var(--ink-muted))', strokeOpacity: 0.4 } : { fill: 'rgb(var(--muted) / 0.6)' }}
    />
  )
  const legend = (
    <Legend
      verticalAlign="top"
      align="left"
      height={28}
      iconType={kind === 'line' ? 'plainline' : 'square'}
      wrapperStyle={{ fontSize: 12, color: 'rgb(var(--ink))' }}
      formatter={(value) => <span style={{ color: 'rgb(var(--ink))' }}>{value}</span>}
    />
  )
  return (
    <div className="admin-chart" role="img" aria-label={label}>
      <ResponsiveContainer width="100%" height="100%">
        {kind === 'line' ? (
          <LineChart {...common}>
            {grid}
            {x}
            {y}
            {tooltip}
            {legend}
            {series.map((entry) => (
              <Line
                key={entry.key}
                type="monotone"
                dataKey={entry.key}
                name={entry.label}
                stroke={entry.color}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, strokeWidth: 2, stroke: 'rgb(var(--card))' }}
              />
            ))}
          </LineChart>
        ) : (
          <BarChart {...common} barGap={2} barCategoryGap="22%">
            {grid}
            {x}
            {y}
            {tooltip}
            {legend}
            {series.map((entry) => (
              <Bar
                key={entry.key}
                dataKey={entry.key}
                name={entry.label}
                fill={entry.color}
                radius={[4, 4, 0, 0]}
                maxBarSize={18}
              />
            ))}
          </BarChart>
        )}
      </ResponsiveContainer>
    </div>
  )
}
