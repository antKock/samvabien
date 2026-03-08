import { NextRequest, NextResponse } from 'next/server'

const COOKIE_NAME = 'pousse_session'
const MAX_AGE = 365 * 24 * 60 * 60 // ~1 year in seconds

export function setAuthCookie(response: NextResponse, token: string): void {
  response.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: MAX_AGE,
    path: '/',
  })
}

export function getAuthCookie(request: NextRequest): string | undefined {
  return request.cookies.get(COOKIE_NAME)?.value
}

export function clearAuthCookie(response: NextResponse): void {
  response.cookies.set(COOKIE_NAME, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0,
    path: '/',
  })
}
