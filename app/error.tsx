'use client'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-bg text-fg px-6">
      <p className="text-sm uppercase tracking-[0.3em] text-fg-muted mb-4">Something went wrong</p>
      <h1 className="font-serif text-7xl md:text-9xl font-light mb-6">500</h1>
      <p className="text-lg text-fg-muted mb-10 text-center max-w-md">
        An unexpected error occurred. Please try again.
      </p>
      <button
        onClick={reset}
        className="px-8 py-3 bg-brand hover:bg-brand-dark text-white font-medium rounded-full transition-colors"
      >
        Try again
      </button>
    </div>
  )
}
