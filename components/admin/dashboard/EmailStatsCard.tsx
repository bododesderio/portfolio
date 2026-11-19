interface EmailStats {
  sent: number
  delivered: number
  opened: number
  clicked: number
  bounced: number
  openRate: number
  clickRate: number
  bounceRate: number
}

export function EmailStatsCard({ stats, period }: { stats: EmailStats; period: string }) {
  const metrics = [
    { label: 'Sent', value: stats.sent },
    { label: 'Delivered', value: stats.delivered },
    { label: 'Opened', value: stats.opened, note: `${stats.openRate}% of sent` },
    { label: 'Clicked', value: stats.clicked, note: `${stats.clickRate}% of opened` },
    { label: 'Bounced', value: stats.bounced, note: `${stats.bounceRate}% of sent` },
  ]
  return (
    <section className="admin-panel">
      <div className="admin-panel-heading">
        <h2>Email delivery</h2>
        <span className="admin-muted">{period}</span>
      </div>
      {stats.sent === 0 ? (
        <p className="admin-empty">No emails were sent in this period.</p>
      ) : (
        <dl className="admin-email-stats">
          {metrics.map((metric) => (
            <div key={metric.label}>
              <dt>{metric.label}</dt>
              <dd>
                {metric.value.toLocaleString()}
                {metric.note && <small>{metric.note}</small>}
              </dd>
            </div>
          ))}
        </dl>
      )}
      <p className="admin-panel-note">
        Delivered and bounced depend on the mail server reporting back. If those stay at zero while emails are sent, delivery
        reports are not connected.
      </p>
    </section>
  )
}
