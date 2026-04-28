'use client'

import { useState, useEffect, useCallback } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { X } from 'lucide-react'

interface PublicBanner {
  id: string
  kind: string
  placement: string
  title: string | null
  body: string | null
  imageUrl: string | null
  ctaLabel: string | null
  ctaUrl: string | null
  ctaVariant: string
  dismissable: boolean
  requireConsent: boolean
  theme: string
  priority: number
  showOnce: boolean
  cooldownHours: number
  delaySeconds: number
  scrollTrigger: number | null
  exitIntent: boolean
}

function storageKey(id: string) { return `banner-${id}` }

function shouldShow(b: PublicBanner): boolean {
  if (typeof window === 'undefined') return false
  const stored = localStorage.getItem(storageKey(b.id))
  if (!stored) return true
  const data = JSON.parse(stored)

  if (b.showOnce && data.dismissed) return false
  if (b.cooldownHours > 0 && data.dismissedAt) {
    const cooldownMs = b.cooldownHours * 3600000
    if (Date.now() - data.dismissedAt < cooldownMs) return false
  }
  return true
}

function trackEvent(id: string, event: string) {
  fetch('/api/banners/event', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, event }),
  }).catch(() => {})
}

function dismiss(b: PublicBanner) {
  localStorage.setItem(storageKey(b.id), JSON.stringify({ dismissed: true, dismissedAt: Date.now() }))
  trackEvent(b.id, 'dismiss')
}

function acceptConsent(b: PublicBanner) {
  localStorage.setItem(storageKey(b.id), JSON.stringify({ dismissed: true, dismissedAt: Date.now(), consented: true }))
  localStorage.setItem('cookie-consent', 'accepted')
  trackEvent(b.id, 'conversion')
}

function declineConsent(b: PublicBanner) {
  localStorage.setItem(storageKey(b.id), JSON.stringify({ dismissed: true, dismissedAt: Date.now(), consented: false }))
  localStorage.setItem('cookie-consent', 'declined')
  trackEvent(b.id, 'dismiss')
}

/* ─── Individual banner renderers ─── */

