import { getSiteSettings } from '@/lib/data/content'
import { profileLinks } from '@/lib/domain/profile'

export type EmailBrand = {
  siteUrl: string
  logoUrl: string
  socials: { label: string; href: string; icon: string }[]
}

const siteUrl = () => (process.env.NEXT_PUBLIC_SITE_URL || 'https://bododesderio.com').replace(/\/$/, '')

const ICON_FILE: Record<string, string> = {
  Facebook: 'facebook',
  Instagram: 'instagram',
  X: 'x',
  YouTube: 'youtube',
  LinkedIn: 'linkedin',
  GitHub: 'github',
  Medium: 'medium',
}

// Emails render on the server, where React context is unavailable, so the
// brand loaded for a send is held here. It is the same for every email (it
// comes from Site Settings), so overlapping renders cannot get the wrong one.
let current: EmailBrand = {
  siteUrl: siteUrl(),
  logoUrl: `${siteUrl()}/identity/email/logo.png`,
  socials: [],
}

export function emailBrand(): EmailBrand {
  return current
}

/** Logo and social links for the email header and footer, from Site Settings. */
export async function loadEmailBrand(): Promise<EmailBrand> {
  const base = siteUrl()
  let socials: EmailBrand['socials'] = []
  try {
    socials = profileLinks(await getSiteSettings()).map((link) => ({
      label: link.label,
      href: link.href,
      icon: `${base}/identity/email/${ICON_FILE[link.label]}.png`,
    }))
  } catch (err) {
    console.error('[Email] Social links unavailable, sending without them:', (err as Error).message)
  }
  current = { siteUrl: base, logoUrl: `${base}/identity/email/logo.png`, socials }
  return current
}
