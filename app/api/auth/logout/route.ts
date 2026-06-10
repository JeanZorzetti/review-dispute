import { NextResponse } from 'next/server'
import { clearClientSessionCookie } from '@/src/lib/client-auth'

export async function POST(request: Request) {
  await clearClientSessionCookie()
  return NextResponse.redirect(new URL('/', request.url), { status: 303 })
}
