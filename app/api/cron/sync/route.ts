import { NextResponse } from 'next/server'
import { prisma } from '@/src/lib/prisma'
import { isAuthorizedCron } from '../cron-auth'
import { GoogleGbpClient } from '@/src/units/watcher/gbp-client.google'
import { syncReviews } from '@/src/units/watcher/watcher'
import { runTriage } from '@/src/units/triage/run-triage'
import { llm } from '@/src/lib/llm'

export async function POST(request: Request) {
  if (!isAuthorizedCron(request)) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  const clients = await prisma.client.findMany({ where: { gbpLocationId: { not: null } } })
  for (const c of clients) {
    const tokens = c.oauthTokens as { access_token?: string } | null
    if (!tokens?.access_token) continue
    const gbp = new GoogleGbpClient(tokens.access_token)
    await syncReviews(c.id, gbp)
    await runTriage(c.id, llm())
  }
  return NextResponse.json({ ok: true, clients: clients.length })
}
