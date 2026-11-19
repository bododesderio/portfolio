import { permanentRedirect } from 'next/navigation'

/** The account screens moved under /admin/account; this keeps old bookmarks working. */
export default function LegacyAccountSettings() {
  permanentRedirect('/admin/account/security')
}
