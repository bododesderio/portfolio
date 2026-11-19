'use client'

import { useEffect, useState } from 'react'
import { ChevronUp } from 'lucide-react'

/** The admin scrolls inside #admin-main rather than the window, so this watches that element. */
export function BackToTop() {
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const main = document.getElementById('admin-main')
    if (!main) return
    const onScroll = () => setVisible(main.scrollTop > 600)
    main.addEventListener('scroll', onScroll, { passive: true })
    return () => main.removeEventListener('scroll', onScroll)
  }, [])
  if (!visible) return null
  return (
    <button
      type="button"
      className="admin-back-to-top"
      aria-label="Back to top"
      onClick={() => {
        const main = document.getElementById('admin-main')
        const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches
        main?.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' })
        main?.focus({ preventScroll: true })
      }}
    >
      <ChevronUp size={18} aria-hidden="true" />
    </button>
  )
}
