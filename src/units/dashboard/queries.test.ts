import { describe, it, expect, beforeEach } from 'vitest'
import { prisma } from '../../lib/prisma'
import { resetDb } from '../../test/helpers/db'
import { getDashboardData } from './queries'

beforeEach(async () => { await resetDb() })

describe('getDashboardData', () => {
  it('buckets reviews by lifecycle stage with skip reasons', async () => {
    const client = await prisma.client.create({ data: { businessName: 'ACME', email: 'dash@test.com' } })
    await prisma.review.create({ data: { clientId: client.id, externalReviewId: 'g-1', authorName: 'X', rating: 1, text: 'legit complaint', state: 'SKIPPED' } })
    await prisma.review.create({ data: { clientId: client.id, externalReviewId: 'g-2', authorName: 'Y', rating: 1, text: 'fake', state: 'BILLED' } })

    const data = await getDashboardData(client.id)
    expect(data.counts.SKIPPED).toBe(1)
    expect(data.counts.BILLED).toBe(1)
    expect(data.skipped[0].text).toBe('legit complaint')
  })
})