function TopBar({ banner, onDismiss }: { banner: PublicBanner; onDismiss: () => void }) {
  return (
    <div className="fixed top-0 inset-x-0 z-[60] animate-in slide-in-from-top duration-300">
      <div className="bg-brand text-white px-4 py-2.5 text-center text-sm">
        <div className="max-w-5xl mx-auto flex items-center justify-center gap-3">
          <span>{banner.body || banner.title}</span>
          {banner.ctaLabel && banner.ctaUrl && (
            <Link href={banner.ctaUrl} onClick={() => trackEvent(banner.id, 'click')} className="font-semibold underline underline-offset-2 hover:no-underline">
              {banner.ctaLabel}
            </Link>
          )}
          {banner.dismissable && (
            <button onClick={onDismiss} className="ml-2 p-1 rounded hover:bg-white/20 transition-colors" aria-label="Dismiss">
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

function BottomBar({ banner, onDismiss }: { banner: PublicBanner; onDismiss: () => void }) {
  return (
    <div className="fixed bottom-0 inset-x-0 z-[60] p-4 md:p-6 animate-in slide-in-from-bottom-4 duration-500">
      <div className="max-w-2xl mx-auto bg-card border border-hairline rounded-2xl shadow-2xl p-5 md:p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex-1 min-w-0">
            {banner.title && <p className="text-sm font-medium text-fg mb-1">{banner.title}</p>}
            <p className="text-sm text-fg leading-relaxed">{banner.body}</p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {banner.dismissable && (
              <button onClick={onDismiss} className="px-4 py-2 text-sm text-fg-muted hover:text-fg rounded-full border border-hairline hover:border-fg-muted transition-colors">
                Dismiss
              </button>
            )}
            {banner.ctaLabel && banner.ctaUrl && (
              <Link href={banner.ctaUrl} onClick={() => trackEvent(banner.id, 'click')} className="px-5 py-2 text-sm font-medium bg-brand hover:bg-brand-dark text-white rounded-full transition-colors">
                {banner.ctaLabel}
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function CookieBanner({ banner, onAccept, onDecline }: { banner: PublicBanner; onAccept: () => void; onDecline: () => void }) {
  return (
    <div className="fixed bottom-0 inset-x-0 z-[60] p-4 md:p-6 animate-in slide-in-from-bottom-4 duration-500">
      <div className="max-w-2xl mx-auto bg-card border border-hairline rounded-2xl shadow-2xl p-5 md:p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex-1 min-w-0">
            {banner.title && <p className="text-sm font-medium text-fg mb-1">{banner.title}</p>}
            <p className="text-sm text-fg leading-relaxed">
              {banner.body || 'This site uses minimal cookies for authentication and theme preferences.'}
              {' '}
              <Link href="/privacy" className="text-brand hover:underline">Privacy Policy</Link>
            </p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button onClick={onDecline} className="px-4 py-2 text-sm text-fg-muted hover:text-fg rounded-full border border-hairline hover:border-fg-muted transition-colors">
              Decline
            </button>
            <button onClick={onAccept} className="px-5 py-2 text-sm font-medium bg-brand hover:bg-brand-dark text-white rounded-full transition-colors">
              Accept
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function Modal({ banner, onDismiss }: { banner: PublicBanner; onDismiss: () => void }) {
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fade-in" onClick={banner.dismissable ? onDismiss : undefined} aria-hidden />
      <div className="relative bg-card border border-hairline rounded-2xl shadow-2xl max-w-md w-full p-6 animate-in zoom-in-95 fade-in duration-300">
        {banner.dismissable && (
          <button onClick={onDismiss} className="absolute top-3 right-3 p-1.5 rounded-lg text-fg-muted hover:bg-muted" aria-label="Close">
            <X className="h-4 w-4" />
          </button>
        )}
        {banner.title && <h3 className="font-serif text-lg text-fg mb-2">{banner.title}</h3>}
        {banner.body && <p className="text-sm text-fg-muted leading-relaxed mb-4">{banner.body}</p>}
        {banner.ctaLabel && banner.ctaUrl && (
          <Link href={banner.ctaUrl} onClick={() => trackEvent(banner.id, 'click')} className="inline-flex px-5 py-2.5 bg-brand text-white text-sm font-medium rounded-full hover:bg-brand-dark transition-colors">
            {banner.ctaLabel}
          </Link>
        )}
      </div>
    </div>
  )
}

function Corner({ banner, onDismiss }: { banner: PublicBanner; onDismiss: () => void }) {
  const pos = banner.placement === 'left' ? 'left-4' : 'right-4'
  return (
    <div className={`fixed bottom-4 ${pos} z-[60] max-w-xs animate-in slide-in-from-bottom-4 fade-in duration-500`}>
      <div className="bg-card border border-hairline rounded-2xl shadow-2xl p-4">
        {banner.dismissable && (
          <button onClick={onDismiss} className="absolute top-2 right-2 p-1 rounded-lg text-fg-muted hover:bg-muted" aria-label="Close">
            <X className="h-3.5 w-3.5" />
          </button>
        )}
        {banner.title && <p className="text-sm font-medium text-fg mb-1 pr-6">{banner.title}</p>}
        {banner.body && <p className="text-xs text-fg-muted leading-relaxed mb-3">{banner.body}</p>}
        {banner.ctaLabel && banner.ctaUrl && (
          <Link href={banner.ctaUrl} onClick={() => trackEvent(banner.id, 'click')} className="text-xs font-medium text-brand hover:underline">
            {banner.ctaLabel}
          </Link>
        )}
      </div>
    </div>
  )
}

/* ─── Orchestrator ─── */

function BannerItem({ banner }: { banner: PublicBanner }) {
  const [visible, setVisible] = useState(false)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    if (!shouldShow(banner)) return
    const delay = (banner.delaySeconds || (banner.kind === 'cookie' ? 1.5 : 0)) * 1000
    const timer = setTimeout(() => {
      setReady(true)
      setVisible(true)
      trackEvent(banner.id, 'impression')
    }, delay)
    return () => clearTimeout(timer)
  }, [banner])

  const handleDismiss = useCallback(() => {
    dismiss(banner)
    setVisible(false)
  }, [banner])

  const handleAccept = useCallback(() => {
    acceptConsent(banner)
    setVisible(false)
  }, [banner])

  const handleDecline = useCallback(() => {
    declineConsent(banner)
    setVisible(false)
  }, [banner])

  if (!ready || !visible) return null

  switch (banner.kind) {
    case 'topbar':   return <TopBar banner={banner} onDismiss={handleDismiss} />
    case 'bottombar': return <BottomBar banner={banner} onDismiss={handleDismiss} />
    case 'cookie':   return <CookieBanner banner={banner} onAccept={handleAccept} onDecline={handleDecline} />
    case 'modal':    return <Modal banner={banner} onDismiss={handleDismiss} />
    case 'corner':   return <Corner banner={banner} onDismiss={handleDismiss} />
    default:         return null
  }
}

export function BannerRenderer() {
  const pathname = usePathname()
  const [banners, setBanners] = useState<PublicBanner[]>([])

  useEffect(() => {
    fetch(`/api/banners/active?path=${encodeURIComponent(pathname)}`)
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setBanners(data) })
      .catch(() => {})
  }, [pathname])

  if (banners.length === 0) return null

  return (
    <>
      {banners.map(b => <BannerItem key={b.id} banner={b} />)}
    </>
  )
}
