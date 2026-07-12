import { NextResponse } from 'next/server'
import { verifyMagicToken, setClientSessionCookie } from '@/src/lib/client-auth'
import { SITE_URL } from '@/src/lib/site'

// Redirects use SITE_URL, not request.url: behind the reverse proxy request.url
// resolves to the internal bind (0.0.0.0:3000) and the redirect dead-ends.
export async function GET(request: Request) {
  const token = new URL(request.url).searchParams.get('token') ?? undefined
  const clientId = verifyMagicToken(token)
  if (!clientId) return NextResponse.redirect(new URL('/login?error=expired', SITE_URL))
  await setClientSessionCookie(clientId)
  return NextResponse.redirect(new URL('/dashboard', SITE_URL))
}
