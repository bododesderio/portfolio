'use client'

import { ResponsiveContainer, Line, XAxis, YAxis, Tooltip, CartesianGrid, Area, AreaChart } from 'recharts'

export function VisitsChartInner({ data }: { data: Array<{ date: string; count: number }> }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 8, right: 4, bottom: 0, left: -24 }}>
        <defs>
          <linearGradient id="brandFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgb(var(--brand))" stopOpacity={0.4} />
            <stop offset="100%" stopColor="rgb(var(--brand))" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="rgb(var(--hairline) / 0.3)"
          vertical={false}
        />
        <XAxis
          dataKey="date"
          stroke="rgb(var(--ink-muted))"
          tick={{ fontSize: 10 }}
          tickFormatter={s => s.slice(5)}
          tickLine={false}
          axisLine={false}
          interval="preserveStartEnd"
          minTickGap={20}
        />
        <YAxis
          stroke="rgb(var(--ink-muted))"
          tick={{ fontSize: 10 }}
          tickLine={false}
          axisLine={false}
          allowDecimals={false}
          width={32}
        />
        <Tooltip
          contentStyle={{
            background: 'rgb(var(--card))',
            border: '1px solid rgb(var(--hairline) / 0.2)',
            borderRadius: 8,
            fontSize: 12,
            color: 'rgb(var(--ink))',
          }}
          labelStyle={{ color: 'rgb(var(--ink-muted))', fontSize: 11 }}
          cursor={{ stroke: 'rgb(var(--brand))', strokeDasharray: '3 3', strokeOpacity: 0.5 }}
        />
        <Area
          type="monotone"
          dataKey="count"
          stroke="rgb(var(--brand))"
          strokeWidth={2}
          fill="url(#brandFill)"
          dot={false}
        />
        <Line type="monotone" dataKey="count" stroke="rgb(var(--brand))" strokeWidth={2} dot={false} />
      </AreaChart>
    </ResponsiveContainer>
  )
}
