/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: 'rgb(var(--brand) / <alpha-value>)',
          light:   'rgb(var(--brand-light) / <alpha-value>)',
          dark:    'rgb(var(--brand-dark) / <alpha-value>)',
          50:  'rgb(var(--brand-50) / <alpha-value>)',
          100: 'rgb(var(--brand-100) / <alpha-value>)',
          200: 'rgb(var(--brand-200) / <alpha-value>)',
          300: 'rgb(var(--brand-300) / <alpha-value>)',
          400: 'rgb(var(--brand-400) / <alpha-value>)',
          500: 'rgb(var(--brand-500) / <alpha-value>)',
          600: 'rgb(var(--brand-600) / <alpha-value>)',
          700: 'rgb(var(--brand-700) / <alpha-value>)',
          800: 'rgb(var(--brand-800) / <alpha-value>)',
          900: 'rgb(var(--brand-900) / <alpha-value>)',
        },
        ink: {
          DEFAULT: '#0a0a0b',
          50:  '#f7f7f8',
          100: '#ededf0',
          200: '#d9dae0',
          300: '#a9aab3',
          400: '#6e7079',
          500: '#4a4c55',
          600: '#33353d',
          700: '#24262d',
          800: '#15171c',
          900: '#0a0a0b',
        },
        // Semantic tokens — resolve via CSS vars per theme.
        surface:    'rgb(var(--surface) / <alpha-value>)',
        'surface-2':'rgb(var(--surface-2) / <alpha-value>)',
        card:       'rgb(var(--card) / <alpha-value>)',
        muted:      'rgb(var(--muted) / <alpha-value>)',
        fg:         'rgb(var(--ink) / <alpha-value>)',
        'fg-muted': 'rgb(var(--ink-muted) / <alpha-value>)',
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        serif: ['var(--font-playfair)', 'Playfair Display', 'ui-serif', 'Georgia', 'serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'monospace'],
      },
      fontSize: {
        'display-xl': ['clamp(3.5rem, 9vw, 7.5rem)', { lineHeight: '0.95', letterSpacing: '-0.04em' }],
        'display':    ['clamp(2.75rem, 6vw, 5.5rem)', { lineHeight: '1.0', letterSpacing: '-0.035em' }],
        'h1':         ['clamp(2rem, 4vw, 3.75rem)',   { lineHeight: '1.05', letterSpacing: '-0.03em' }],
        'h2':         ['clamp(1.75rem, 3vw, 2.75rem)', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
        'eyebrow':    ['0.72rem', { lineHeight: '1.1', letterSpacing: '0.2em' }],
      },
      letterSpacing: {
        'brand': '0.2em',
      },
      boxShadow: {
        'glow-brand':  '0 10px 40px -10px rgba(201, 168, 76, 0.35)',
        'glow-sm':     '0 2px 16px -4px rgba(201, 168, 76, 0.25)',
        'glass':       '0 1px 0 0 rgba(255,255,255,0.05) inset, 0 1px 24px -8px rgba(0,0,0,0.5)',
        'halo':        '0 0 0 1px rgba(201,168,76,0.4), 0 0 32px -8px rgba(201,168,76,0.3)',
      },
      backgroundImage: {
        'grid-light': 'linear-gradient(rgba(15,23,42,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(15,23,42,0.04) 1px, transparent 1px)',
        'grid-dark':  'linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)',
        'radial-brand':   'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(201,168,76,0.18), transparent 60%)',
        'radial-spot':    'radial-gradient(ellipse 50% 40% at 30% 30%, rgba(201,168,76,0.25), transparent 60%), radial-gradient(ellipse 50% 40% at 80% 70%, rgba(68,92,201,0.15), transparent 60%)',
        'noise':          'url("data:image/svg+xml;utf8,<svg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'><filter id=\'n\'><feTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' stitchTiles=\'stitch\'/><feColorMatrix values=\'0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.08 0\'/></filter><rect width=\'100%\' height=\'100%\' filter=\'url(%23n)\'/></svg>")',
      },
      backgroundSize: {
        'grid-md': '56px 56px',
        'grid-lg': '96px 96px',
      },
      animation: {
        'fade-in':        'fadeIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'slide-up':       'slideUp 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'rise':           'rise 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'blur-in':        'blurIn 0.9s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'marquee':        'marquee 40s linear infinite',
        'marquee-reverse':'marquee-reverse 40s linear infinite',
        'shimmer':        'shimmer 2.5s linear infinite',
        'ping-slow':      'ping 3s cubic-bezier(0, 0, 0.2, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%':   { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        rise: {
          '0%':   { opacity: '0', transform: 'translateY(36px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        blurIn: {
          '0%':   { opacity: '0', filter: 'blur(12px)', transform: 'scale(0.98)' },
          '100%': { opacity: '1', filter: 'blur(0)',   transform: 'scale(1)' },
        },
        marquee: {
          '0%':   { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        'marquee-reverse': {
          '0%':   { transform: 'translateX(-50%)' },
          '100%': { transform: 'translateX(0)' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      transitionTimingFunction: {
        'out-expo':  'cubic-bezier(0.16, 1, 0.3, 1)',
        'in-out-quint': 'cubic-bezier(0.86, 0, 0.07, 1)',
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
}
