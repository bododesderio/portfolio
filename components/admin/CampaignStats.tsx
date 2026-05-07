'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { ChevronDown, ChevronUp, Send, MailOpen, MousePointerClick, AlertTriangle, Mail } from 'lucide-react'

interface Campaign {
  id: string
  subject: string
  status: string
  sentAt: string | null
  recipientCount: number
  deliveredCount: number
  openCount: number
  clickCount: number
  bounceCount: number
}

interface EmailLog {
  id: string
  to: string
  status: string
  openedAt: string | null
  clickedAt: string | null
  bouncedAt: string | null
  deliveredAt: string | null
  failReason: string | null
  sentAt: string
  _count: { events: number }
}

function RateBar({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs text-fg-muted w-10 text-right">{pct}%</span>
    </div>
  )
}

export function CampaignStats({ campaigns }: { campaigns: Campaign[] }) {
  const [expanded, setExpanded] = useState<string | null>(null)
  const [logs, setLogs] = useState<Record<string, EmailLog[]>>({})
  const [loading, setLoading] = useState<string | null>(null)

  async function toggleExpand(id: string) {
    if (expanded === id) {
      setExpanded(null)
      return
    }
    setExpanded(id)
    if (!logs[id]) {
      setLoading(id)
      try {
        const res = await fetch(`/api/admin/email-logs?campaignId=${id}&limit=100`)
        if (res.ok) {
          const data = await res.json()
          setLogs(prev => ({ ...prev, [id]: data.logs }))
        }
      } catch { /* ignore */ }
      setLoading(null)
    }
  }

  if (campaigns.length === 0) return null

  return (
    <div className="mt-8 bg-card rounded-2xl border border-hairline p-6">
      <h2 className="font-serif text-xl text-fg mb-6">Campaign Performance</h2>
      <div className="space-y-4">
        {campaigns.map(c => {
          const isOpen = expanded === c.id
          return (
            <div key={c.id} className="border border-hairline rounded-xl overflow-hidden">
              {/* Campaign header */}
              <button
                type="button"
                onClick={() => toggleExpand(c.id)}
                className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors text-left"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-fg text-sm truncate">{c.subject}</p>
                  <p className="text-xs text-fg-muted mt-0.5">
                    {c.sentAt ? format(new Date(c.sentAt), 'MMM d, yyyy · h:mm a') : 'Draft'}
                  </p>
                </div>

                {/* Compact stats */}
                <div className="flex items-center gap-4 mr-3">
                  <Stat icon={Send} value={c.recipientCount} label="sent" />
                  <Stat icon={Mail} value={c.deliveredCount} label="delivered" color="text-emerald-500" />
                  <Stat icon={MailOpen} value={c.openCount} label="opened" color="text-brand" />
                  <Stat icon={MousePointerClick} value={c.clickCount} label="clicked" color="text-violet-500" />
                  {c.bounceCount > 0 && <Stat icon={AlertTriangle} value={c.bounceCount} label="bounced" color="text-red-500" />}
                </div>

                {isOpen ? <ChevronUp className="h-4 w-4 text-fg-muted" /> : <ChevronDown className="h-4 w-4 text-fg-muted" />}
              </button>

              {/* Expanded detail */}
              {isOpen && (
                <div className="border-t border-hairline p-4 bg-muted/30">
                  {/* Rate bars */}
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div>
                      <p className="text-xs text-fg-muted mb-1">Open Rate</p>
                      <RateBar value={c.openCount} max={c.recipientCount} color="bg-brand" />
                    </div>
                    <div>
                      <p className="text-xs text-fg-muted mb-1">Click Rate</p>
                      <RateBar value={c.clickCount} max={c.openCount || 1} color="bg-violet-500" />
                    </div>
                    <div>
                      <p className="text-xs text-fg-muted mb-1">Bounce Rate</p>
                      <RateBar value={c.bounceCount} max={c.recipientCount} color="bg-red-500" />
                    </div>
                  </div>

                  {/* Per-recipient table */}
                  {loading === c.id ? (
                    <p className="text-sm text-fg-muted">Loading recipients...</p>
                  ) : logs[c.id] && logs[c.id].length > 0 ? (
                    <div className="max-h-64 overflow-y-auto">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="text-fg-muted border-b border-hairline">
                            <th className="text-left py-2 font-medium">Recipient</th>
                            <th className="text-left py-2 font-medium">Status</th>
                            <th className="text-left py-2 font-medium">Opened</th>
                            <th className="text-left py-2 font-medium">Clicked</th>
                            <th className="text-right py-2 font-medium">Events</th>
                          </tr>
                        </thead>
                        <tbody>
                          {logs[c.id].map(log => (
                            <tr key={log.id} className="border-b border-hairline last:border-0">
                              <td className="py-2 text-fg">{log.to}</td>
                              <td className="py-2">
                                <StatusBadge status={log.status} />
                              </td>
                              <td className="py-2 text-fg-muted">
                                {log.openedAt ? format(new Date(log.openedAt), 'MMM d, h:mm a') : '—'}
                              </td>
                              <td className="py-2 text-fg-muted">
                                {log.clickedAt ? format(new Date(log.clickedAt), 'MMM d, h:mm a') : '—'}
                              </td>
                              <td className="py-2 text-right text-fg-muted">{log._count.events}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-sm text-fg-muted">No tracking data yet.</p>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

function Stat({ icon: Icon, value, label, color = 'text-fg-muted' }: { icon: typeof Send; value: number; label: string; color?: string }) {
  return (
    <div className="flex items-center gap-1.5" title={label}>
      <Icon className={`h-3.5 w-3.5 ${color}`} />
      <span className="text-sm font-medium text-fg">{value}</span>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    delivered: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    sent: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    bounced: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    failed: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  }
  return (
    <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${styles[status] || 'bg-muted text-fg-muted'}`}>
      {status}
    </span>
  )
}
