import { describe, it, expect, beforeEach, vi } from 'vitest'
import { prisma } from '../../lib/prisma'
import { resetDb } from '../../test/helpers/db'
import { ReviewState } from '../../domain/states'
import { chargeRemovals } from './billing'

beforeEach(async () => { await resetDb() })

const fakeStripe = { createCharge: vi.fn(async () => ({ id: 'ch_test_123' })) }

describe('chargeRemovals', () => {
  it('charges once per REMOVED review and moves it to BILLED', async () => {
    const client = await prisma.client.create({ data: { businessName: 'ACME', email: 'a@billing.com', pricePerRemovalCents: 9900 } })
    const review = await prisma.review.create({ data: { clientId: client.id, externalReviewId: 'g-1', authorName: 'X', rating: 1, text: 't', state: ReviewState.REMOVED } })
    const dispute = await prisma.dispute.create({ data: { reviewId: review.id, violationType: 'OFF_TOPIC', caseStrength: 'HIGH', argument: 'a', submittedAt: new Date() } })
    await prisma.outcome.create({ data: { disputeId: dispute.id, result: 'REMOVED', confirmations: 2 } })

    await chargeRemovals(client.id, fakeStripe)

    expect(fakeStripe.createCharge).toHaveBeenCalledTimes(1)
    expect(fakeStripe.createCharge).toHaveBeenCalledWith(expect.objectContaining({ amountCents: 9900 }))
    const r = await prisma.review.findUniqueOrThrow({ where: { id: review.id } })
    expect(r.state).toBe(ReviewState.BILLED)
    expect(await prisma.charge.count()).toBe(1)

    // idempotent: running again charges nothing more
    fakeStripe.createCharge.mockClear()
    await chargeRemovals(client.id, fakeStripe)
    expect(fakeStripe.createCharge).toHaveBeenCalledTimes(0)
  })

  it('never charges a DENIED/CLOSED_LOST review', async () => {
    const client = await prisma.client.create({ data: { businessName: 'ACME', email: 'b@billing.com' } })
    const review = await prisma.review.create({ data: { clientId: client.id, externalReviewId: 'g-2', authorName: 'X', rating: 1, text: 't', state: ReviewState.CLOSED_LOST } })
    await prisma.dispute.create({ data: { reviewId: review.id, violationType: 'OFF_TOPIC', caseStrength: 'HIGH', argument: 'a' } })
    await chargeRemovals(client.id, fakeStripe)
    expect(await prisma.charge.count()).toBe(0)
  })
})
