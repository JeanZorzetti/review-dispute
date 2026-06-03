'use client'

import { useActionState } from 'react'
import { loginAction } from './actions'

export default function AdminLogin() {
  const [error, formAction, pending] = useActionState(loginAction, undefined)
  return (
    <main className="flex min-h-screen items-center justify-center bg-bg text-white">
      <form action={formAction} className="w-full max-w-sm rounded-lg border border-line bg-surface p-8">
        <h1 className="text-xl font-bold">Admin</h1>
        <input
          type="password"
          name="password"
          placeholder="Password"
          className="mt-6 w-full rounded-md border border-line bg-card px-3 py-2 text-sm outline-none focus:border-accent"
          autoFocus
        />
        {error && <p className="mt-2 text-sm text-accent">{error}</p>}
        <button
          type="submit"
          disabled={pending}
          className="mt-4 w-full rounded-md bg-accent px-4 py-2 text-sm font-bold uppercase text-white disabled:opacity-50"
        >
          {pending ? 'Checking…' : 'Sign in'}
        </button>
      </form>
    </main>
  )
}
