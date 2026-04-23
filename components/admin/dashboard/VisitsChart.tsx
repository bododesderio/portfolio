'use client'

import dynamic from 'next/dynamic'
import { useState } from 'react'

// Dynamically import the heavy chart — keeps initial admin bundle tight.
const ReChart = dynamic(() => import('./VisitsChartInner').then(m => m.VisitsChartInner), {
  ssr: false,
  loading: () => (
    <div className="h-64 rounded-xl bg-muted/60 flex items-center justify-center text-fg-muted text-sm">
      Loading chart…
    </div>
  ),
})

export type VisitsChartRange = '7d' | '30d' | '90d'

export function VisitsChart({
  data7,
  data30,
  data90,
}: {
  data7: Array<{ date: string; count: number }>
  data30: Array<{ date: string; count: number }>
  data90: Array<{ date: string; count: number }>
}) {
  const [range, setRange] = useState<VisitsChartRange>('30d')
  const data = range === '7d' ? data7 : range === '30d' ? data30 : data90

  return (
    <div className="rounded-2xl border border-hairline bg-card p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="font-serif text-lg text-fg">Site Visits</h2>
          <p className="text-xs text-fg-muted">Last {range === '7d' ? '7 days' : range === '30d' ? '30 days' : '90 days'}</p>
        </div>
        <div className="inline-flex rounded-lg bg-muted p-0.5">
          {(['7d', '30d', '90d'] as const).map(r => (
            <button
              key={r}
              type="button"
              onClick={() => setRange(r)}
              className={`px-2.5 py-1 text-[11px] font-medium rounded-md transition-colors ${
                range === r ? 'bg-card text-fg shadow-sm' : 'text-fg-muted hover:text-fg'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      <div className="h-64">
        <ReChart data={data} />
      </div>
    </div>
  )
}
