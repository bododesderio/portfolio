'use client'

import { useState, useEffect, useCallback } from 'react'
import { X, Eye } from 'lucide-react'
import { FormState, ANIMATION_OPTIONS, ANIMATION_STYLES } from './banner-types'

/* ─── Preview Trigger + Live Preview Modal ────────────────────────────────── */

export function PreviewTrigger({ form }: { form: FormState }) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-brand border border-brand/30 rounded-lg hover:bg-brand/10 transition-colors"
      >
        <Eye className="h-4 w-4" /> Preview
      </button>
      {open && <BannerPreviewModal form={form} onClose={() => setOpen(false)} />}
    </>
  )
}

function BannerPreviewModal({ form, onClose }: { form: FormState; onClose: () => void }) {
  const [animating, setAnimating] = useState(false)
  const [visible, setVisible] = useState(false)
  const anim = ANIMATION_STYLES[form.animation] || ANIMATION_STYLES.fade

  const replay = useCallback(() => {
    setVisible(false)
    setAnimating(false)
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setAnimating(true)
        setVisible(true)
      })
    })
  }, [])

  useEffect(() => {
    const t = setTimeout(() => { setAnimating(true); setVisible(true) }, 150)
    return () => clearTimeout(t)
  }, [])

  // Theme class for the preview
  const themeBg = form.theme === 'dark' ? 'bg-ink-900 text-white'
    : form.theme === 'brand' ? 'bg-brand text-white'
    : 'bg-white text-ink-900 dark:bg-ink-800 dark:text-white'

  const ctaBg = form.ctaVariant === 'primary' ? 'bg-brand text-white hover:bg-brand-600'
    : form.ctaVariant === 'invert' ? 'bg-white text-ink-900 hover:bg-ink-50'
    : 'border border-current bg-transparent hover:bg-white/10'

  // Position styles based on kind
  const isBar = form.kind === 'topbar' || form.kind === 'bottombar'
  const isCorner = form.kind === 'corner'

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-card rounded-2xl border border-hairline shadow-2xl w-[90vw] max-w-3xl max-h-[85vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-hairline">
          <div>
            <h3 className="font-serif text-lg text-fg">Banner Preview</h3>
            <p className="text-xs text-fg-muted mt-0.5">
              Animation: <span className="font-medium text-brand">{ANIMATION_OPTIONS.find(a => a.value === form.animation)?.label || form.animation}</span>
              {' '}&middot; Kind: <span className="font-medium">{form.kind}</span>
              {' '}&middot; Theme: <span className="font-medium">{form.theme}</span>
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={replay}
              className="px-3 py-1.5 text-xs font-medium text-brand border border-brand/30 rounded-lg hover:bg-brand/10 transition-colors"
            >
              Replay
            </button>
            <button onClick={onClose} className="p-1.5 rounded-lg text-fg-muted hover:bg-muted">
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Preview area — simulates a page */}
        <div className="relative flex-1 min-h-[400px] bg-surface overflow-hidden">
          {/* Simulated page content */}
          <div className="p-8 space-y-4 opacity-30">
            <div className="h-6 w-48 bg-muted rounded" />
            <div className="h-4 w-full bg-muted rounded" />
            <div className="h-4 w-5/6 bg-muted rounded" />
            <div className="h-4 w-4/6 bg-muted rounded" />
            <div className="h-32 w-full bg-muted rounded-xl" />
            <div className="h-4 w-full bg-muted rounded" />
            <div className="h-4 w-3/4 bg-muted rounded" />
          </div>

          {/* The actual banner preview */}
          <div
            className={`absolute ${
              isBar && form.placement === 'top' ? 'top-0 left-0 right-0' :
              isBar ? 'bottom-0 left-0 right-0' :
              isCorner && form.placement === 'right' ? 'bottom-4 right-4' :
              isCorner ? 'bottom-4 left-4' :
              'inset-0 flex items-center justify-center p-6'
            }`}
            style={{
              ...(animating ? anim.to : anim.from),
              transition: form.animation === 'none' ? 'none' : 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
              pointerEvents: visible ? 'auto' : 'none',
            }}
          >
            <div className={`${
              isBar
                ? `w-full px-4 py-3 flex items-center justify-between gap-4 shadow-lg ${themeBg}`
                : isCorner
                ? `w-80 rounded-xl p-5 shadow-2xl border border-hairline ${themeBg}`
                : `w-full max-w-md rounded-2xl p-6 shadow-2xl border border-hairline ${themeBg}`
            }`}>
              {form.dismissable && (
                <button className="absolute top-2 right-2 p-1 rounded opacity-60 hover:opacity-100">
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
              {form.title && (
                <p className={`font-semibold ${isBar ? 'text-sm' : 'text-base mb-1'}`}>
                  {form.title}
                </p>
              )}
              {form.body && (
                <p className={`opacity-80 ${isBar ? 'text-xs flex-1' : 'text-sm mb-3'}`}>
                  {form.body}
                </p>
              )}
              {form.ctaLabel && (
                <button className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${ctaBg} ${isBar ? 'flex-shrink-0' : ''}`}>
                  {form.ctaLabel}
                </button>
              )}
              {!form.title && !form.body && !form.ctaLabel && (
                <p className="text-sm opacity-50 italic">Add title, body, or CTA to see preview</p>
              )}
            </div>
          </div>
        </div>

        {/* Animation thumbnails */}
        <div className="border-t border-hairline px-5 py-3">
          <p className="text-[10px] uppercase tracking-widest text-fg-muted mb-2">Quick switch animation</p>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {ANIMATION_OPTIONS.map(a => (
              <button
                key={a.value}
                onClick={() => {
                  // We can't update parent form from here, but we replay with visual feedback
                  setVisible(false)
                  setAnimating(false)
                  setTimeout(() => { setAnimating(true); setVisible(true) }, 100)
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                  form.animation === a.value
                    ? 'bg-brand text-white'
                    : 'bg-muted text-fg-muted hover:text-fg'
                }`}
              >
                {a.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
