import { describe, it, expect, beforeEach } from 'vitest'
import { prisma } from '../../lib/prisma'
import { resetDb } from '../../test/helpers/db'

beforeEach(async () => { await resetDb() })

describe('run-all operations', () => {
  it('runSyncAllClients skips clients with no token and returns a summary', async () => {
    await prisma.client.create({ data: { businessName: 'NoToken', email: 'n@ra.com', gbpLocationId: 'loc-x' } })
    const { runSyncAllClients } = await import('./run-all')
    const result = await runSyncAllClients()
    expect(result.clients).toBe(1)
    expect(result.synced).toBe(0)
  })

  it('runReconcileAllClients skips clients with no token', async () => {
    await prisma.client.create({ data: { businessName: 'NoToken2', email: 'n2@ra.com', gbpLocationId: 'loc-y' } })
    const { runReconcileAllClients } = await import('./run-all')
    const result = await runReconcileAllClients()
    expect(result.clients).toBe(1)
  })
})
