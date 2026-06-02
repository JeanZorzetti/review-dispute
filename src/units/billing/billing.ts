import { prisma } from '../../lib/prisma'
import { ReviewState } from '../../domain/states'
import { assertTransition } from '../../domain/transitions'
import type { StripeGateway } from '../../lib/stripe'

export async function chargeRemovals(clientId: string, gateway: StripeGateway): Promise<void> {
  const client = await prisma.client.findUniqueOrThrow({ where: { id: clientId } })
  const removed = await prisma.review.findMany({
    where: { clientId, state: ReviewState.REMOVED },
    include: { dispute: { include: { outcome: { include: { charge: true } } } } },
  })
  for (const r of removed) {
    const outcome = r.dispute?.outcome
    if (!outcome || outcome.result !== 'REMOVED') continue
    if (outcome.charge) continue // idempotent guard
    const charge = await gateway.createCharge({
      amountCents: client.pricePerRemovalCents,
      customerRef: client.id,
      description: `Removed review ${r.externalReviewId} (${r.dispute?.violationType})`,
    })
    await prisma.charge.create({
      data: { outcomeId: outcome.id, amountCents: client.pricePerRemovalCents, stripeChargeId: charge.id },
    })
    assertTransition(ReviewState.REMOVED, ReviewState.BILLED)
    await prisma.review.update({ where: { id: r.id }, data: { state: ReviewState.BILLED } })
  }
}
