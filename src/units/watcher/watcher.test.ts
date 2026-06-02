import { describe, it, expect, beforeEach } from 'vitest'
import { prisma } from '../../lib/prisma'
import { resetDb } from '../../test/helpers/db'
import { MockGbpClient } from './gbp-client.mock'
import { syncReviews } from './watcher'

beforeEach(async () => { await resetDb() })

describe('syncReviews', () => {
  it('imports new reviews and does not duplicate on re-sync', async () => {
    const client = await prisma.client.create({ data: { businessName: 'ACME', email: 'a@acme.com', gbpLocationId: 'loc-1' } })
    const gbp = new MockGbpClient([
      { externalReviewId: 'g-1', authorName: 'A', rating: 1, text: 'fake competitor' },
      { externalReviewId: 'g-2', authorName: 'B', rating: 5, text: 'great job' },
    ])
    const first = await syncReviews(client.id, gbp)
    expect(first.imported).toBe(2)
    const second = await syncReviews(client.id, gbp)
    expect(second.imported).toBe(0) // idempotent
    expect(await prisma.review.count({ where: { clientId: client.id } })).toBe(2)
  })
})
