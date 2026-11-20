import { redirect } from 'next/navigation'

/** Analytics now lives on the Overview page; old links and bookmarks land there. */
export default async function AnalyticsRedirect({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(await searchParams)) {
    if (typeof value === 'string') params.set(key, value)
  }
  const query = params.toString()
  redirect(`/admin${query ? `?${query}` : ''}#analytics`)
}
