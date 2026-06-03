import { describe, it, expect, beforeEach, vi } from 'vitest'
import { prisma } from '../../lib/prisma'
import { resetDb } from '../../test/helpers/db'
import { chooseBillingMethod } from './setup-billing'
import type { StripeGateway } from '../../lib/stripe'

beforeEach(async () => { await resetDb() })

function mockGateway(): StripeGateway {
  return {
    getOrCreateCustomer: vi.fn(async () => 'cus_new'),
    createSetupIntent: vi.fn(async () => 'seti_secret'),
    chargeSavedCard: vi.fn(async () => ({ id: 'pi' })),
    defaultPaymentMethod: vi.fn(async () => 'pm'),
    createInvoice: vi.fn(async () => ({ invoiceId: 'in' })),
    verifyWebhook: vi.fn(),
  }
}

describe('chooseBillingMethod', () => {
  it('invoice: persists method + customer id, no setup secret', async () => {
    const c = await prisma.client.create({ data: { businessName: 'ACME', email: 'i@s.com' } })
    const res = await chooseBillingMethod(c.id, 'invoice', mockGateway())
    expect(res.setupClientSecret).toBeUndefined()
    const found = await prisma.client.findUniqueOrThrow({ where: { id: c.id } })
    expect(found.billingMethod).toBe('invoice')
    expect(found.stripeCustomerId).toBe('cus_new')
  })

  it('card: persists method + customer id + returns a setup client secret', async () => {
    const c = await prisma.client.create({ data: { businessName: 'ACME', email: 'c@s.com' } })
    const res = await chooseBillingMethod(c.id, 'card', mockGateway())
    expect(res.setupClientSecret).toBe('seti_secret')
    const found = await prisma.client.findUniqueOrThrow({ where: { id: c.id } })
    expect(found.billingMethod).toBe('card')
    expect(found.stripeCustomerId).toBe('cus_new')
  })

  it('rejects an unknown method', async () => {
    const c = await prisma.client.create({ data: { businessName: 'ACME', email: 'x@s.com' } })
    await expect(chooseBillingMethod(c.id, 'crypto' as 'card', mockGateway())).rejects.toThrow(/invalid billing method/i)
  })
})
