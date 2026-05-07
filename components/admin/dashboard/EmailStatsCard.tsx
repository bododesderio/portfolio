'use client'

import { Mail, MailOpen, MousePointerClick, AlertTriangle, Send } from 'lucide-react'

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

export function EmailStatsCard({ stats }: { stats: EmailStats }) {
  const metrics = [
    { label: 'Sent',      value: stats.sent,      icon: Send,              color: 'text-blue-500' },
    { label: 'Delivered',  value: stats.delivered,  icon: Mail,              color: 'text-emerald-500' },
    { label: 'Opened',     value: stats.opened,     icon: MailOpen,          color: 'text-brand',       rate: stats.openRate },
    { label: 'Clicked',    value: stats.clicked,    icon: MousePointerClick, color: 'text-violet-500',  rate: stats.clickRate },
    { label: 'Bounced',    value: stats.bounced,    icon: AlertTriangle,     color: 'text-red-500',     rate: stats.bounceRate },
  ]

  return (
    <div className="bg-card rounded-2xl border border-hairline p-6">
      <h2 className="font-serif text-lg text-fg mb-4">Email Performance <span className="text-xs text-fg-muted font-sans ml-2">30 days</span></h2>
      <div className="grid grid-cols-5 gap-3">
        {metrics.map(m => (
          <div key={m.label} className="text-center">
            <m.icon className={`h-5 w-5 mx-auto mb-2 ${m.color}`} />
            <p className="text-xl font-semibold text-fg">{m.value}</p>
            <p className="text-xs text-fg-muted">{m.label}</p>
            {'rate' in m && m.rate !== undefined && (
              <p className={`text-xs mt-1 font-medium ${m.label === 'Bounced' && m.rate > 5 ? 'text-red-500' : 'text-fg-muted'}`}>
                {m.rate}%
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
