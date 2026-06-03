import type Stripe from 'stripe'
import { prisma } from '../../lib/prisma'

export async function handleStripeEvent(event: Stripe.Event): Promise<void> {
  if (event.type === 'invoice.paid') {
    const invoice = event.data.object as { id: string }
    await prisma.charge.updateMany({
      where: { stripeInvoiceId: invoice.id, status: 'issued' },
      data: { status: 'paid' },
    })
  }
}
