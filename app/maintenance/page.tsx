import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { isAdminSession } from '@/lib/util/admin-session'
import { BrandMark } from '@/components/personal/BrandMark'
import { getMaintenanceState } from '@/lib/domain/maintenance'
import { getSiteSetting } from '@/lib/data/content'
import './maintenance.css'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = {
  title: 'Back shortly',
  robots: { index: false, follow: false },
}

function returnTime(iso: string | null) {
  if (!iso) return null
  const date = new Date(iso)
  if (Number.isNaN(date.getTime()) || date.getTime() < Date.now()) return null
  return date.toLocaleString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Africa/Kampala',
  })
}

export default async function MaintenancePage({
  searchParams,
}: {
  searchParams: Promise<{ preview?: string }>
}) {
  const [state, { preview }, session, email] = await Promise.all([
    getMaintenanceState(),
    searchParams,
    auth(),
    getSiteSetting('site.email'),
  ])
  if (!state.enabled && !(preview === '1' && isAdminSession(session))) redirect('/')
  const back = returnTime(state.returnAt)
  return (
    <main className="maintenance-page">
      <div className="maintenance-card">
        <BrandMark className="maintenance-mark" />
        <p className="maintenance-eyebrow">Bodo Desderio</p>
        <h1>The site is being updated</h1>
        <p>{state.message}</p>
        {back && <p className="maintenance-return">Expected back {back}, Kampala time.</p>}
        {email && (
          <a href={`mailto:${email}`} className="maintenance-email">
            {email}
          </a>
        )}
      </div>
    </main>
  )
}
