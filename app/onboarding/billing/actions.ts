'use server'

import { chooseBillingMethod, type BillingMethod } from '@/src/units/billing/setup-billing'
import { stripe } from '@/src/lib/stripe'

export async function selectMethodAction(clientId: string, method: BillingMethod): Promise<{ setupClientSecret?: string; error?: string }> {
  try {
    const res = await chooseBillingMethod(clientId, method, stripe())
    return { setupClientSecret: res.setupClientSecret }
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'billing setup failed' }
  }
}
