/**
 * Pulsing placeholder block. Compose these inside a route `loading.tsx` to
 * sketch the shape of the content that is streaming in.
 */
export function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={`animate-pulse rounded-md bg-ink-100 dark:bg-white/[0.06] ${className}`}
    />
  )
}
