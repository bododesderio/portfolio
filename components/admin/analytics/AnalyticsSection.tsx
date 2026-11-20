import { Download, Info, Minus, TrendingDown, TrendingUp } from 'lucide-react'
import { EmailStatsCard } from '@/components/admin/dashboard/EmailStatsCard'
import { SeriesChart } from '@/components/admin/analytics/SeriesChart'
import { RangePicker } from '@/components/admin/analytics/RangePicker'
import { RefreshButton } from '@/components/admin/analytics/RefreshButton'
import { getSiteAnalytics } from '@/lib/data/site-analytics'
import { globalEmailStats } from '@/lib/domain/email-tracking'
import { percentChange, type AnalyticsRange } from '@/lib/domain/analytics-range'


const SERIES_1 = 'var(--viz-series-1)'
const SERIES_2 = 'var(--viz-series-2)'

function ownHost() {
  try {
    return new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://bododesderio.com').hostname.replace(/^www\./, '')
  } catch {
    return null
  }
}

function queryFor(range: AnalyticsRange) {
  const params = new URLSearchParams()
  if (range.preset === 'custom') {
    const day = (date: Date) => new Date(date.getTime() + 3 * 3600_000).toISOString().slice(0, 10)
    params.set('range', 'custom')
    params.set('from', day(range.from))
    params.set('to', day(range.to))
  } else params.set('range', range.preset)
  return params
}

function Stat({
  label,
  value,
  current,
  previous,
  explain,
}: {
  label: string
  value: string
  current?: number
  previous?: number
  explain: string
}) {
  const change = current !== undefined && previous !== undefined ? percentChange(current, previous) : undefined
  const Icon = change === undefined || change === null || change === 0 ? Minus : change > 0 ? TrendingUp : TrendingDown
  return (
    <div className="admin-kpi">
      <p className="admin-kpi-label">{label}</p>
      <p className="admin-kpi-value">{value}</p>
      {change !== undefined && (
        <p className="admin-kpi-change" data-direction={change === null ? 'new' : change > 0 ? 'up' : change < 0 ? 'down' : 'flat'}>
          <Icon size={13} aria-hidden="true" />
          {change === null
            ? `New this period (none before)`
            : change === 0
              ? 'Same as the previous period'
              : `${change > 0 ? '+' : ''}${change}% on the previous period`}
        </p>
      )}
      <p className="admin-kpi-explain">
        <Info size={12} aria-hidden="true" />
        {explain}
      </p>
    </div>
  )
}

function BarList({
  title,
  rows,
  unit,
  empty,
  csv,
}: {
  title: string
  rows: Array<{ label: string; value: number }>
  unit: string
  empty: string
  csv?: string
}) {
  const max = Math.max(1, ...rows.map((row) => row.value))
  return (
    <section className="admin-panel">
      <div className="admin-panel-heading">
        <h2>{title}</h2>
        {csv && rows.length > 0 && (
          <a href={csv} className="admin-csv-link" download>
            <Download size={13} aria-hidden="true" />
            CSV
          </a>
        )}
      </div>
      {rows.length === 0 ? (
        <p className="admin-empty">{empty}</p>
      ) : (
        <ol className="admin-bar-list">
          {rows.map((row) => (
            <li key={row.label}>
              <span className="admin-bar-fill" style={{ width: `${(row.value / max) * 100}%` }} aria-hidden="true" />
              <span className="admin-bar-label" title={row.label}>
                {row.label}
              </span>
              <span className="admin-bar-value">
                {row.value.toLocaleString()}
                <span className="sr-only"> {unit}</span>
              </span>
            </li>
          ))}
        </ol>
      )}
    </section>
  )
}

