'use client'

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-fg px-6">
      <div className="bg-card border border-hairline rounded-2xl p-10 text-center max-w-md">
        <p className="text-sm uppercase tracking-[0.2em] text-red-500 font-semibold mb-3">Error</p>
        <h1 className="font-serif text-2xl mb-3">Something went wrong</h1>
        <p className="text-fg-muted text-sm mb-6">
          {error.message || 'An unexpected error occurred in the admin panel.'}
        </p>
        <button
          onClick={reset}
          className="px-6 py-2.5 bg-brand hover:bg-brand-dark text-white text-sm font-medium rounded-full transition-colors"
        >
          Try again
        </button>
      </div>
    </div>
  )
}
