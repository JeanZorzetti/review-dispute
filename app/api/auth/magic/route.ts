import { NextResponse } from 'next/server'
import { verifyMagicToken, setClientSessionCookie } from '@/src/lib/client-auth'

export async function GET(request: Request) {
  const token = new URL(request.url).searchParams.get('token') ?? undefined
  const clientId = verifyMagicToken(token)
  if (!clientId) return NextResponse.redirect(new URL('/login?error=expired', request.url))
  await setClientSessionCookie(clientId)
  return NextResponse.redirect(new URL('/dashboard', request.url))
}