/** Site analytics for the chosen range; rendered on the admin Overview page. */
export async function AnalyticsSection({ range }: { range: AnalyticsRange }) {
  const [data, emailStats] = await Promise.all([
    getSiteAnalytics(range, ownHost()),
    globalEmailStats(Math.max(1, range.days)),
  ])
  const { current, previous } = data.totals
  const perVisitor = (views: number, visitors: number) => (visitors ? views / visitors : 0)
  const query = queryFor(range)
  const csv = (kind: string) => `/api/admin/analytics/export?${query}&kind=${kind}`
  const visitors = data.funnel[0].count

  return (
    <section id="analytics" className="admin-analytics-section" aria-labelledby="analytics-heading">
      <div className="admin-panel-heading admin-analytics-heading">
        <div>
          <h2 id="analytics-heading">Site analytics</h2>
          <p className="admin-muted">
            How people find and read the site. Visits are only recorded for visitors who accept cookies and do not send
            Do Not Track, so treat these as a floor, not a total.
          </p>
        </div>
        <div className="admin-analytics-actions">
          <RefreshButton />
          <a href={csv('traffic')} className="admin-secondary-button" download>
            <Download size={14} aria-hidden="true" />
            Export CSV
          </a>
        </div>
      </div>
      <RangePicker range={range} />
      <p className="admin-range-note">
        {range.label}, in Kampala time, compared with the {range.days} days before.
      </p>

      <div className="admin-kpi-grid">
        <Stat
          label="Visitors"
          value={current.visitors.toLocaleString()}
          current={current.visitors}
          previous={previous.visitors}
          explain="Distinct browsers. One person on a phone and a laptop counts twice."
        />
        <Stat
          label="Page views"
          value={current.views.toLocaleString()}
          current={current.views}
          previous={previous.views}
          explain="Every page opened, including repeat visits to the same page."
        />
        <Stat
          label="Pages per visitor"
          value={perVisitor(current.views, current.visitors).toFixed(1)}
          current={Math.round(perVisitor(current.views, current.visitors) * 10)}
          previous={Math.round(perVisitor(previous.views, previous.visitors) * 10)}
          explain="How far people read once they arrive."
        />
        <Stat
          label="Messages"
          value={current.messages.toLocaleString()}
          current={current.messages}
          previous={previous.messages}
          explain="Sent through the contact form, whether or not the sender accepted cookies."
        />
        <Stat
          label="New subscribers"
          value={current.subscribers.toLocaleString()}
          current={current.subscribers}
          previous={previous.subscribers}
          explain="People who confirmed their newsletter subscription by email."
        />
        <Stat
          label="Email open rate"
          value={`${emailStats.openRate}%`}
          explain={`${emailStats.opened.toLocaleString()} of ${emailStats.sent.toLocaleString()} emails sent in this period were opened.`}
        />
      </div>

      <section className="admin-panel admin-chart-panel">
        <div className="admin-panel-heading">
          <h2>Traffic</h2>
          <a href={csv('traffic')} className="admin-csv-link" download>
            <Download size={13} aria-hidden="true" />
            CSV
          </a>
        </div>
        <SeriesChart
          kind="line"
          granularity={range.granularity}
          label={`Page views and visitors per ${range.granularity}, ${range.label}`}
          data={data.traffic}
          series={[
            { key: 'views', label: 'Page views', color: SERIES_1 },
            { key: 'visitors', label: 'Visitors', color: SERIES_2 },
          ]}
        />
        <details className="admin-chart-table">
          <summary>Show as a table</summary>
          <div className="admin-table-scroll">
            <table className="admin-audit-table">
              <thead>
                <tr>
                  <th scope="col">{range.granularity === 'day' ? 'Day' : range.granularity === 'week' ? 'Week starting' : 'Month'}</th>
                  <th scope="col">Page views</th>
                  <th scope="col">Visitors</th>
                </tr>
              </thead>
              <tbody>
                {data.traffic.map((row) => (
                  <tr key={row.bucket}>
                    <th scope="row">{row.bucket}</th>
                    <td>{row.views}</td>
                    <td>{row.visitors}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </details>
      </section>

      <section className="admin-panel admin-funnel-panel">
        <div className="admin-panel-heading">
          <h2>From visit to conversation</h2>
        </div>
        {visitors === 0 ? (
          <p className="admin-empty">No recorded visits in this range yet.</p>
        ) : (
          <ol className="admin-funnel">
            {data.funnel.map((step) => {
              const share = Math.min(100, Math.round((step.count / visitors) * 100))
              return (
                <li key={step.label}>
                  <span className="admin-funnel-label">{step.label}</span>
                  <span className="admin-funnel-track" aria-hidden="true">
                    <span style={{ width: `${Math.max(share, step.count ? 2 : 0)}%` }} />
                  </span>
                  <span className="admin-funnel-value">
                    {step.count.toLocaleString()} <small>{share}%</small>
                  </span>
                </li>
              )
            })}
          </ol>
        )}
        <p className="admin-panel-note">
          Each step counts visitors who opened that kind of page at least once. Messages include senders who declined cookies, so that step can run higher than the one before it.
        </p>
      </section>

      <div className="admin-analytics-grid">
        <BarList
          title="Where people read"
          unit="page views"
          rows={data.sections.map((row) => ({ label: row.label, value: row.views }))}
          empty="No page views in this range."
        />
        <BarList
          title="Most viewed pages"
          unit="page views"
          rows={data.pages.map((row) => ({ label: row.label, value: row.views }))}
          empty="No page views in this range."
          csv={csv('pages')}
        />
        <BarList
          title="Writing"
          unit="page views"
          rows={data.writing.map((row) => ({ label: row.label, value: row.views }))}
          empty="No one opened an article in this range."
        />
        <BarList
          title="Work"
          unit="page views"
          rows={data.work.map((row) => ({ label: row.label, value: row.views }))}
          empty="No one opened a project page in this range."
        />
        <BarList
          title="Where visitors came from"
          unit="visitors"
          rows={data.referrers.map((row) => ({ label: row.label, value: row.visitors }))}
          empty="No visits with a referring site in this range."
          csv={csv('referrers')}
        />
        <BarList
          title="Countries"
          unit="visitors"
          rows={data.countries.map((row) => ({ label: row.label, value: row.visitors }))}
          empty="No visits in this range."
        />
      </div>

      <div className="admin-analytics-grid admin-analytics-grid-wide">
        <section className="admin-panel admin-chart-panel">
          <div className="admin-panel-heading">
            <h2>Messages and subscribers</h2>
            <a href={csv('audience')} className="admin-csv-link" download>
              <Download size={13} aria-hidden="true" />
              CSV
            </a>
          </div>
          <SeriesChart
            kind="bar"
            granularity={range.granularity}
            label={`Messages and new subscribers per ${range.granularity}, ${range.label}`}
            data={data.audience}
            series={[
              { key: 'messages', label: 'Messages', color: SERIES_1 },
              { key: 'subscribers', label: 'New subscribers', color: SERIES_2 },
            ]}
          />
        </section>
        <EmailStatsCard stats={emailStats} period={range.label} />
      </div>
    </section>
  )
}
