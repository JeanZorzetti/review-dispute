import { describe, it, expect, beforeEach } from 'vitest'
import { prisma } from '../../lib/prisma'
import { resetDb } from '../../test/helpers/db'

beforeEach(async () => { await resetDb() })

describe('billing schema', () => {
  it('persists billingMethod and stripeCustomerId on Client', async () => {
    const c = await prisma.client.create({
      data: { businessName: 'ACME', email: 'a@sb.com', billingMethod: 'card', stripeCustomerId: 'cus_123' },
    })
    const found = await prisma.client.findUniqueOrThrow({ where: { id: c.id } })
    expect(found.billingMethod).toBe('card')
    expect(found.stripeCustomerId).toBe('cus_123')
  })

  it('defaults Charge.status to issued and stores stripeInvoiceId', async () => {
    const client = await prisma.client.create({ data: { businessName: 'B', email: 'b@sb.com' } })
    const review = await prisma.review.create({ data: { clientId: client.id, externalReviewId: 'g-1', authorName: 'X', rating: 1, text: 't', state: 'REMOVED' } })
    const dispute = await prisma.dispute.create({ data: { reviewId: review.id, violationType: 'OFF_TOPIC', caseStrength: 'HIGH', argument: 'a' } })
    const outcome = await prisma.outcome.create({ data: { disputeId: dispute.id, result: 'REMOVED', confirmations: 2 } })
    const charge = await prisma.charge.create({
      data: { outcomeId: outcome.id, amountCents: 49900, stripeChargeId: 'pi_1', stripeInvoiceId: 'in_1' },
    })
    expect(charge.status).toBe('issued')
    expect(charge.stripeInvoiceId).toBe('in_1')
  })
})
