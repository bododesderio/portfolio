'use client'
import { useEffect, useState } from 'react'
import type { ContentsItem } from './EntryLayout'
export function ContentsNavigation({
  items,
  mobile = false,
}: {
  items: ContentsItem[]
  mobile?: boolean
}) {
  const [active, setActive] = useState(items[0]?.id || '')
  useEffect(() => {
    let frame = 0
    const sections = items
      .map((item) => document.getElementById(item.id))
      .filter((element): element is HTMLElement => Boolean(element))
    function update() {
      frame = 0
      const above = sections.filter(
        (section) => section.getBoundingClientRect().top <= 180
      )
      setActive(above.at(-1)?.id || items[0]?.id || '')
    }
    function scroll() {
      if (!frame) frame = requestAnimationFrame(update)
    }
    update()
    window.addEventListener('scroll', scroll, { passive: true })
    window.addEventListener('hashchange', scroll)
    return () => {
      window.removeEventListener('scroll', scroll)
      window.removeEventListener('hashchange', scroll)
      cancelAnimationFrame(frame)
    }
  }, [items])
  return (
    <ol>
      {items.map((item, index) => (
        <li key={item.id}>
          <a
            href={`#${item.id}`}
            aria-current={active === item.id ? 'location' : undefined}
            onClick={(event) => {
              setActive(item.id)
              if (mobile) {
                const details = event.currentTarget.closest('details')
                if (details) details.open = false
              }
            }}
          >
            <span aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
            {item.label}
          </a>
        </li>
      ))}
    </ol>
  )
}
