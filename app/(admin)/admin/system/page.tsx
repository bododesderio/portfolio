import { redirect } from 'next/navigation'

export default function SystemIndex() {
  redirect('/admin/system/maintenance')
}
