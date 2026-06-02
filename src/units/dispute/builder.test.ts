import { describe, it, expect, beforeEach } from 'vitest'
import { prisma } from '../../lib/prisma'
import { resetDb } from '../../test/helpers/db'
import { ReviewState } from '../../domain/states'
import { buildDisputes } from './builder'

beforeEach(async () => { await resetDb() })

describe('buildDisputes', () => {
  it('creates a Dispute and moves review to READY with citation + argument', async () => {
    const client = await prisma.client.create({ data: { businessName: 'ACME', email: 'a@acme.com' } })
    const review = await prisma.review.create({ data: { clientId: client.id, externalReviewId: 'g-1', authorName: 'Rival', rating: 1, text: 'competitor scam', state: ReviewState.ELIGIBLE } })
    await prisma.classificationLog.create({ data: { reviewId: review.id, violationType: 'CONFLICT_OF_INTEREST', caseStrength: 'HIGH', confidence: 0.95 } })

    await buildDisputes(client.id)

    const updated = await prisma.review.findUniqueOrThrow({ where: { id: review.id }, include: { dispute: true } })
    expect(updated.state).toBe(ReviewState.READY)
    expect(updated.dispute?.violationType).toBe('CONFLICT_OF_INTEREST')
    expect(updated.dispute?.argument).toMatch(/Conflict of interest/i)
  })
})
