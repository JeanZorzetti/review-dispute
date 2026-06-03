import { describe, it, expect, beforeEach } from 'vitest'
import { prisma } from '@/src/lib/prisma'
import { resetDb } from '@/src/test/helpers/db'
import { ReviewState } from '@/src/domain/states'
import { getDisputesByState, getClientsWithCounts } from './queries'

beforeEach(async () => { await resetDb() })

describe('admin queries', () => {
  it('getDisputesByState returns disputes grouped with review + argument', async () => {
    const client = await prisma.client.create({ data: { businessName: 'ACME', email: 'a@q.com' } })
    const review = await prisma.review.create({ data: { clientId: client.id, externalReviewId: 'g-1', authorName: 'Rival', rating: 1, text: 'fake', state: ReviewState.READY } })
    await prisma.dispute.create({ data: { reviewId: review.id, violationType: 'CONFLICT_OF_INTEREST', caseStrength: 'HIGH', argument: 'the case' } })
    const grouped = await getDisputesByState()
    expect(grouped.READY).toHaveLength(1)
    expect(grouped.READY[0].argument).toBe('the case')
    expect(grouped.READY[0].businessName).toBe('ACME')
    expect(grouped.READY[0].reviewText).toBe('fake')
  })

  it('getClientsWithCounts returns per-state counts and connection status', async () => {
    const client = await prisma.client.create({ data: { businessName: 'ACME', email: 'b@q.com', gbpLocationId: 'loc-1', oauthTokens: { access_token: 't' } } })
    await prisma.review.create({ data: { clientId: client.id, externalReviewId: 'g-2', authorName: 'X', rating: 1, text: 't', state: ReviewState.READY } })
    await prisma.review.create({ data: { clientId: client.id, externalReviewId: 'g-3', authorName: 'Y', rating: 1, text: 't', state: ReviewState.BILLED } })
    const rows = await getClientsWithCounts()
    expect(rows).toHaveLength(1)
    expect(rows[0].connected).toBe(true)
    expect(rows[0].counts.READY).toBe(1)
    expect(rows[0].counts.BILLED).toBe(1)
  })
})
