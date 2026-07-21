import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'

export default auth((req) => {
  const { pathname } = req.nextUrl
  const isLogin = pathname === '/admin/login'
  const isAdmin = pathname.startsWith('/admin')
  const isAdminApi = pathname.startsWith('/api/admin')

  // Protect admin API routes
  if (isAdminApi && !req.auth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Redirect unauthenticated users to login
  if (isAdmin && !isLogin && !req.auth) {
    const loginUrl = new URL('/admin/login', req.url)
    loginUrl.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Redirect authenticated users away from login page
  if (isLogin && req.auth) {
    return NextResponse.redirect(new URL('/admin', req.url))
  }

  return NextResponse.next()  
})

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
}