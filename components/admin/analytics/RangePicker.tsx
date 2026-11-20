import Link from 'next/link'
import { RANGE_PRESETS, type AnalyticsRange } from '@/lib/domain/analytics-range'

const kampalaDay = (date: Date) => new Date(date.getTime() + 3 * 3600_000).toISOString().slice(0, 10)

export function RangePicker({ range }: { range: AnalyticsRange }) {
  return (
    <div className="admin-range">
      <nav className="admin-filter-tabs" aria-label="Date range">
        {Object.entries(RANGE_PRESETS).map(([value, preset]) => (
          <Link
            key={value}
            href={value === '30d' ? '/admin#analytics' : `/admin?range=${value}#analytics`}
            aria-current={range.preset === value ? 'page' : undefined}
          >
            {preset.label}
          </Link>
        ))}
      </nav>
      <form action="/admin#analytics" method="get" className="admin-range-custom">
        <input type="hidden" name="range" value="custom" />
        <label>
          <span>From</span>
          <input type="date" name="from" required defaultValue={kampalaDay(range.from)} />
        </label>
        <label>
          <span>To</span>
          <input type="date" name="to" required defaultValue={kampalaDay(range.to)} />
        </label>
        <button type="submit" className="admin-secondary-button" aria-current={range.preset === 'custom' || undefined}>
          Apply
        </button>
      </form>
    </div>
  )
}
