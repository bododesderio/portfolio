import { prisma } from '@/lib/db'
import { format } from 'date-fns'
import { MessageActions } from '@/components/admin/MessageActions'
import { AdminPageHeader } from '@/components/admin/AdminPageHeader'
import { Mail, MailOpen } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Messages — Admin' }
export const dynamic = 'force-dynamic'

export default async function MessagesPage() {
  const [messages, archivedCount] = await Promise.all([
    prisma.message.findMany({
      where: { archived: false },
      orderBy: { receivedAt: 'desc' },
    }),
    prisma.message.count({ where: { archived: true } }),
  ])

  const unread = messages.filter(m => !m.read).length

  return (
    <div>
      <AdminPageHeader
        title="Messages"
        description={`${messages.length} message${messages.length === 1 ? '' : 's'} · ${unread} unread · ${archivedCount} archived`}
      />

      <div className="grid lg:grid-cols-[1fr_1.5fr] gap-6">
        {/* Left — message list */}
        <div className="space-y-2 lg:max-h-[calc(100vh-200px)] lg:overflow-y-auto lg:pr-2">
          {messages.length === 0 && (
            <div className="rounded-2xl border border-hairline bg-card p-12 text-center">
              <Mail className="h-8 w-8 text-fg-muted mx-auto mb-3" />
              <p className="text-fg-muted">No messages yet.</p>
            </div>
          )}
          {messages.map(msg => (
            <a
              key={msg.id}
              href={`#msg-${msg.id}`}
              className={`block rounded-xl border p-4 transition-colors hover:border-brand/40 ${
                msg.read ? 'border-hairline bg-card' : 'border-brand/30 bg-brand/5'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                {!msg.read ? (
                  <Mail className="h-3.5 w-3.5 text-brand flex-shrink-0" />
                ) : (
                  <MailOpen className="h-3.5 w-3.5 text-fg-muted flex-shrink-0" />
                )}
                <span className="text-sm font-medium text-fg truncate">{msg.name}</span>
                <span className="text-[11px] text-fg-muted ml-auto flex-shrink-0">
                  {format(new Date(msg.receivedAt), 'MMM d')}
                </span>
              </div>
              <p className="text-sm text-fg-muted truncate">{msg.subject}</p>
              <p className="text-xs text-fg-muted/70 truncate mt-0.5">{msg.body.slice(0, 80)}...</p>
            </a>
          ))}
        </div>

        {/* Right — message details */}
        <div className="space-y-4">
          {messages.length === 0 ? (
            <div className="rounded-2xl border border-hairline bg-card p-12 text-center">
              <p className="text-fg-muted">Select a message to view details.</p>
            </div>
          ) : (
            messages.map(msg => (
              <div
                key={msg.id}
                id={`msg-${msg.id}`}
                className={`bg-card rounded-2xl border p-6 ${
                  msg.read ? 'border-hairline' : 'border-brand/40'
                }`}
              >
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      {!msg.read && <span className="w-2 h-2 rounded-full bg-brand flex-shrink-0" />}
                      <p className="font-semibold text-fg">{msg.name}</p>
                    </div>
                    <p className="text-sm text-fg-muted">{msg.email}</p>
                  </div>
                  <div className="flex-shrink-0 text-right">
                    <p className="text-xs text-fg-muted mb-3">
                      {format(new Date(msg.receivedAt), 'MMM d, yyyy · HH:mm')}
                    </p>
                    <MessageActions id={msg.id} read={msg.read} email={msg.email} />
                  </div>
                </div>
                <h3 className="font-medium text-fg mb-3">{msg.subject}</h3>
                <p className="text-fg-muted text-sm leading-relaxed whitespace-pre-wrap">{msg.body}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
