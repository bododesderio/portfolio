/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  poweredByHeader: false,
  reactStrictMode: true,
  compress: true,
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      { protocol: 'https', hostname: '*.cloudinary.com' },
    ],
    localPatterns: [
      { pathname: '/images/**' },
    ],
    formats: ['image/avif', 'image/webp'],
  },
  async headers() {
    const securityHeaders = [
      // Force HTTPS in browsers that have ever loaded the site over TLS.
      { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
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
      // Conservative CSP. Inline styles are required by Tailwind and the theme injector;
      // inline scripts are required by Next.js for hydration. Tighten further only after
      // moving to nonces (Next 16 supports them via middleware).
      {
        key: 'Content-Security-Policy',
        value: [
          "default-src 'self'",
          "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
          "style-src 'self' 'unsafe-inline' fonts.googleapis.com",
          "font-src 'self' fonts.gstatic.com data:",
          "img-src 'self' data: blob: https://res.cloudinary.com https://*.cloudinary.com",
          "media-src 'self' https://res.cloudinary.com",
          "connect-src 'self' https://api.resend.com https://*.cloudinary.com https://api.cloudinary.com https://api.calendly.com",
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
