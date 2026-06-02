import { describe, it, expect, beforeEach } from 'vitest'
import { prisma } from '../../lib/prisma'
import { resetDb } from '../../test/helpers/db'
import { removalRateByViolationType } from './learning'

beforeEach(async () => { await resetDb() })

async function seedOutcome(email: string, ext: string, violation: string, result: 'REMOVED' | 'DENIED') {
  const client = await prisma.client.create({ data: { businessName: 'ACME', email } })
  const review = await prisma.review.create({ data: { clientId: client.id, externalReviewId: ext, authorName: 'X', rating: 1, text: 't', state: result === 'REMOVED' ? 'BILLED' : 'CLOSED_LOST' } })
  const dispute = await prisma.dispute.create({ data: { reviewId: review.id, violationType: violation, caseStrength: 'HIGH', argument: 'a' } })
  await prisma.outcome.create({ data: { disputeId: dispute.id, result, confirmations: result === 'REMOVED' ? 2 : 0 } })
}

describe('removalRateByViolationType', () => {
  it('computes removed/total per violation type', async () => {
    await seedOutcome('a@learn.com', 'g-1', 'OFF_TOPIC', 'REMOVED')
    await seedOutcome('b@learn.com', 'g-2', 'OFF_TOPIC', 'DENIED')
    await seedOutcome('c@learn.com', 'g-3', 'CONFLICT_OF_INTEREST', 'REMOVED')

    const rates = await removalRateByViolationType()
    expect(rates.OFF_TOPIC).toBeCloseTo(0.5)
    expect(rates.CONFLICT_OF_INTEREST).toBeCloseTo(1.0)
  })
})
