import { NextResponse } from 'next/server'
import { prisma } from '@/src/lib/prisma'
import { isAuthorizedCron } from '../cron-auth'
import { GoogleGbpClient } from '@/src/units/watcher/gbp-client.google'
import { reconcile } from '@/src/units/tracker/tracker'
import { chargeRemovals } from '@/src/units/billing/billing'
import { stripe } from '@/src/lib/stripe'

export async function POST(request: Request) {
  if (!isAuthorizedCron(request)) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  const clients = await prisma.client.findMany({ where: { gbpLocationId: { not: null } } })
  for (const c of clients) {
    const tokens = c.oauthTokens as { access_token?: string } | null
    if (!tokens?.access_token) continue
    await reconcile(c.id, new GoogleGbpClient(tokens.access_token))
    await chargeRemovals(c.id, stripe())
  }
  return NextResponse.json({ ok: true })
}
