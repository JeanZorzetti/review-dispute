import { NextResponse } from 'next/server'
import { stripe } from '@/src/lib/stripe'
import { handleStripeEvent } from '@/src/units/billing/webhook'

export async function POST(request: Request) {
  const signature = request.headers.get('stripe-signature') ?? ''
  const payload = await request.text()
  let event
  try {
    event = stripe().verifyWebhook(payload, signature)
  } catch {
    return NextResponse.json({ error: 'invalid signature' }, { status: 400 })
  }
  await handleStripeEvent(event)
  return NextResponse.json({ received: true })
}
