import { prisma } from '../../lib/prisma'
import { ReviewState } from '../../domain/states'
import { assertTransition } from '../../domain/transitions'
import type { StripeGateway, ClientForBilling } from '../../lib/stripe'

export async function chargeRemovals(clientId: string, gateway: StripeGateway): Promise<void> {
  const client = await prisma.client.findUniqueOrThrow({ where: { id: clientId } })
  if (!client.billingMethod) return

  const removed = await prisma.review.findMany({
    where: { clientId, state: ReviewState.REMOVED },
    include: { dispute: { include: { outcome: { include: { charge: true } } } } },
  })

  for (const r of removed) {
    const outcome = r.dispute?.outcome
    if (!outcome || outcome.result !== 'REMOVED') continue
    if (outcome.charge) continue

    const customerId = await gateway.getOrCreateCustomer(client as ClientForBilling)
    if (customerId !== client.stripeCustomerId) {
      await prisma.client.update({ where: { id: client.id }, data: { stripeCustomerId: customerId } })
    }
    const description = `Removed review ${r.externalReviewId} (${r.dispute?.violationType})`

    if (client.billingMethod === 'card') {
      const pm = await gateway.defaultPaymentMethod(customerId)
      if (!pm) continue
      let chargeId: string
      try {
        const res = await gateway.chargeSavedCard(customerId, pm, client.pricePerRemovalCents, description)
        chargeId = res.id
      } catch {
        continue
      }
      await prisma.charge.create({
        data: { outcomeId: outcome.id, amountCents: client.pricePerRemovalCents, stripeChargeId: chargeId, status: 'paid' },
      })
    } else {
      const { invoiceId } = await gateway.createInvoice(customerId, client.pricePerRemovalCents, description)
      await prisma.charge.create({
        data: { outcomeId: outcome.id, amountCents: client.pricePerRemovalCents, stripeChargeId: invoiceId, stripeInvoiceId: invoiceId, status: 'issued' },
      })
    }

    assertTransition(ReviewState.REMOVED, ReviewState.BILLED)
    await prisma.review.update({ where: { id: r.id }, data: { state: ReviewState.BILLED } })
  }
}
