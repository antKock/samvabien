import { NextRequest, NextResponse } from 'next/server'
import { verifyJwt } from '@/lib/auth/jwt'

const PUBLIC_PATHS = ['/', '/onboarding', '/join', '/api/profiles', '/api/join']

function isPublicPath(pathname: string): boolean {
  if (PUBLIC_PATHS.includes(pathname)) return true
  // /join/[code] dynamic route
  if (pathname.startsWith('/join/')) return true
  // Static assets and Next.js internals
  if (pathname.startsWith('/_next') || pathname.startsWith('/icons') || pathname.includes('.')) return true
  return false
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (isPublicPath(pathname)) {
    return NextResponse.next()
  }

  // Demo mode bypass — no auth required (pages only, never API routes)
  if (!pathname.startsWith('/api/') && request.nextUrl.searchParams.get('demo') === 'true') {
    return NextResponse.next()
  }

  const token = request.cookies.get('pousse_session')?.value
  if (!token) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  const payload = await verifyJwt(token)
  if (!payload) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
