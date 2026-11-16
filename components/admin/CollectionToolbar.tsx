import Link from 'next/link'
import { Search } from 'lucide-react'
export function CollectionToolbar({
  basePath,
  query,
  status,
  filters,
  label,
}: {
  basePath: string
  query: string
  status: string
  filters: Array<{ value: string; label: string; count?: number }>
  label: string
}) {
  return (
    <div className="admin-toolbar">
      <nav className="admin-filter-tabs" aria-label={`${label} filters`}>
        {filters.map((filter) => {
          const params = new URLSearchParams()
          if (query) params.set('q', query)
          if (filter.value !== 'all') params.set('status', filter.value)
          return (
            <Link
              key={filter.value}
              href={`${basePath}${params.size ? `?${params}` : ''}`}
              aria-current={status === filter.value ? 'page' : undefined}
            >
              {filter.label}
              {filter.count !== undefined && (
                <span className="admin-filter-count">{filter.count}</span>
              )}
            </Link>
          )
        })}
      </nav>
      <form action={basePath} method="get" className="admin-collection-search">
        <label className="sr-only" htmlFor="collection-search">
          Search {label.toLowerCase()}
        </label>
        <input
          id="collection-search"
          type="search"
          name="q"
          defaultValue={query}
          maxLength={120}
          placeholder={`Search ${label.toLowerCase()}…`}
        />
        {status !== 'all' && (
          <input type="hidden" name="status" value={status} />
        )}
        <button type="submit" aria-label={`Search ${label.toLowerCase()}`}>
          <Search size={16} />
        </button>
      </form>
    </div>
  )
}
