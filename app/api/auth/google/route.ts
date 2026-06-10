import { NextResponse } from 'next/server'
import { randomBytes } from 'crypto'
import { OAUTH_STATE_COOKIE } from '@/src/lib/google-oauth'

export async function GET() {
  const state = randomBytes(16).toString('hex')
  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID!,
    redirect_uri: process.env.GOOGLE_REDIRECT_URI!,
    response_type: 'code',
    access_type: 'offline',
    prompt: 'consent',
    // openid+email let the callback identify the user; business.manage is the GBP scope.
    scope: 'openid email https://www.googleapis.com/auth/business.manage',
    state,
  })
  const res = NextResponse.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params}`)
  res.cookies.set(OAUTH_STATE_COOKIE, state, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 600,
  })
  return res
}
