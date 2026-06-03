import { describe, it, expect, beforeEach } from 'vitest'
import { prisma } from '../../lib/prisma'
import { resetDb } from '../../test/helpers/db'
import { handleStripeEvent } from './webhook'

beforeEach(async () => { await resetDb() })

async function seedIssuedCharge(invoiceId: string) {
  const client = await prisma.client.create({ data: { businessName: 'ACME', email: `wh-${invoiceId}@b.com` } })
  const review = await prisma.review.create({ data: { clientId: client.id, externalReviewId: 'g-1', authorName: 'X', rating: 1, text: 't', state: 'BILLED' } })
  const dispute = await prisma.dispute.create({ data: { reviewId: review.id, violationType: 'OFF_TOPIC', caseStrength: 'HIGH', argument: 'a' } })
  const outcome = await prisma.outcome.create({ data: { disputeId: dispute.id, result: 'REMOVED', confirmations: 2 } })
  return prisma.charge.create({ data: { outcomeId: outcome.id, amountCents: 49900, stripeChargeId: invoiceId, stripeInvoiceId: invoiceId, status: 'issued' } })
}

describe('handleStripeEvent', () => {
  it('invoice.paid marks the matching charge paid', async () => {
    await seedIssuedCharge('in_paid_1')
    await handleStripeEvent({ type: 'invoice.paid', data: { object: { id: 'in_paid_1' } } } as never)
    const charge = await prisma.charge.findFirstOrThrow({ where: { stripeInvoiceId: 'in_paid_1' } })
    expect(charge.status).toBe('paid')
  })

  it('is idempotent: a second invoice.paid is a no-op', async () => {
    await seedIssuedCharge('in_paid_2')
    await handleStripeEvent({ type: 'invoice.paid', data: { object: { id: 'in_paid_2' } } } as never)
    await handleStripeEvent({ type: 'invoice.paid', data: { object: { id: 'in_paid_2' } } } as never)
    const charge = await prisma.charge.findFirstOrThrow({ where: { stripeInvoiceId: 'in_paid_2' } })
    expect(charge.status).toBe('paid')
  })

  it('ignores unrelated event types', async () => {
    await seedIssuedCharge('in_x')
    await handleStripeEvent({ type: 'customer.created', data: { object: { id: 'cus_x' } } } as never)
    const charge = await prisma.charge.findFirstOrThrow({ where: { stripeInvoiceId: 'in_x' } })
    expect(charge.status).toBe('issued')
  })
})
