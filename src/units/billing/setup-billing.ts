import { prisma } from '../../lib/prisma'
import type { StripeGateway, ClientForBilling } from '../../lib/stripe'

export type BillingMethod = 'card' | 'invoice'

export async function chooseBillingMethod(
  clientId: string,
  method: BillingMethod,
  gateway: StripeGateway,
): Promise<{ setupClientSecret?: string }> {
  if (method !== 'card' && method !== 'invoice') {
    throw new Error('invalid billing method')
  }
  const client = await prisma.client.findUniqueOrThrow({ where: { id: clientId } })
  const customerId = await gateway.getOrCreateCustomer(client as ClientForBilling)
  await prisma.client.update({
    where: { id: clientId },
    data: { billingMethod: method, stripeCustomerId: customerId },
  })
  if (method === 'card') {
    const setupClientSecret = await gateway.createSetupIntent(customerId)
    return { setupClientSecret }
  }
  return {}
}
