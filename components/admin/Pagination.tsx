import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface PaginationProps {
  currentPage: number
  totalPages: number
  basePath: string
}

export function Pagination({ currentPage, totalPages, basePath }: PaginationProps) {
  if (totalPages <= 1) return null

  // Build page numbers to show: always show first, last, and pages around current
  const pages: (number | 'ellipsis')[] = []
  for (let i = 1; i <= totalPages; i++) {
    if (
      i === 1 ||
      i === totalPages ||
      (i >= currentPage - 1 && i <= currentPage + 1)
    ) {
      pages.push(i)
    } else if (pages[pages.length - 1] !== 'ellipsis') {
      pages.push('ellipsis')
    }
  }

  function href(page: number) {
    return page === 1 ? basePath : `${basePath}?page=${page}`
  }

  return (
    <nav className="flex items-center justify-center gap-1.5 mt-8" aria-label="Pagination">
      {/* Previous */}
      {currentPage > 1 ? (
        <Link
          href={href(currentPage - 1)}
          className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-muted text-fg-muted hover:bg-brand hover:text-white transition-colors text-sm"
          aria-label="Previous page"
        >
          <ChevronLeft className="h-4 w-4" />
        </Link>
      ) : (
        <span className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-muted text-fg-muted/40 cursor-not-allowed text-sm">
          <ChevronLeft className="h-4 w-4" />
        </span>
      )}

      {/* Page numbers */}
      {pages.map((p, i) =>
        p === 'ellipsis' ? (
          <span key={`ellipsis-${i}`} className="inline-flex items-center justify-center w-9 h-9 text-fg-muted text-sm">
            &hellip;
          </span>
        ) : (
          <Link
            key={p}
            href={href(p)}
            className={`inline-flex items-center justify-center w-9 h-9 rounded-full text-sm font-medium transition-colors ${
              p === currentPage
                ? 'bg-brand text-white'
                : 'bg-muted text-fg-muted hover:bg-brand/20 hover:text-fg'
            }`}
            aria-current={p === currentPage ? 'page' : undefined}
          >
            {p}
          </Link>
        )
      )}

      {/* Next */}
      {currentPage < totalPages ? (
        <Link
          href={href(currentPage + 1)}
          className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-muted text-fg-muted hover:bg-brand hover:text-white transition-colors text-sm"
          aria-label="Next page"
        >
          <ChevronRight className="h-4 w-4" />
        </Link>
      ) : (
        <span className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-muted text-fg-muted/40 cursor-not-allowed text-sm">
          <ChevronRight className="h-4 w-4" />
        </span>
      )}
    </nav>
  )
}
