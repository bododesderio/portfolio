import { prisma } from '@/lib/db'
import { AdminPageHeader } from '@/components/admin/AdminPageHeader'
import { SeoSettingsForm } from '@/components/admin/settings/SeoSettingsForm'

export const metadata = { title: 'SEO & Meta — Admin' }

export default async function SeoSettingsPage() {
  const pages = await prisma.seoSettings.findMany()

  return (
    <div>
      <AdminPageHeader title="SEO & Meta" description="Title + description per page. These render in <head> and drive search snippets." />
      <SeoSettingsForm pages={pages} />
    </div>
  )
}
