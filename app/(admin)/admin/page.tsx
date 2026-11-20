import Link from 'next/link'
import type { Metadata } from 'next'
import {
  PenLine,
  Layers,
  MessageSquare,
  Mail,
  Plus,
  FileText,
  ChevronRight,
  ImagePlus,
  Send,
  Home,
  ExternalLink,
} from 'lucide-react'
import { prisma } from '@/lib/data/db'
import { AdminPageHeader } from '@/components/admin/AdminPageHeader'
import { AnalyticsSection } from '@/components/admin/analytics/AnalyticsSection'
import { parseRange } from '@/lib/domain/analytics-range'
export const metadata: Metadata = { title: 'Overview' }
export const dynamic = 'force-dynamic'
const date = (value: Date) =>
  value.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    timeZone: 'UTC',
  })
const QUICK_ACTIONS = [
  { label: 'Write a post', href: '/admin/blog/new', icon: Plus },
  { label: 'Add work', href: '/admin/projects/new', icon: Layers },
  { label: 'Upload photos', href: '/admin/gallery', icon: ImagePlus },
  { label: 'Send a newsletter', href: '/admin/newsletter', icon: Send },
  { label: 'Edit the home page', href: '/admin/content/home', icon: Home },
]

export default async function AdminDashboard({
  searchParams,
}: {
  searchParams: Promise<{ range?: string; from?: string; to?: string }>
}) {
  const range = parseRange(await searchParams)
  const [
    posts,
    projects,
    unread,
    subscribers,
    recentPosts,
    messages,
    recentWork,
  ] = await Promise.all([
    prisma.blogPost.count(),
    prisma.project.count(),
    prisma.message.count({ where: { read: false, archived: false } }),
    prisma.subscriber.count({ where: { confirmed: true } }),
    prisma.blogPost.findMany({
      orderBy: { updatedAt: 'desc' },
      take: 5,
      select: { id: true, title: true, status: true, updatedAt: true },
    }),
    prisma.message.findMany({
      where: { archived: false },
      orderBy: { receivedAt: 'desc' },
      take: 4,
      select: {
        id: true,
        name: true,
        subject: true,
        read: true,
        receivedAt: true,
      },
    }),
    prisma.project.findMany({
      orderBy: { updatedAt: 'desc' },
      take: 3,
      select: { id: true, title: true, visible: true, category: true },
    }),
  ])
  return (
    <div>
      <AdminPageHeader
        title="Overview"
        description="Site activity, drafts, unread messages and the pages that need updating, in one place."
        actions={
          <a href="/" target="_blank" rel="noopener noreferrer" className="admin-secondary-button">
            <ExternalLink size={14} aria-hidden="true" />
            View the site
          </a>
        }
      />
      <nav className="admin-quick-actions" aria-label="Quick actions">
        {QUICK_ACTIONS.map((action) => (
          <Link key={action.href} href={action.href}>
            <action.icon size={16} aria-hidden="true" />
            {action.label}
          </Link>
        ))}
      </nav>
      <div className="admin-stat-grid">
        {[
          {
            label: 'Writing',
            value: posts,
            icon: PenLine,
            href: '/admin/blog',
          },
          {
            label: 'Work & ventures',
            value: projects,
            icon: Layers,
            href: '/admin/projects',
          },
          {
            label: 'Unread messages',
            value: unread,
            icon: MessageSquare,
            href: '/admin/messages',
          },
          {
            label: 'Confirmed readers',
            value: subscribers,
            icon: Mail,
            href: '/admin/newsletter',
          },
        ].map((item) => (
          <Link key={item.href} href={item.href} className="admin-stat">
            <span>
              <item.icon size={15} />
              {item.label}
            </span>
            <strong>{item.value}</strong>
          </Link>
        ))}
      </div>
      <AnalyticsSection range={range} />
      <div className="admin-home-grid">
        <div className="admin-stack">
          <section className="admin-panel">
            <div className="admin-panel-heading">
              <h2>On your writing desk</h2>
              <Link href="/admin/blog">All writing</Link>
            </div>
            <div className="admin-activity-list">
              {recentPosts.length ? (
                recentPosts.map((post) => (
                  <Link key={post.id} href={`/admin/blog/${post.id}`}>
                    <FileText size={18} className="admin-muted" />
                    <div>
                      <strong>{post.title}</strong>
                      <small>Edited {date(post.updatedAt)}</small>
                    </div>
                    <span className="admin-status" data-status={post.status}>
                      {post.status}
                    </span>
                  </Link>
                ))
              ) : (
                <p className="admin-empty">
                  Your next piece starts here.{' '}
                  <Link href="/admin/blog/new">Create a draft.</Link>
                </p>
              )}
            </div>
          </section>
          <section className="admin-panel">
            <div className="admin-panel-heading">
              <h2>Work & ventures</h2>
              <Link href="/admin/projects">Manage work</Link>
            </div>
            <div className="admin-activity-list">
              {recentWork.length ? (
                recentWork.map((project) => (
                  <Link key={project.id} href={`/admin/projects/${project.id}`}>
                    <Layers size={18} className="admin-muted" />
                    <div>
                      <strong>{project.title}</strong>
                      <small>{project.category || 'Project'}</small>
                    </div>
                    <span
                      className="admin-status"
                      data-status={project.visible ? 'visible' : 'hidden'}
                    >
                      {project.visible ? 'Public' : 'Hidden'}
                    </span>
                  </Link>
                ))
              ) : (
                <p className="admin-empty">
                  Add the projects and ventures that tell your story.
                </p>
              )}
            </div>
          </section>
        </div>
        <div className="admin-stack">
          <section className="admin-panel">
            <div className="admin-panel-heading">
              <h2>In your inbox</h2>
              <Link href="/admin/messages">Open inbox</Link>
            </div>
            <div className="admin-activity-list">
              {messages.length ? (
                messages.map((message) => (
                  <Link key={message.id} href="/admin/messages">
                    <div>
                      <strong>
                        {!message.read && <span className="admin-unread-dot" />}
                        {message.subject}
                      </strong>
                      <small>
                        {message.name} · {date(message.receivedAt)}
                      </small>
                    </div>
                    <ChevronRight size={16} className="admin-muted" />
                  </Link>
                ))
              ) : (
                <p className="admin-empty">
                  You’re all caught up. New messages will appear here.
                </p>
              )}
            </div>
          </section>
          <section className="admin-panel">
            <div className="admin-panel-heading">
              <h2>Keep your story current</h2>
            </div>
            <div className="admin-activity-list">
              {[
                {
                  title: 'Biography & life history',
                  detail: 'Timeline, education, roles and values.',
                  href: '/admin/content/about',
                },
                {
                  title: 'Homepage introduction',
                  detail: 'Introduction, portrait and quick facts.',
                  href: '/admin/content/home',
                },
                {
                  title: 'Photographs & moments',
                  detail: 'Upload and caption new photographs.',
                  href: '/admin/gallery',
                },
              ].map((item) => (
                <Link key={item.href} href={item.href}>
                  <div>
                    <strong>{item.title}</strong>
                    <small>{item.detail}</small>
                  </div>
                  <ChevronRight size={16} className="admin-muted" />
                </Link>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
