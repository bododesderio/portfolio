import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { isAdminSession } from '@/lib/util/admin-session'
import { getMaintenanceState, isMaintainedPath } from '@/lib/domain/maintenance'

const isDev = process.env.NODE_ENV !== 'production'

// AI-training and SEO-scraper user agents blocked at the edge. Paired with the
// full block in public/robots.txt — this catches the crawlers that ignore it.
const BAD_BOTS = [
  'gptbot',
  'chatgpt-user',
  'oai-searchbot',
  'claudebot',
  'claude-web',
  'anthropic-ai',
  'cohere-ai',
  'ccbot',
  'bytespider',
  'amazonbot',
  'meta-externalagent',
  'meta-externalfetcher',
  'perplexitybot',
  'diffbot',
  'imagesiftbot',
  'omgili',
  'dataforseobot',
  'petalbot',
  'mj12bot',
  'ahrefsbot',
  'semrushbot',
  'dotbot',
  'timpibot',
  'scrapy',
]

/**
 * Content-Security-Policy.
 *
 * Production is nonce-based: every request gets a fresh nonce, inline scripts
 * carry it, and there is no `unsafe-inline` for scripts — so injected markup
 * can't execute. `strict-dynamic` lets the nonced Next.js bootstrap load the
 * rest of the chunks. Dev keeps `unsafe-inline`/`unsafe-eval` + ws: because
 * Turbopack HMR injects un-nonced inline scripts and evaluates code; a nonce
 * next to `unsafe-inline` would make browsers ignore `unsafe-inline`.
 *
 * style-src stays `unsafe-inline`: Tailwind, the theme injector, and libraries
 * emit inline styles that can't practically be nonced. Styles can't exfiltrate
 * or execute, so this is the accepted trade-off.
 */
function buildCsp(nonce: string): string {
  const scriptSrc = isDev
    ? "script-src 'self' 'unsafe-inline' 'unsafe-eval'"
    : `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'`
  const connectSrc = isDev
    ? "connect-src 'self' https://api.calendly.com ws: wss:"
    : "connect-src 'self' https://api.calendly.com"
  return [
    "default-src 'self'",
    scriptSrc,
    "style-src 'self' 'unsafe-inline'",
    "font-src 'self' data:",
    "img-src 'self' data: blob: https:",
    "media-src 'self'",
    connectSrc,
    "frame-src 'self' https://calendly.com https://*.calendly.com",
    "frame-ancestors 'none'",
    "form-action 'self'",
    "base-uri 'self'",
    "object-src 'none'",
    // WebKit upgrades loopback asset URLs too; the HTTP dev server has no TLS.
    // Keep transport upgrading on the HTTPS production deployment.
    ...(isDev ? [] : ['upgrade-insecure-requests']),
  ].join('; ')
}

export default auth(async (req) => {
  const { pathname } = req.nextUrl

  // Uppercase image extensions do not match the static-file matcher below.
  // Next's internal image optimizer sends no user agent, so applying the bot
  // check to those public files turns valid .JPG photographs into 400 errors.
  // Keep this exemption restricted to the two public image directories.
  if (
    /^\/(?:images|uploads)\//.test(pathname) &&
    /\.(?:png|jpe?g|gif|svg|webp|avif|ico)$/i.test(pathname)
  ) {
    return NextResponse.next()
  }

  // Honeypot: only bots ignoring robots.txt reach /trap — 403 them.
  if (pathname.startsWith('/trap')) {
    return new NextResponse('Forbidden', { status: 403 })
  }

  // Block empty-UA and known scraper/AI-training crawlers.
  const ua = (req.headers.get('user-agent') || '').toLowerCase()
  if (!ua || BAD_BOTS.some((bot) => ua.includes(bot))) {
    return new NextResponse('Forbidden', { status: 403 })
  }

  const isLogin = pathname === '/admin/login'
  const isAdmin = pathname.startsWith('/admin')
  const isAdminApi = pathname.startsWith('/api/admin')
  const authenticated = isAdminSession(req.auth)

  // Protect admin API routes
  if (isAdminApi && !authenticated) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Redirect unauthenticated users to login
  if (isAdmin && !isLogin && !authenticated) {
    const loginUrl = new URL('/admin/login', req.url)
    loginUrl.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Redirect authenticated users away from login page
  if (isLogin && authenticated) {
    return NextResponse.redirect(new URL('/admin', req.url))
  }

  // Fresh per-request nonce. Exposed to Server Components via the x-nonce
  // request header (read with headers()), and set in the CSP for this response.
  // Next.js reads the nonce from the CSP header and applies it to its own
  // framework scripts automatically.
  const bytes = new Uint8Array(16)
  crypto.getRandomValues(bytes)
  const nonce = btoa(String.fromCharCode(...bytes))

  const requestHeaders = new Headers(req.headers)
  requestHeaders.set('x-nonce', nonce)
  // Never trust a caller-supplied copy of the header the layout uses for the admin notice.
  requestHeaders.delete('x-maintenance-preview')

  const maintenance = isMaintainedPath(pathname) ? await getMaintenanceState() : null
  if (maintenance?.enabled && !authenticated) {
    const res = NextResponse.rewrite(new URL('/maintenance', req.url), {
      request: { headers: requestHeaders },
      status: 503,
    })
    res.headers.set('Retry-After', '1800')
    res.headers.set('Cache-Control', 'no-store')
    res.headers.set('Content-Security-Policy', buildCsp(nonce))
    return res
  }
  if (maintenance?.enabled) requestHeaders.set('x-maintenance-preview', '1')

  const res = NextResponse.next({ request: { headers: requestHeaders } })
  res.headers.set('Content-Security-Policy', buildCsp(nonce))
  return res
})

export const config = {
  // Run on every document/route so each HTML response gets a nonce + CSP.
  // Skip Next internals and static asset files (no inline scripts, and this
  // avoids paying the middleware cost per asset).
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|svg|webp|avif|ico|css|js|txt|xml|woff2?|ttf|map)$).*)',
  ],
}
