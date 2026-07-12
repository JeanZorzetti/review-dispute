import { NextResponse } from 'next/server'
import { clearClientSessionCookie } from '@/src/lib/client-auth'
import { SITE_URL } from '@/src/lib/site'

// Redirects use SITE_URL, not request.url: behind the reverse proxy request.url
// resolves to the internal bind (0.0.0.0:3000) and the redirect dead-ends.
export async function POST() {
  await clearClientSessionCookie()
  return NextResponse.redirect(new URL('/', SITE_URL), { status: 303 })
}
