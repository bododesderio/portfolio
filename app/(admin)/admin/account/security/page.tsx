import { AdminPageHeader } from '@/components/admin/AdminPageHeader'
import { PasswordChangeForm } from '@/components/admin/account/PasswordChangeForm'

export const metadata = { title: 'Security — Admin' }

export default function SecurityPage() {
  return (
    <div>
      <AdminPageHeader title="Security" description="Change your password. More security controls (2FA, session management) coming soon." />
      <div className="max-w-md">
        <PasswordChangeForm />
      </div>
    </div>
  )
}
