import StripeSDK from 'stripe'
import type Stripe from 'stripe'

export interface ClientForBilling {
  id: string
  email: string
  businessName: string
  stripeCustomerId: string | null
}

export interface StripeGateway {
  getOrCreateCustomer(client: ClientForBilling): Promise<string>
  createSetupIntent(customerId: string): Promise<string>
  chargeSavedCard(customerId: string, paymentMethodId: string, amountCents: number, description: string): Promise<{ id: string }>
  defaultPaymentMethod(customerId: string): Promise<string | null>
  createInvoice(customerId: string, amountCents: number, description: string): Promise<{ invoiceId: string }>
  verifyWebhook(payload: string, signature: string): Stripe.Event
}

let _client: Stripe | null = null
function client(): Stripe {
  if (!_client) {
    const key = process.env.STRIPE_SECRET_KEY
    if (!key) throw new Error('STRIPE_SECRET_KEY not set')
    _client = new StripeSDK(key)
  }
  return _client
}

let _gateway: StripeGateway | null = null
export function stripe(): StripeGateway {
  if (!_gateway) {
    _gateway = {
      async getOrCreateCustomer(c) {
        const s = client()
        if (c.stripeCustomerId) {
          try {
            const existing = await s.customers.retrieve(c.stripeCustomerId)
            if (!existing.deleted) return existing.id
          } catch {
            // not portable test<->live; fall through and recreate
          }
        }
        const created = await s.customers.create({ email: c.email, name: c.businessName, metadata: { clientId: c.id } })
        return created.id
      },
      async createSetupIntent(customerId) {
        const s = client()
        const si = await s.setupIntents.create({ customer: customerId, payment_method_types: ['card'] })
        if (!si.client_secret) throw new Error(`SetupIntent ${si.id} has no client_secret (status: ${si.status})`)
        return si.client_secret
      },
      async chargeSavedCard(customerId, paymentMethodId, amountCents, description) {
        const s = client()
        const pi = await s.paymentIntents.create({
          amount: amountCents,
          currency: 'usd',
          customer: customerId,
          payment_method: paymentMethodId,
          off_session: true,
          confirm: true,
          description,
        })
        return { id: pi.id }
      },
      async defaultPaymentMethod(customerId) {
        const s = client()
        const list = await s.paymentMethods.list({ customer: customerId, type: 'card', limit: 1 })
        return list.data[0]?.id ?? null
      },
      async createInvoice(customerId, amountCents, description) {
        const s = client()
        const invoice = await s.invoices.create({ customer: customerId, collection_method: 'send_invoice', days_until_due: 7 })
        await s.invoiceItems.create({ customer: customerId, amount: amountCents, currency: 'usd', description, invoice: invoice.id! })
        const finalized = await s.invoices.finalizeInvoice(invoice.id!)
        return { invoiceId: finalized.id! }
      },
      verifyWebhook(payload, signature) {
        const secret = process.env.STRIPE_WEBHOOK_SECRET
        if (!secret) throw new Error('Stripe webhook secret not set (STRIPE_WEBHOOK_SECRET)')
        return client().webhooks.constructEvent(payload, signature, secret)
      },
    }
  }
  return _gateway
}
