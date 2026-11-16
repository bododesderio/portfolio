import Link from 'next/link'
import type { Metadata } from 'next'
import {
  ArrowUpRight,
  PenLine,
  Layers,
  MessageSquare,
  Mail,
  Plus,
  FileText,
  ArrowRight,
} from 'lucide-react'
import { prisma } from '@/lib/data/db'
import { AdminPageHeader } from '@/components/admin/AdminPageHeader'
export const metadata: Metadata = { title: 'Workspace' }
export const dynamic = 'force-dynamic'
const date = (value: Date) =>
  value.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    timeZone: 'UTC',
  })
export default async function AdminDashboard() {
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
        title="Your personal archive"
        description="A little upkeep. A new story. Something worth sharing."
        actions={
          <Link href="/admin/blog/new" className="admin-primary-button">
            <Plus size={16} />
            Write something
          </Link>
        }
      />
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
      <div className="admin-home-grid">
        <div className="admin-stack">
          <section className="admin-panel">
            <div className="admin-panel-heading">
              <h2>On your writing desk</h2>
              <Link href="/admin/blog">All writing ↗</Link>
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
              <Link href="/admin/projects">Manage work ↗</Link>
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
              <Link href="/admin/messages">Open inbox ↗</Link>
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
                    <ArrowUpRight size={15} className="admin-muted" />
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
                  detail: 'The chapters, people, and ideas that shaped you.',
                  href: '/admin/content/about',
                },
                {
                  title: 'Homepage introduction',
                  detail: 'A glimpse of everything you’re about.',
                  href: '/admin/content/home',
                },
                {
                  title: 'Photographs & moments',
                  detail: 'Add another moment to the archive.',
                  href: '/admin/gallery',
                },
              ].map((item) => (
                <Link key={item.href} href={item.href}>
                  <div>
                    <strong>{item.title}</strong>
                    <small>{item.detail}</small>
                  </div>
                  <ArrowRight size={15} className="admin-muted" />
                </Link>
              ))}
            </div>
          </section>
          <Link href="/admin/analytics" className="admin-analytics-link">
            <span>
              How people find your archive
              <small>Visits, popular pages, and newsletter activity</small>
            </span>
            <ArrowUpRight size={18} />
          </Link>
        </div>
      </div>
    </div>
  )
}
