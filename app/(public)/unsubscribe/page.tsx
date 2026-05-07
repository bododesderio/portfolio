import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Unsubscribed — Bodo Desderio',
  description: 'You have been successfully removed from the mailing list.',
  robots: { index: false },
}

export default function UnsubscribePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center">
      <h1 className="font-serif text-4xl md:text-5xl text-fg mb-4">Unsubscribed</h1>
      <p className="text-lg text-fg-muted mb-8 max-w-md">
        You&apos;ve been removed from the mailing list. You won&apos;t receive any more emails.
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
