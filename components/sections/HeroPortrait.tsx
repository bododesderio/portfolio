import Image from 'next/image'

export function HeroPortrait({ photo }: { photo?: string }) {
  return (
    <div className="relative aspect-[4/5] w-full max-w-md mx-auto lg:max-w-none">
      {/* Gold radial glow behind the frame */}
      <div
        aria-hidden
        className="absolute -inset-6 rounded-[2.5rem] bg-radial-brand opacity-60 blur-2xl"
      />

      {/* Frame */}
      <div className="relative h-full w-full overflow-hidden rounded-3xl border border-black/10 dark:border-white/10 bg-ink-900 noise">
        {photo ? (
          <Image
            src={photo}
            alt="Bodo Desderio"
            fill
            className="object-cover"
            sizes="(max-width:768px) 100vw, 500px"
            priority
            unoptimized={photo.startsWith('http')}
          />
        ) : (
          <Silhouette />
        )}

        {/* Subtle vignette + brand wash */}
        <div aria-hidden className="absolute inset-0 bg-gradient-to-br from-brand/15 via-transparent to-black/40" />

        {/* Corner grid accent */}
        <div
          aria-hidden
          className="absolute inset-0 bg-grid-dark bg-grid-md opacity-[0.18] [mask-image:radial-gradient(ellipse_70%_60%_at_50%_60%,black,transparent_85%)]"
        />

        {/* Name tag */}
        <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-[10px] font-mono uppercase tracking-widest text-white/50">
          <span>Bodo Desderio</span>
          <span>Kampala · UG</span>
        </div>
      </div>
    </div>
  )
}

function Silhouette() {
  return (
    <svg
      viewBox="0 0 400 500"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="xMidYMid slice"
      className="absolute inset-0 h-full w-full"
      aria-hidden
    >
      <defs>
        <radialGradient id="warm" cx="50%" cy="30%" r="70%">
          <stop offset="0%" stopColor="rgb(201 168 76 / 0.35)" />
          <stop offset="55%" stopColor="rgb(201 168 76 / 0)" />
        </radialGradient>
        <linearGradient id="baseline" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgb(21 23 28)" />
          <stop offset="100%" stopColor="rgb(10 10 11)" />
        </linearGradient>
        <linearGradient id="subject" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgb(36 38 45)" />
          <stop offset="100%" stopColor="rgb(15 17 22)" />
        </linearGradient>
      </defs>

      <rect width="400" height="500" fill="url(#baseline)" />
      <rect width="400" height="500" fill="url(#warm)" />

      {/* Shoulders + head silhouette */}
      <g fill="url(#subject)">
        {/* Shoulders (trapezoid ish) */}
        <path d="M -20 500 L -20 430 C 60 380, 110 355, 150 355 L 250 355 C 290 355, 340 380, 420 430 L 420 500 Z" />
        {/* Neck */}
        <rect x="175" y="315" width="50" height="55" rx="8" />
        {/* Head */}
        <ellipse cx="200" cy="245" rx="78" ry="95" />
      </g>

      {/* Highlight rim on head (brand gold) */}
      <ellipse cx="200" cy="245" rx="78" ry="95" fill="none" stroke="rgb(201 168 76 / 0.18)" strokeWidth="1" />

      {/* Subtle brand accent dot at corner */}
      <circle cx="360" cy="50" r="3" fill="rgb(201 168 76 / 0.8)" />
    </svg>
  )
}
