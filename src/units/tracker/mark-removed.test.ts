import { describe, it, expect, beforeEach } from 'vitest'
import { prisma } from '../../lib/prisma'
import { resetDb } from '../../test/helpers/db'
import { ReviewState } from '../../domain/states'
import { markRemovedManually } from './mark-removed'

beforeEach(async () => { await resetDb() })

describe('markRemovedManually', () => {
  it('moves SUBMITTED → REMOVED and creates a REMOVED outcome', async () => {
    const client = await prisma.client.create({ data: { businessName: 'ACME', email: 'a@mr.com' } })
    const review = await prisma.review.create({ data: { clientId: client.id, externalReviewId: 'g-1', authorName: 'X', rating: 1, text: 't', state: ReviewState.SUBMITTED } })
    const dispute = await prisma.dispute.create({ data: { reviewId: review.id, violationType: 'OFF_TOPIC', caseStrength: 'HIGH', argument: 'a', submittedAt: new Date() } })
    await markRemovedManually(dispute.id)
    const r = await prisma.review.findUniqueOrThrow({ where: { id: review.id } })
    expect(r.state).toBe(ReviewState.REMOVED)
    const outcome = await prisma.outcome.findFirstOrThrow({ where: { disputeId: dispute.id } })
    expect(outcome.result).toBe('REMOVED')
  })

  it('reuses an existing provisional outcome instead of duplicating', async () => {
    const client = await prisma.client.create({ data: { businessName: 'ACME', email: 'b@mr.com' } })
    const review = await prisma.review.create({ data: { clientId: client.id, externalReviewId: 'g-2', authorName: 'X', rating: 1, text: 't', state: ReviewState.SUBMITTED } })
    const dispute = await prisma.dispute.create({ data: { reviewId: review.id, violationType: 'OFF_TOPIC', caseStrength: 'HIGH', argument: 'a', submittedAt: new Date() } })
    await prisma.outcome.create({ data: { disputeId: dispute.id, result: 'REMOVED', confirmations: 1 } })
    await markRemovedManually(dispute.id)
    expect(await prisma.outcome.count({ where: { disputeId: dispute.id } })).toBe(1)
    const r = await prisma.review.findUniqueOrThrow({ where: { id: review.id } })
    expect(r.state).toBe(ReviewState.REMOVED)
  })

  it('rejects when the review is not SUBMITTED', async () => {
    const client = await prisma.client.create({ data: { businessName: 'ACME', email: 'c@mr.com' } })
    const review = await prisma.review.create({ data: { clientId: client.id, externalReviewId: 'g-3', authorName: 'X', rating: 1, text: 't', state: ReviewState.READY } })
    const dispute = await prisma.dispute.create({ data: { reviewId: review.id, violationType: 'OFF_TOPIC', caseStrength: 'HIGH', argument: 'a' } })
    await expect(markRemovedManually(dispute.id)).rejects.toThrow(/illegal transition/i)
  })
})
