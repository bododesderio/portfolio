import { prisma } from '@/lib/db'
import { format } from 'date-fns'
import { NewsletterCompose } from '@/components/admin/NewsletterCompose'
import { CampaignStats } from '@/components/admin/CampaignStats'
import { EmailStatsCard } from '@/components/admin/dashboard/EmailStatsCard'
import { Pagination } from '@/components/admin/Pagination'
import { globalEmailStats } from '@/lib/email-tracking'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Newsletter — Admin' }
export const dynamic = 'force-dynamic'

interface Props {
  searchParams: Promise<{ page?: string }>
}

export default async function NewsletterPage({ searchParams }: Props) {
  const params = await searchParams
  const page = Math.max(1, parseInt(params.page || '1', 10))
  const pageSize = 20
  const skip = (page - 1) * pageSize

  const [subscribers, totalSubscribers, campaigns, emailStats] = await Promise.all([
    prisma.subscriber.findMany({
      orderBy: { subscribedAt: 'desc' },
      skip,
      take: pageSize,
    }),
    prisma.subscriber.count(),
    prisma.newsletterCampaign.findMany({ orderBy: { createdAt: 'desc' }, take: 20 }),
    globalEmailStats(30),
  ])

  const totalPages = Math.ceil(totalSubscribers / pageSize)

  const campaignsForClient = campaigns.map(c => ({
    id: c.id,
    subject: c.subject,
    status: c.status,
    sentAt: c.sentAt?.toISOString() ?? null,
    recipientCount: c.recipientCount,
    deliveredCount: c.deliveredCount,
    openCount: c.openCount,
    clickCount: c.clickCount,
    bounceCount: c.bounceCount,
  }))

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-serif text-3xl text-fg">Newsletter</h1>
        <p className="text-sm text-fg-muted mt-1">{totalSubscribers} subscriber{totalSubscribers === 1 ? '' : 's'} · {campaigns.length} campaign{campaigns.length === 1 ? '' : 's'} sent</p>
      </div>

      {/* Email performance overview */}
      <div className="mb-8">
        <EmailStatsCard stats={emailStats} />
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Subscribers */}
        <div className="bg-card rounded-2xl border border-hairline p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-serif text-xl text-fg">
              Subscribers <span className="text-brand ml-2">{totalSubscribers}</span>
            </h2>
          </div>
          <div className="space-y-3">
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
          <Pagination currentPage={page} totalPages={totalPages} basePath="/admin/newsletter" />
        </div>

        {/* Compose */}
        <NewsletterCompose />
      </div>

      {/* Campaign performance with expandable per-recipient tracking */}
      <CampaignStats campaigns={campaignsForClient} />
    </div>
  )
}
