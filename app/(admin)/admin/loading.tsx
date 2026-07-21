import { Skeleton } from '@/components/ui/Skeleton'

/**
 * Shown in the admin content area (inside AdminShell) while a page's server
 * data streams in. Generic on purpose — a heading bar plus a few list rows
 * covers the manager and settings pages without matching any one exactly.
 */
export default function AdminLoading() {
  return (
    <div aria-busy="true" aria-label="Loading">
      <Skeleton className="h-9 w-48 mb-8" />
      <div className="bg-card rounded-2xl border border-hairline p-6 space-y-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4">
            <Skeleton className="h-10 w-10 rounded-lg shrink-0" />
            <Skeleton className="h-4 flex-1" />
            <Skeleton className="h-4 w-16" />
          </div>
        ))}
      </div>
    </div>
  )
}
