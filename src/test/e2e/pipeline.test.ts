import { describe, it, expect, beforeEach, vi } from 'vitest'
import { prisma } from '../../lib/prisma'
import { resetDb } from '../helpers/db'
import { ReviewState } from '../../domain/states'
import { mockLlm } from '../../lib/llm'
import { MockGbpClient } from '../../units/watcher/gbp-client.mock'
import { syncReviews } from '../../units/watcher/watcher'
import { runTriage } from '../../units/triage/run-triage'
import { buildDisputes } from '../../units/dispute/builder'
import { markSubmitted } from '../../units/executor/executor'
import { reconcile } from '../../units/tracker/tracker'
import { chargeRemovals } from '../../units/billing/billing'
import type { StripeGateway } from '../../lib/stripe'

beforeEach(async () => { await resetDb() })

describe('full pipeline NEW → BILLED', () => {
  it('takes a violating review all the way to BILLED and SKIPs a legitimate one', async () => {
    const client = await prisma.client.create({
      data: { businessName: 'ACME Roofing', email: 'e2e@test.com', gbpLocationId: 'loc-1', pricePerRemovalCents: 9900, billingMethod: 'card', stripeCustomerId: 'cus_e2e' }
    })

    const present = [
      { externalReviewId: 'bad-1', authorName: 'Rival', rating: 1, text: 'I am a competitor, total scam' },
      { externalReviewId: 'ok-1', authorName: 'Real', rating: 2, text: 'roof still leaks after repair' },
    ]

    // 1. sync
    await syncReviews(client.id, new MockGbpClient(present))

    // 2. triage — match by delimited review text
    const llmStub = mockLlm((p) =>
      p.includes('"""I am a competitor, total scam"""')
        ? JSON.stringify({ violationType: 'CONFLICT_OF_INTEREST', caseStrength: 'HIGH', confidence: 0.96 })
        : JSON.stringify({ violationType: null, caseStrength: 'NONE', confidence: 0.96 })
    )
    await runTriage(client.id, llmStub)

    // 3. build dispute
    await buildDisputes(client.id)
    const ready = await prisma.review.findFirstOrThrow({ where: { externalReviewId: 'bad-1' }, include: { dispute: true } })
    expect(ready.state).toBe(ReviewState.READY)

    // 4. human submits
    await markSubmitted(ready.dispute!.id)

    // 5. reconcile twice — bad review gone, ok-1 stays
    const gbpRemoved = new MockGbpClient([{ externalReviewId: 'ok-1', authorName: 'Real', rating: 2, text: 'roof still leaks after repair' }])
    await reconcile(client.id, gbpRemoved)
    await reconcile(client.id, gbpRemoved)

    // 6. bill
    const fakeStripe: StripeGateway = {
      getOrCreateCustomer: vi.fn(async () => 'cus_e2e'),
      createSetupIntent: vi.fn(async () => 'seti_secret'),
      chargeSavedCard: vi.fn(async () => ({ id: 'ch_e2e' })),
      defaultPaymentMethod: vi.fn(async () => 'pm_e2e'),
      createInvoice: vi.fn(async () => ({ invoiceId: 'in_e2e' })),
      verifyWebhook: vi.fn(),
    }
    await chargeRemovals(client.id, fakeStripe)

    const bad = await prisma.review.findFirstOrThrow({ where: { externalReviewId: 'bad-1' } })
    const ok = await prisma.review.findFirstOrThrow({ where: { externalReviewId: 'ok-1' } })
    expect(bad.state).toBe(ReviewState.BILLED)
    expect(ok.state).toBe(ReviewState.SKIPPED)
    expect(fakeStripe.chargeSavedCard).toHaveBeenCalledTimes(1)
    expect(await prisma.charge.count()).toBe(1)
  })
})
