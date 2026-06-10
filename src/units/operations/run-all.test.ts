import { describe, it, expect, beforeEach } from 'vitest'
import { prisma } from '../../lib/prisma'
import { resetDb } from '../../test/helpers/db'
import { encryptJson } from '../../lib/crypto'
import type { GbpClient } from '../watcher/gbp-client'

beforeEach(async () => {
  process.env.TOKEN_ENCRYPTION_KEY ??= 'c'.repeat(64)
  await resetDb()
})

function freshTokens() {
  return encryptJson({ access_token: 'ok', refresh_token: 'r', expiry_date: Date.now() + 3_600_000 })
}

describe('run-all operations', () => {
  it('runSyncAllClients skips clients with no token and returns a summary', async () => {
    await prisma.client.create({ data: { businessName: 'NoToken', email: 'n@ra.com', gbpLocationId: 'loc-x' } })
    const { runSyncAllClients } = await import('./run-all')
    const result = await runSyncAllClients()
    expect(result.clients).toBe(1)
    expect(result.synced).toBe(0)
    expect(result.errors).toEqual([])
  })

  it('runReconcileAllClients skips clients with no token', async () => {
    await prisma.client.create({ data: { businessName: 'NoToken2', email: 'n2@ra.com', gbpLocationId: 'loc-y' } })
    const { runReconcileAllClients } = await import('./run-all')
    const result = await runReconcileAllClients()
    expect(result.clients).toBe(1)
    expect(result.reconciled).toBe(0)
    expect(result.errors).toEqual([])
  })

  it('one failing client does not abort the sync run for the others', async () => {
    const bad = await prisma.client.create({
      data: { businessName: 'Bad', email: 'bad@ra.com', gbpLocationId: 'loc-bad', oauthTokens: freshTokens() },
    })
    await prisma.client.create({
      data: { businessName: 'Good', email: 'good@ra.com', gbpLocationId: 'loc-good', oauthTokens: freshTokens() },
    })

    const gbpFactory = (): GbpClient => ({
      listReviews: async (locationId: string) => {
        if (locationId === 'loc-bad') throw new Error('GBP API error 401')
        return []
      },
    })

    const { runSyncAllClients } = await import('./run-all')
    const result = await runSyncAllClients(gbpFactory)
    expect(result.clients).toBe(2)
    expect(result.synced).toBe(1)
    expect(result.errors).toEqual([{ clientId: bad.id, error: 'GBP API error 401' }])
  })

  it('one failing client does not abort the reconcile run for the others', async () => {
    await prisma.client.create({
      data: { businessName: 'Bad2', email: 'bad2@ra.com', gbpLocationId: 'loc-bad', oauthTokens: freshTokens() },
    })
    await prisma.client.create({
      data: { businessName: 'Good2', email: 'good2@ra.com', gbpLocationId: 'loc-good', oauthTokens: freshTokens() },
    })

    const gbpFactory = (): GbpClient => ({
      listReviews: async (locationId: string) => {
        if (locationId === 'loc-bad') throw new Error('boom')
        return []
      },
    })

    const { runReconcileAllClients } = await import('./run-all')
    const result = await runReconcileAllClients(gbpFactory)
    expect(result.clients).toBe(2)
    expect(result.reconciled).toBe(1)
    expect(result.errors).toHaveLength(1)
    expect(result.errors[0].error).toBe('boom')
  })
})
