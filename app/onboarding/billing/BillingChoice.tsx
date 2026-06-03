'use client'

import { useState } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js'
import { selectMethodAction } from './actions'

const stripePromise = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
  ? loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
  : null

function CardForm() {
  const stripe = useStripe()
  const elements = useElements()
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  async function save() {
    if (!stripe || !elements) return
    setSaving(true)
    const { error } = await stripe.confirmSetup({ elements, redirect: 'if_required' })
    if (error) { setError(error.message ?? 'card error'); setSaving(false); return }
    window.location.href = '/dashboard'
  }

  return (
    <div className="mt-6">
      <PaymentElement />
      {error && <p className="mt-2 text-sm text-accent">{error}</p>}
      <button onClick={save} disabled={saving} className="mt-4 w-full rounded-md bg-accent px-4 py-2 text-sm font-bold uppercase text-white disabled:opacity-50">
        {saving ? 'Saving…' : 'Save card'}
      </button>
    </div>
  )
}

export function BillingChoice({ clientId }: { clientId: string }) {
  const [secret, setSecret] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  async function choose(method: 'card' | 'invoice') {
    setPending(true); setError(null)
    const res = await selectMethodAction(clientId, method)
    setPending(false)
    if (res.error) { setError(res.error); return }
    if (method === 'invoice') { window.location.href = '/dashboard'; return }
    if (res.setupClientSecret) setSecret(res.setupClientSecret)
  }

  if (secret && stripePromise) {
    return (
      <Elements stripe={stripePromise} options={{ clientSecret: secret }}>
        <CardForm />
      </Elements>
    )
  }

  return (
    <div className="space-y-3">
      <button onClick={() => choose('card')} disabled={pending} className="w-full rounded-lg border border-line bg-surface p-4 text-left hover:border-accent disabled:opacity-50">
        <div className="font-bold">Save a card</div>
        <div className="text-sm text-muted">Auto-charged $499 each time we remove a review.</div>
      </button>
      <button onClick={() => choose('invoice')} disabled={pending} className="w-full rounded-lg border border-line bg-surface p-4 text-left hover:border-accent disabled:opacity-50">
        <div className="font-bold">Get an invoice</div>
        <div className="text-sm text-muted">We email you a $499 invoice per removal — pay when you get it.</div>
      </button>
      {error && <p className="text-sm text-accent">{error}</p>}
    </div>
  )
}
