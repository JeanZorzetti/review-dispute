import { prisma } from '../../lib/prisma'
import { GoogleGbpClient } from '../watcher/gbp-client.google'
import { syncReviews } from '../watcher/watcher'
import { runTriage } from '../triage/run-triage'
import { reconcile } from '../tracker/tracker'
import { chargeRemovals } from '../billing/billing'
import { llm } from '../../lib/llm'
import { stripe } from '../../lib/stripe'

export async function runSyncAllClients(): Promise<{ clients: number; synced: number }> {
  const clients = await prisma.client.findMany({ where: { gbpLocationId: { not: null } } })
  let synced = 0
  for (const c of clients) {
    const tokens = c.oauthTokens as { access_token?: string } | null
    if (!tokens?.access_token) continue
    const gbp = new GoogleGbpClient(tokens.access_token)
    await syncReviews(c.id, gbp)
    await runTriage(c.id, llm())
    synced++
  }
  return { clients: clients.length, synced }
}

export async function runReconcileAllClients(): Promise<{ clients: number; reconciled: number }> {
  const clients = await prisma.client.findMany({ where: { gbpLocationId: { not: null } } })
  let reconciled = 0
  for (const c of clients) {
    const tokens = c.oauthTokens as { access_token?: string } | null
    if (!tokens?.access_token) continue
    await reconcile(c.id, new GoogleGbpClient(tokens.access_token))
    await chargeRemovals(c.id, stripe())
    reconciled++
  }
  return { clients: clients.length, reconciled }
}
