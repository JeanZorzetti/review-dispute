import { describe, it, expect, beforeEach } from 'vitest'
import { prisma } from '../../lib/prisma'
import { resetDb } from '../../test/helpers/db'
import { ReviewState } from '../../domain/states'
import { markDenied } from './mark-denied'

beforeEach(async () => { await resetDb() })

describe('markDenied', () => {
  it('moves SUBMITTED → DENIED → CLOSED_LOST and records a DENIED outcome with no charge', async () => {
    const client = await prisma.client.create({ data: { businessName: 'ACME', email: 'a@denied.com' } })
    const review = await prisma.review.create({ data: { clientId: client.id, externalReviewId: 'g-1', authorName: 'X', rating: 1, text: 't', state: ReviewState.SUBMITTED } })
    const dispute = await prisma.dispute.create({ data: { reviewId: review.id, violationType: 'OFF_TOPIC', caseStrength: 'HIGH', argument: 'a', submittedAt: new Date() } })

    await markDenied(dispute.id)

    const r = await prisma.review.findUniqueOrThrow({ where: { id: review.id } })
    expect(r.state).toBe(ReviewState.CLOSED_LOST)
    const outcome = await prisma.outcome.findFirstOrThrow({ where: { disputeId: dispute.id } })
    expect(outcome.result).toBe('DENIED')
    expect(await prisma.charge.count()).toBe(0)
  })
})
