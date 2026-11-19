import { permanentRedirect } from 'next/navigation'

export default function SettingsIndex() {
  permanentRedirect('/admin/settings/site')
}
