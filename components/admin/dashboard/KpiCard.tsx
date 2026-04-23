import Link from 'next/link'
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react'
import { Sparkline } from './Sparkline'

export function KpiCard({
  label,
  value,
  delta,
  series,
  href,
  icon: Icon,
  tone = 'brand',
}: {
  label: string
  value: number | string
  delta?: number
  series?: number[]
  href?: string
  icon?: React.ElementType
  tone?: 'brand' | 'emerald' | 'sky' | 'amber' | 'violet' | 'rose'
}) {
  const content = (
    <div className="group relative rounded-2xl border border-hairline bg-card p-5 transition-colors hover:border-brand/40">
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs uppercase tracking-widest text-fg-muted">{label}</p>
        {Icon && <Icon className={`h-4 w-4 ${toneColor(tone)}`} />}
      </div>
      <div className="flex items-end justify-between gap-2">
        <p className="font-serif text-3xl tabular text-fg">{value}</p>
        {series && (
          <div className={`${toneColor(tone)} opacity-80`}>
            <Sparkline values={series} />
          </div>
        )}
      </div>
      {delta !== undefined && (
        <div className="mt-3">
          <DeltaChip value={delta} />
        </div>
      )}
    </div>
  )

  if (href) {
    return (
      <Link href={href} className="block">
        {content}
      </Link>
    )
  }
  return content
}

function toneColor(tone: string): string {
  switch (tone) {
    case 'emerald': return 'text-emerald-500 dark:text-emerald-400'
    case 'sky':     return 'text-sky-500 dark:text-sky-400'
    case 'amber':   return 'text-amber-500 dark:text-amber-400'
    case 'violet':  return 'text-violet-500 dark:text-violet-400'
    case 'rose':    return 'text-rose-500 dark:text-rose-400'
    case 'brand':
    default:        return 'text-brand'
  }
}

function DeltaChip({ value }: { value: number }) {
  if (value === 0) {
    return (
      <span className="inline-flex items-center gap-1 text-[11px] text-fg-muted">
        <Minus className="h-3 w-3" /> no change vs last period
      </span>
    )
  }
  const up = value > 0
  const color = up ? 'text-emerald-500 dark:text-emerald-400' : 'text-rose-500 dark:text-rose-400'
  const Icon = up ? ArrowUpRight : ArrowDownRight
  return (
    <span className={`inline-flex items-center gap-1 text-[11px] font-medium ${color}`}>
      <Icon className="h-3 w-3" />
      {Math.abs(value)}% <span className="text-fg-muted font-normal">vs prev</span>
    </span>
  )
}
