import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Unsubscribed — Bodo Desderio',
  description: 'You have been successfully removed from the mailing list.',
  robots: { index: false },
}

interface Props {
  searchParams: Promise<{ success?: string; error?: string }>
}

export default async function UnsubscribePage({ searchParams }: Props) {
  const params = await searchParams
  const success = params.success === 'true'
  const error = params.error === 'true'

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center">
      {error ? (
        <>
          <h1 className="font-serif text-4xl md:text-5xl text-fg mb-4">Unsubscribe Failed</h1>
          <p className="text-lg text-fg-muted mb-8 max-w-md">
            The unsubscribe link may be invalid or expired. Please try again or contact us.
          </p>
        </>
      ) : (
        <>
          <h1 className="font-serif text-4xl md:text-5xl text-fg mb-4">Unsubscribed</h1>
          <p className="text-lg text-fg-muted mb-8 max-w-md">
            {success
              ? "You've been removed from the mailing list. You won't receive any more emails."
              : 'Use the link in your email to unsubscribe from the mailing list.'}
          </p>
        </>
      )}
      <Link
        href="/"
        className="px-8 py-3 bg-brand hover:bg-brand-dark text-white font-medium rounded-full transition-colors"
      >
        Back to home
      </Link>
    </div>
  )
}
