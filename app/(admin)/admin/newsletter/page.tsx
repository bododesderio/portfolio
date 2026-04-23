import { prisma } from '@/lib/db'
import { format } from 'date-fns'
import { NewsletterCompose } from '@/components/admin/NewsletterCompose'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Newsletter — Admin' }

export default async function NewsletterPage() {
  const [subscribers, campaigns] = await Promise.all([
    prisma.subscriber.findMany({ orderBy: { subscribedAt: 'desc' } }),
    prisma.newsletterCampaign.findMany({ orderBy: { createdAt: 'desc' }, take: 10 }),
  ])

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-serif text-3xl text-fg">Newsletter</h1>
        <p className="text-sm text-fg-muted mt-1">{subscribers.length} subscriber{subscribers.length === 1 ? '' : 's'} · {campaigns.length} campaign{campaigns.length === 1 ? '' : 's'} sent</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Subscribers */}
        <div className="bg-card rounded-2xl border border-hairline p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-serif text-xl text-fg">
              Subscribers <span className="text-brand ml-2">{subscribers.length}</span>
            </h2>
          </div>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {subscribers.map(sub => (
              <div key={sub.id} className="flex items-center justify-between py-2 border-b border-hairline last:border-0">
                <div>
                  <p className="text-sm font-medium text-fg">{sub.email}</p>
                  {sub.name && <p className="text-xs text-ink-500">{sub.name}</p>}
                </div>
                <span className="text-xs text-ink-400">
                  {format(new Date(sub.subscribedAt), 'MMM d, yyyy')}
                </span>
              </div>
            ))}
            {subscribers.length === 0 && <p className="text-ink-500 text-sm">No subscribers yet.</p>}
          </div>
        </div>

        {/* Compose */}
        <NewsletterCompose />
      </div>

      {/* Past campaigns */}
      {campaigns.length > 0 && (
        <div className="mt-8 bg-card rounded-2xl border border-hairline p-6">
          <h2 className="font-serif text-xl text-fg mb-6">Past Campaigns</h2>
          <div className="space-y-3">
            {campaigns.map(c => (
              <div key={c.id} className="flex items-center justify-between py-3 border-b border-hairline last:border-0">
                <p className="font-medium text-fg text-sm">{c.subject}</p>
                <div className="flex items-center gap-4 text-xs text-ink-500">
                  <span>{c.recipientCount} recipients</span>
                  <span className={`px-2 py-1 rounded-full ${c.status === 'sent' ? 'bg-green-100 text-green-700' : 'bg-muted text-fg-muted'}`}>
                    {c.status}
                  </span>
                  {c.sentAt && <span>{format(new Date(c.sentAt), 'MMM d, yyyy')}</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
