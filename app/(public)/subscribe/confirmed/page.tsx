import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Subscription Confirmed — Bodo Desderio',
  description: 'Your newsletter subscription has been confirmed.',
  robots: { index: false },
}

interface Props {
  searchParams: Promise<{ success?: string; error?: string }>
}

export default async function SubscriptionConfirmedPage({ searchParams }: Props) {
  const params = await searchParams
  const success = params.success === 'true'
  const error = params.error === 'true'

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center">
      {error ? (
        <>
          <h1 className="font-serif text-4xl md:text-5xl text-fg mb-4">Confirmation Failed</h1>
          <p className="text-lg text-fg-muted mb-8 max-w-md">
            The confirmation link may be invalid or expired. Please try subscribing again.
          </p>
        </>
      ) : success ? (
        <>
          <h1 className="font-serif text-4xl md:text-5xl text-fg mb-4">Subscription Confirmed!</h1>
          <p className="text-lg text-fg-muted mb-8 max-w-md">
            You&apos;re all set. You&apos;ll now receive updates from Bodo Desderio.
          </p>
        </>
      ) : (
        <>
          <h1 className="font-serif text-4xl md:text-5xl text-fg mb-4">Confirm Subscription</h1>
          <p className="text-lg text-fg-muted mb-8 max-w-md">
            Use the link in your email to confirm your subscription.
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
