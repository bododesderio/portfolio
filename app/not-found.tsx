import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-surface text-fg px-6">
      <p className="text-sm uppercase tracking-[0.3em] text-fg-muted mb-4">Page not found</p>
      <h1 className="font-serif text-7xl md:text-9xl font-light mb-6">404</h1>
      <p className="text-lg text-fg-muted mb-10 text-center max-w-md">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <Link
        href="/"
        className="px-8 py-3 bg-brand hover:bg-brand-dark text-white font-medium rounded-full transition-colors"
      >
        Back to home
      </Link>
    </div>
  )
}
