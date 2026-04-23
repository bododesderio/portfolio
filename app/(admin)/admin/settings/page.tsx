import Link from 'next/link'
import { Palette, Settings, Network, Search, Plug } from 'lucide-react'
import { AdminPageHeader } from '@/components/admin/AdminPageHeader'

export const metadata = { title: 'Settings — Admin' }

const areas = [
  { href: '/admin/settings/appearance',   label: 'Appearance',    desc: 'Brand colour, login background, availability.',   icon: Palette },
  { href: '/admin/settings/site',         label: 'Site Settings', desc: 'Name, tagline, contact, social links.',            icon: Settings },
  { href: '/admin/settings/navigation',   label: 'Navigation',    desc: 'Customise your public-site menu.',                 icon: Network },
  { href: '/admin/settings/seo',          label: 'SEO & Meta',    desc: 'Per-page meta titles and descriptions.',           icon: Search },
  { href: '/admin/settings/integrations', label: 'Integrations',  desc: 'Cloudinary, Resend, and other API credentials.',   icon: Plug },
]

export default function SettingsIndex() {
  return (
    <div>
      <AdminPageHeader title="Settings" description="Configure everything about how the site runs." />
      <div className="grid sm:grid-cols-2 gap-4">
        {areas.map(a => {
          const Icon = a.icon
          return (
            <Link
              key={a.href}
              href={a.href}
              className="group rounded-2xl border border-hairline bg-card p-5 hover:border-brand/40 transition-colors"
            >
              <div className="flex items-center gap-3 mb-2">
                <Icon className="h-4 w-4 text-brand" />
                <p className="font-serif text-base text-fg">{a.label}</p>
              </div>
              <p className="text-sm text-fg-muted">{a.desc}</p>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
