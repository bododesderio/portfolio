const isDev = process.env.NODE_ENV !== 'production'

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  poweredByHeader: false,
  reactStrictMode: true,
  compress: true,
  devIndicators: false,
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'miro.medium.com' },
      { protocol: 'https', hostname: 'cdn-images-1.medium.com' },
    ],
    localPatterns: [
      { pathname: '/images/**' },
      { pathname: '/uploads/**' },
    ],
    formats: ['image/avif', 'image/webp'],
  },
  async headers() {
    const securityHeaders = [
      // Force HTTPS in production only — skip on localhost to avoid cert errors.
      ...(isDev ? [] : [
        { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
      ]),
      // Block clickjacking — site is never embedded in iframes.
      { key: 'X-Frame-Options', value: 'DENY' },
      // Stop content-type sniffing.
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      // Referrer policy that keeps origin on cross-site, full data on same-origin.
      { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
      // Disable browser features the site doesn't use.
      {
        key: 'Permissions-Policy',
        value: [
          'camera=()',
          'microphone=()',
          'geolocation=()',
          'payment=()',
          'usb=()',
          'magnetometer=()',
          'accelerometer=()',
          'gyroscope=()',
          'midi=()',
          'sync-xhr=()',
          'fullscreen=(self)',
        ].join(', '),
      },
      // Cross-origin isolation — relaxed (we serve embed-friendly content).
      { key: 'Cross-Origin-Opener-Policy', value: 'same-origin-allow-popups' },
      // CSP — inline styles required by Tailwind/theme injector; inline scripts
      // required by Next.js hydration. Fonts are self-hosted (fontsource).
      {
        key: 'Content-Security-Policy',
        value: [
          "default-src 'self'",
          `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ''}`,
          "style-src 'self' 'unsafe-inline'",
          "font-src 'self' data:",
          "img-src 'self' data: blob: https://miro.medium.com https://cdn-images-1.medium.com",
          "media-src 'self'",
          "connect-src 'self' https://api.calendly.com",
          "frame-src 'self' https://calendly.com https://*.calendly.com",
          "frame-ancestors 'none'",
          "form-action 'self'",
          "base-uri 'self'",
          "object-src 'none'",
          "upgrade-insecure-requests",
        ].join('; '),
      },
    ]

    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
      {
        source: '/gallery',
        headers: [
          { key: 'Cache-Control', value: 'public, s-maxage=300, stale-while-revalidate=600' },
        ],
      },
    ]
  },
}

module.exports = nextConfig
