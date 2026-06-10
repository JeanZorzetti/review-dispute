import { prisma } from '../../lib/prisma'
import { GoogleGbpClient } from '../watcher/gbp-client.google'
import type { GbpClient } from '../watcher/gbp-client'
import { syncReviews } from '../watcher/watcher'
import { runTriage } from '../triage/run-triage'
import { reconcile } from '../tracker/tracker'
import { chargeRemovals } from '../billing/billing'
import { llm } from '../../lib/llm'
import { stripe } from '../../lib/stripe'
import { getValidAccessToken } from '../../lib/google-oauth'

export type RunError = { clientId: string; error: string }

// One bad client (revoked grant, GBP hiccup) must never abort the run for
// everyone else: each client is processed inside its own try/catch and
// failures are returned for the cron route to alert on.

type GbpFactory = (accessToken: string) => GbpClient
const defaultGbpFactory: GbpFactory = (token) => new GoogleGbpClient(token)

export async function runSyncAllClients(
  gbpFactory: GbpFactory = defaultGbpFactory
): Promise<{ clients: number; synced: number; errors: RunError[] }> {
  const clients = await prisma.client.findMany({ where: { gbpLocationId: { not: null } } })
  let synced = 0
  const errors: RunError[] = []
  for (const c of clients) {
    try {
      const token = await getValidAccessToken(c)
      if (!token) continue
      await syncReviews(c.id, gbpFactory(token))
      await runTriage(c.id, llm())
      synced++
    } catch (e) {
      errors.push({ clientId: c.id, error: e instanceof Error ? e.message : String(e) })
    }
  }
  return { clients: clients.length, synced, errors }
}

export async function runReconcileAllClients(
  gbpFactory: GbpFactory = defaultGbpFactory
): Promise<{ clients: number; reconciled: number; errors: RunError[] }> {
  const clients = await prisma.client.findMany({ where: { gbpLocationId: { not: null } } })
  let reconciled = 0
  const errors: RunError[] = []
  for (const c of clients) {
    try {
      const token = await getValidAccessToken(c)
      if (!token) continue
      await reconcile(c.id, gbpFactory(token))
      await chargeRemovals(c.id, stripe())
      reconciled++
    } catch (e) {
      errors.push({ clientId: c.id, error: e instanceof Error ? e.message : String(e) })
    }
  }
  return { clients: clients.length, reconciled, errors }
}
