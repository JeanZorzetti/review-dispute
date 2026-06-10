'use client'

import { useActionState } from 'react'
import { requestMagicLinkAction } from './actions'
import { PRODUCT_NAME, CONNECT_URL } from '@/src/components/landing/site-config'

export default function ClientLogin() {
  const [message, formAction, pending] = useActionState(requestMagicLinkAction, undefined)
  return (
    <main className="flex min-h-screen items-center justify-center bg-bg text-white">
      <form action={formAction} className="w-full max-w-sm rounded-lg border border-line bg-surface p-8">
        <span className="text-sm font-extrabold uppercase tracking-wide text-accent">{PRODUCT_NAME}</span>
        <h1 className="mt-2 text-xl font-bold">Sign in to your dashboard</h1>
        <p className="mt-2 text-sm text-muted">We&apos;ll email you a one-time sign-in link.</p>
        <input
          type="email"
          name="email"
          required
          placeholder="you@yourbusiness.com"
          className="mt-6 w-full rounded-md border border-line bg-card px-3 py-2 text-sm outline-none focus:border-accent"
          autoFocus
        />
        {message && <p className="mt-2 text-sm text-accent">{message}</p>}
        <button
          type="submit"
          disabled={pending}
          className="mt-4 w-full rounded-md bg-accent px-4 py-2 text-sm font-bold uppercase text-white disabled:opacity-50"
        >
          {pending ? 'Sending…' : 'Email me a link'}
        </button>
        <p className="mt-6 text-xs text-muted">
          New here?{' '}
          <a href={CONNECT_URL} className="text-accent underline">
            Connect your Google Business Profile
          </a>
        </p>
      </form>
    </main>
  )
}
