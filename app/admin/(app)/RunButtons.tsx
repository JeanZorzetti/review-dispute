'use client'

import { useState, useTransition } from 'react'
import { runSyncAction, runReconcileAction } from './actions'

export function RunButtons() {
  const [pending, start] = useTransition()
  const [msg, setMsg] = useState<string | null>(null)
  return (
    <div className="flex flex-wrap items-center gap-3 rounded-lg border border-line bg-surface p-4">
      <button
        disabled={pending}
        onClick={() => start(async () => { const r = await runSyncAction(); setMsg(`Synced ${r.synced}/${r.clients} clients`) })}
        className="rounded-md bg-accent px-3 py-1.5 text-xs font-bold uppercase text-white disabled:opacity-50"
      >Run sync + triage</button>
      <button
        disabled={pending}
        onClick={() => start(async () => { const r = await runReconcileAction(); setMsg(`Reconciled ${r.reconciled}/${r.clients} clients`) })}
        className="rounded-md border border-line px-3 py-1.5 text-xs font-semibold hover:border-accent"
      >Run reconcile + billing</button>
      {msg && <span className="text-xs text-accent">{msg}</span>}
    </div>
  )
}
