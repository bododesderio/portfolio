/**
 * Shared framer-motion presets. Import these instead of re-declaring the same
 * easing curve and scroll-reveal props in every section.
 *
 * Section animations intentionally vary (travel distance, duration), so these
 * are building blocks, not a mandate — use `fadeUp()` where the values match,
 * and hand-write the motion props where a section needs something different.
 */

/** Project easing curve (ease-out quart-ish). Was copy-pasted into many sections. */
export const EASE = [0.16, 1, 0.3, 1] as const

/** Reveal once when 30% of the element scrolls into view. */
export const viewportOnce = { once: true, amount: 0.3 } as const

/**
 * Fade-and-rise as the element scrolls in. Spread onto a `motion` component:
 *   <motion.div {...fadeUp()} />
 *   <motion.div {...fadeUp(0.12)} />   // staggered
 */
export function fadeUp(delay = 0, y = 16, duration = 0.8) {
  return {
    initial: { opacity: 0, y },
    whileInView: { opacity: 1, y: 0 },
    viewport: viewportOnce,
    transition: { duration, ease: EASE, delay },
  } as const
}

/** Plain opacity fade-in on scroll. */
export function fadeIn(delay = 0, duration = 0.6) {
  return {
    initial: { opacity: 0 },
    whileInView: { opacity: 1 },
    viewport: viewportOnce,
    transition: { duration, delay },
  } as const
}
