import { describe, it, expect, beforeEach } from 'vitest'
import { prisma } from '../../lib/prisma'
import { resetDb } from '../../test/helpers/db'
import { ReviewState } from '../../domain/states'
import { markSubmitted } from './executor'

beforeEach(async () => { await resetDb() })

describe('markSubmitted', () => {
  it('moves READY → SUBMITTED and stamps submittedAt', async () => {
    const client = await prisma.client.create({ data: { businessName: 'ACME', email: 'a@exec.com' } })
    const review = await prisma.review.create({ data: { clientId: client.id, externalReviewId: 'g-1', authorName: 'X', rating: 1, text: 't', state: ReviewState.READY } })
    const dispute = await prisma.dispute.create({ data: { reviewId: review.id, violationType: 'OFF_TOPIC', caseStrength: 'HIGH', argument: 'a' } })

    await markSubmitted(dispute.id)

    const updated = await prisma.review.findUniqueOrThrow({ where: { id: review.id }, include: { dispute: true } })
    expect(updated.state).toBe(ReviewState.SUBMITTED)
    expect(updated.dispute?.submittedAt).toBeInstanceOf(Date)
  })

  it('refuses to submit a dispute whose review is not READY', async () => {
    const client = await prisma.client.create({ data: { businessName: 'ACME', email: 'b@exec.com' } })
    const review = await prisma.review.create({ data: { clientId: client.id, externalReviewId: 'g-2', authorName: 'X', rating: 1, text: 't', state: ReviewState.SKIPPED } })
    const dispute = await prisma.dispute.create({ data: { reviewId: review.id, violationType: 'OFF_TOPIC', caseStrength: 'HIGH', argument: 'a' } })
    await expect(markSubmitted(dispute.id)).rejects.toThrow(/illegal transition/i)
  })
})
