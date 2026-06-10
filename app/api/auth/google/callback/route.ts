import { NextResponse } from 'next/server'
import { timingSafeEqual } from 'crypto'
import { cookies } from 'next/headers'
import { prisma } from '@/src/lib/prisma'
import { exchangeCode, fetchUserInfo, saveClientTokens, OAUTH_STATE_COOKIE } from '@/src/lib/google-oauth'
import { setClientSessionCookie } from '@/src/lib/client-auth'
import { sendEmail } from '@/src/lib/email'
import { welcomeEmail } from '@/src/lib/email-templates'

function safeEqual(a: string, b: string): boolean {
  const ba = Buffer.from(a)
  const bb = Buffer.from(b)
  return ba.length === bb.length && timingSafeEqual(ba, bb)
}

export async function GET(request: Request) {
  const url = new URL(request.url)
  const code = url.searchParams.get('code')
  const state = url.searchParams.get('state')
  if (!code) return NextResponse.json({ error: 'missing code' }, { status: 400 })

  const store = await cookies()
  const expectedState = store.get(OAUTH_STATE_COOKIE)?.value
  if (!state || !expectedState || !safeEqual(state, expectedState)) {
    return NextResponse.json({ error: 'invalid oauth state' }, { status: 400 })
  }
  store.delete(OAUTH_STATE_COOKIE)

  let clientId: string
  try {
    const tokens = await exchangeCode(code)
    if (!tokens.access_token) throw new Error('token exchange returned no access_token')
    const { email, name } = await fetchUserInfo(tokens.access_token)

    const isNew = !(await prisma.client.findUnique({ where: { email }, select: { id: true } }))
    const client = await prisma.client.upsert({
      where: { email },
      create: { email, businessName: name ?? email },
      update: {},
    })
    clientId = client.id
    await saveClientTokens(client.id, tokens)
    await setClientSessionCookie(client.id)

    if (isNew) await sendEmail(welcomeEmail(email, client.businessName))
  } catch (e) {
    console.error('[oauth] callback failed:', e)
    return NextResponse.redirect(new URL('/?error=google_connect_failed', request.url))
  }

  return NextResponse.redirect(new URL(`/onboarding/billing?clientId=${clientId}`, request.url))
}
