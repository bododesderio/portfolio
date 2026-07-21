import { Container } from '@/components/ui/Container'
import { Skeleton } from '@/components/ui/Skeleton'

/**
 * Rendered inside the public <main> (header/footer stay put) while a page's
 * server data streams in. A centred title block plus a content grid stands in
 * for the varied section layouts.
 */
export default function PublicLoading() {
  return (
    <div aria-busy="true" aria-label="Loading" className="py-24">
      <Container>
        <div className="max-w-2xl mx-auto text-center space-y-4 mb-16">
          <Skeleton className="h-4 w-32 mx-auto" />
          <Skeleton className="h-12 w-3/4 mx-auto" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6 mx-auto" />
        </div>
        <div className="grid gap-8 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="space-y-4">
              <Skeleton className="h-48 w-full rounded-2xl" />
              <Skeleton className="h-5 w-2/3" />
              <Skeleton className="h-4 w-full" />
            </div>
          ))}
        </div>
      </Container>
    </div>
  )
}
