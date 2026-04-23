import { AdminPageHeader } from '@/components/admin/AdminPageHeader'

export const metadata = { title: 'Navigation — Admin' }

export default function NavigationPage() {
  return (
    <div>
      <AdminPageHeader title="Navigation" description="Customise your public-site menu." />
      <div className="rounded-2xl border border-hairline bg-card p-10 text-center">
        <p className="text-fg-muted">Coming soon — drag-and-drop menu editor.</p>
      </div>
    </div>
  )
}
