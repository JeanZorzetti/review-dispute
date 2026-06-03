import { NextResponse } from 'next/server'
import { prisma } from '@/src/lib/prisma'

export async function GET(request: Request) {
  const code = new URL(request.url).searchParams.get('code')
  if (!code) return NextResponse.json({ error: 'missing code' }, { status: 400 })

  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      redirect_uri: process.env.GOOGLE_REDIRECT_URI!,
      grant_type: 'authorization_code',
    }),
  })
  const tokens = await tokenRes.json()
  const email = new URL(request.url).searchParams.get('state') ?? 'a@acme.com'
  const updated = await prisma.client.update({ where: { email }, data: { oauthTokens: tokens } })
  return NextResponse.redirect(new URL(`/onboarding/billing?clientId=${updated.id}`, request.url))
}
