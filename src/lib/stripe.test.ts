import { describe, it, expect } from 'vitest'
import { stripe } from './stripe'

const hasKey = Boolean(process.env.STRIPE_SECRET_KEY?.startsWith('sk_test_'))
const d = hasKey ? describe : describe.skip

d('stripe gateway (test mode)', () => {
  it('getOrCreateCustomer returns a customer id', async () => {
    const id = await stripe().getOrCreateCustomer({ id: 'client_test_1', email: 'g@test.com', businessName: 'ACME', stripeCustomerId: null })
    expect(id).toMatch(/^cus_/)
  })
  it('createSetupIntent returns a client secret', async () => {
    const cus = await stripe().getOrCreateCustomer({ id: 'client_test_2', email: 'g2@test.com', businessName: 'ACME', stripeCustomerId: null })
    const secret = await stripe().createSetupIntent(cus)
    expect(secret).toContain('seti_')
  })
  it('createInvoice returns an invoice id', async () => {
    const cus = await stripe().getOrCreateCustomer({ id: 'client_test_3', email: 'g3@test.com', businessName: 'ACME', stripeCustomerId: null })
    const { invoiceId } = await stripe().createInvoice(cus, 49900, 'Test removal')
    expect(invoiceId).toMatch(/^in_/)
  })
})

describe('stripe gateway (no key)', () => {
  it('verifyWebhook throws clearly when webhook secret is missing', () => {
    const original = process.env.STRIPE_WEBHOOK_SECRET
    delete process.env.STRIPE_WEBHOOK_SECRET
    expect(() => stripe().verifyWebhook('{}', 'sig')).toThrow(/webhook secret/i)
    if (original) process.env.STRIPE_WEBHOOK_SECRET = original
  })
})
