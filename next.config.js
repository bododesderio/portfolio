const isDev = process.env.NODE_ENV !== 'production'

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  poweredByHeader: false,
  reactStrictMode: true,
  compress: true,
  devIndicators: false,
  // isomorphic-dompurify pulls in jsdom, which loads assets (e.g.
  // browser/default-stylesheet.css) from its own package dir at runtime.
  // Webpack-bundling it breaks that lookup and fails page-data collection,
  // so keep it (and jsdom) as a runtime require from node_modules. Standalone
  // output traces both into the deploy bundle.
  serverExternalPackages: ['isomorphic-dompurify', 'jsdom'],
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
      // NOTE: Content-Security-Policy is set per-request in proxy.ts (middleware)
      // so it can carry a fresh nonce for inline scripts — a static header here
      // can't do nonces. All the directives (img-src https:, calendly frames,
      // style-src unsafe-inline, etc.) now live there.
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
