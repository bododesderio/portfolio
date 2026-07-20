import Image from 'next/image'
import { LoginForm } from '@/components/admin/LoginForm'
import { getSiteSetting } from '@/lib/data/content'
import type { Metadata } from 'next'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = { title: 'Admin Login — Bodo Desderio' }

export default async function LoginPage() {
  const [bgUrl, cardImage, heading, subtitle, overlayTitle, overlaySubtitle] = await Promise.all([
    getSiteSetting('login_background_url'),
    getSiteSetting('login_card_image'),
    getSiteSetting('login_heading'),
    getSiteSetting('login_subtitle'),
    getSiteSetting('login_overlay_title'),
    getSiteSetting('login_overlay_subtitle'),
  ])

  const finalCardImage = cardImage || bgUrl
  const finalHeading = heading || 'Welcome Back'
  const finalSubtitle = subtitle || 'Sign in to your admin account'
  const finalOverlayTitle = overlayTitle || 'Bodo Desderio'
  const finalOverlaySubtitle = overlaySubtitle || 'Building the future, one project at a time.'

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 md:p-8 bg-ink-900">
      {/* Full-bleed blurred background */}
      <div aria-hidden className="absolute inset-0 overflow-hidden">
        {bgUrl ? (
          <>
            <Image
              src={bgUrl}
              alt=""
              fill
              priority
              className="object-cover scale-105 blur-sm"
              sizes="100vw"
            />
            <div className="absolute inset-0 bg-black/50" />
          </>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-ink-900 via-ink-800 to-ink-900">
            <div className="absolute inset-0 bg-radial-brand opacity-40" />
          </div>
        )}
      </div>

      {/* Floating card */}
      <div className="relative z-10 w-full max-w-[900px] bg-white dark:bg-ink-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row min-h-[520px]">
        {/* ── Left: Image panel ── */}
        <div className="relative md:w-[45%] min-h-[200px] md:min-h-full">
          {finalCardImage ? (
            <Image
              src={finalCardImage}
              alt=""
              fill
              priority
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 45vw"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-brand/80 to-brand-dark" />
          )}
          {/* Gradient overlay for text */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

          {/* Bottom text overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
            <h2 className="font-serif text-xl md:text-2xl text-white font-semibold leading-tight">
              {finalOverlayTitle}
            </h2>
            <p className="mt-1.5 text-sm text-white/70 leading-relaxed">
              {finalOverlaySubtitle}
            </p>
          </div>
        </div>

        {/* ── Right: Form panel ── */}
        <div className="flex-1 flex flex-col items-center justify-center px-8 py-10 md:px-12 md:py-12">
          {/* Brand dot */}
          <div className="mb-6 flex items-center justify-center">
            <div className="h-10 w-10 rounded-full bg-brand/10 flex items-center justify-center">
              <span className="h-4 w-4 rounded-full bg-brand shadow-glow-sm" />
            </div>
          </div>

          <div className="w-full max-w-sm">
            <LoginForm heading={finalHeading} subtitle={finalSubtitle} />
          </div>

          {/* Footer */}
          <p className="mt-8 text-[11px] uppercase tracking-widest text-ink-400 dark:text-white/30">
            Bodo Desderio &middot; Admin
          </p>
        </div>
      </div>
    </div>
  )
}
