import { describe, it, expect, beforeEach, vi } from 'vitest'
import { prisma } from '../../lib/prisma'
import { resetDb } from '../../test/helpers/db'
import { ReviewState } from '../../domain/states'
import { chargeRemovals } from './billing'
import type { StripeGateway } from '../../lib/stripe'

beforeEach(async () => { await resetDb() })

function mockGateway(over: Partial<StripeGateway> = {}): StripeGateway {
  return {
    getOrCreateCustomer: vi.fn(async () => 'cus_test'),
    createSetupIntent: vi.fn(async () => 'seti_secret'),
    chargeSavedCard: vi.fn(async () => ({ id: 'pi_test' })),
    defaultPaymentMethod: vi.fn(async () => 'pm_test'),
    createInvoice: vi.fn(async () => ({ invoiceId: 'in_test' })),
    verifyWebhook: vi.fn(),
    ...over,
  }
}

async function seedRemoved(email: string, billingMethod: string | null) {
  const client = await prisma.client.create({ data: { businessName: 'ACME', email, pricePerRemovalCents: 49900, billingMethod, stripeCustomerId: 'cus_test' } })
  const review = await prisma.review.create({ data: { clientId: client.id, externalReviewId: 'g-1', authorName: 'X', rating: 1, text: 't', state: ReviewState.REMOVED } })
  const dispute = await prisma.dispute.create({ data: { reviewId: review.id, violationType: 'OFF_TOPIC', caseStrength: 'HIGH', argument: 'a', submittedAt: new Date() } })
  await prisma.outcome.create({ data: { disputeId: dispute.id, result: 'REMOVED', confirmations: 2 } })
  return { client, review }
}

describe('chargeRemovals (branched)', () => {
  it('card method: charges the saved card and marks BILLED', async () => {
    const { client, review } = await seedRemoved('card@b.com', 'card')
    const gw = mockGateway()
    await chargeRemovals(client.id, gw)
    expect(gw.chargeSavedCard).toHaveBeenCalledOnce()
    expect(gw.createInvoice).not.toHaveBeenCalled()
    const r = await prisma.review.findUniqueOrThrow({ where: { id: review.id } })
    expect(r.state).toBe(ReviewState.BILLED)
    const charge = await prisma.charge.findFirstOrThrow()
    expect(charge.status).toBe('paid')
  })

  it('invoice method: creates an invoice and marks BILLED with status issued', async () => {
    const { client, review } = await seedRemoved('inv@b.com', 'invoice')
    const gw = mockGateway()
    await chargeRemovals(client.id, gw)
    expect(gw.createInvoice).toHaveBeenCalledOnce()
    expect(gw.chargeSavedCard).not.toHaveBeenCalled()
    const r = await prisma.review.findUniqueOrThrow({ where: { id: review.id } })
    expect(r.state).toBe(ReviewState.BILLED)
    const charge = await prisma.charge.findFirstOrThrow()
    expect(charge.status).toBe('issued')
    expect(charge.stripeInvoiceId).toBe('in_test')
  })

  it('no billing method: skips the client, no charge, stays REMOVED', async () => {
    const { client, review } = await seedRemoved('none@b.com', null)
    const gw = mockGateway()
    await chargeRemovals(client.id, gw)
    expect(await prisma.charge.count()).toBe(0)
    const r = await prisma.review.findUniqueOrThrow({ where: { id: review.id } })
    expect(r.state).toBe(ReviewState.REMOVED)
  })

  it('is idempotent: a second run does not double-charge', async () => {
    const { client } = await seedRemoved('idem@b.com', 'card')
    await chargeRemovals(client.id, mockGateway())
    const gw2 = mockGateway()
    await chargeRemovals(client.id, gw2)
    expect(gw2.chargeSavedCard).not.toHaveBeenCalled()
    expect(await prisma.charge.count()).toBe(1)
  })

  it('card declined: review stays REMOVED, no charge row, no throw', async () => {
    const { client, review } = await seedRemoved('decl@b.com', 'card')
    const gw = mockGateway({ chargeSavedCard: vi.fn(async () => { throw new Error('card_declined') }) })
    await chargeRemovals(client.id, gw)
    expect(await prisma.charge.count()).toBe(0)
    const r = await prisma.review.findUniqueOrThrow({ where: { id: review.id } })
    expect(r.state).toBe(ReviewState.REMOVED)
  })
})
