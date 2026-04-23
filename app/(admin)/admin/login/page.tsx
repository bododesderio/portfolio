import Image from 'next/image'
import Link from 'next/link'
import { LoginForm } from '@/components/admin/LoginForm'
import { getSiteSetting } from '@/lib/content'
import type { Metadata } from 'next'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = { title: 'Admin Login — Bodo Desderio' }

export default async function LoginPage() {
  const bgUrl = await getSiteSetting('login_background_url')

  return (
    <div className="relative min-h-screen isolate bg-ink-900 text-white">
      {/* Full-bleed background */}
      <div aria-hidden className="absolute inset-0">
        {bgUrl ? (
          <Image
            src={bgUrl}
            alt=""
            fill
            priority
            className="object-cover"
            sizes="100vw"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-ink-900 via-ink-800 to-ink-900">
            <div className="absolute inset-0 bg-radial-brand opacity-60" />
            <div className="absolute inset-0 bg-grid-dark bg-grid-lg opacity-[0.18] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_40%,black,transparent_75%)]" />
          </div>
        )}
        {/* Overlay for contrast */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/60 to-black/80" />
      </div>

      {/* Wordmark */}
      <Link
        href="/"
        className="absolute top-6 left-6 z-10 inline-flex items-center gap-2 font-serif text-lg text-white/80 hover:text-white transition-colors"
      >
        <span className="h-2 w-2 rounded-full bg-brand" />
        Bodo Desderio
      </Link>

      {/* Card */}
      <div className="relative z-10 min-h-screen grid place-items-center px-4 py-20">
        <div className="w-full max-w-md flex flex-col items-center gap-5">
          <LoginForm />
          <p className="text-[11px] uppercase tracking-widest text-white/40">
            Bodo Desderio · Admin
          </p>
        </div>
      </div>
    </div>
  )
}
