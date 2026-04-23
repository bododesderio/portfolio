import Link from 'next/link'
import { FileText, ImageIcon, Upload, ExternalLink } from 'lucide-react'

const actions = [
  { label: 'New Post',        href: '/admin/blog/new',     icon: FileText },
  { label: 'New Gallery Item',href: '/admin/gallery?new=1',icon: ImageIcon as unknown as typeof FileText },
  { label: 'Upload Media',    href: '/admin/media?upload=1', icon: Upload },
  { label: 'View Site',       href: '/',                   icon: ExternalLink, external: true },
]

export function QuickActions() {
  return (
    <div className="rounded-2xl border border-hairline bg-card p-5">
      <h2 className="font-serif text-lg text-fg mb-4">Quick actions</h2>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {actions.map(a => {
          const Icon = a.icon
          return (
            <Link
              key={a.href}
              href={a.href}
              target={a.external ? '_blank' : undefined}
              rel={a.external ? 'noopener noreferrer' : undefined}
              className="group flex flex-col items-start gap-3 rounded-xl border border-hairline bg-surface-2 p-4 hover:border-brand/40 hover:bg-muted transition-colors"
            >
              <Icon className="h-4 w-4 text-brand" />
              <p className="text-sm font-medium text-fg">{a.label}</p>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
