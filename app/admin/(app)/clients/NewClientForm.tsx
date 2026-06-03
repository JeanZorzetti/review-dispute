'use client'

import { useRef, useTransition } from 'react'
import { newClientAction } from '../actions'

export function NewClientForm() {
  const [pending, start] = useTransition()
  const formRef = useRef<HTMLFormElement>(null)
  return (
    <form
      ref={formRef}
      action={(fd) => start(async () => { await newClientAction(fd); formRef.current?.reset() })}
      className="flex flex-wrap items-end gap-3 rounded-lg border border-line bg-surface p-4"
    >
      <input name="businessName" placeholder="Business name" required className="rounded-md border border-line bg-card px-3 py-2 text-sm outline-none focus:border-accent" />
      <input name="email" type="email" placeholder="Email" required className="rounded-md border border-line bg-card px-3 py-2 text-sm outline-none focus:border-accent" />
      <button disabled={pending} className="rounded-md bg-accent px-4 py-2 text-xs font-bold uppercase text-white disabled:opacity-50">Add client</button>
    </form>
  )
}
