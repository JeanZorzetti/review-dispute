'use client'

import { useState, useTransition } from 'react'
import type { DisputeRow } from './queries'
import { submitAction, denyAction, removeAction } from './actions'

export function DisputeCard({ row }: { row: DisputeRow }) {
  const [pending, start] = useTransition()
  const [msg, setMsg] = useState<string | null>(null)
  const reportUrl = 'https://support.google.com/business/workflow/9945796'

  return (
    <div className="rounded-lg border border-line bg-surface p-5">
      <div className="flex items-center justify-between text-sm">
        <span className="font-bold">{row.businessName}</span>
        <span className="text-accent">{row.violationType} · {row.caseStrength}</span>
      </div>
      <p className="mt-2 text-sm text-muted">&ldquo;{row.reviewText}&rdquo; — {row.authorName}</p>

      {row.state === 'READY' && (
        <>
          <div className="mt-3 rounded-md border border-line bg-card p-3 text-xs text-muted">{row.argument}</div>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              onClick={() => { navigator.clipboard.writeText(row.argument); setMsg('Copied') }}
              className="rounded-md border border-line px-3 py-1.5 text-xs font-semibold hover:border-accent"
            >Copy argument</button>
            <a href={reportUrl} target="_blank" rel="noreferrer" className="rounded-md border border-line px-3 py-1.5 text-xs font-semibold hover:border-accent">Open Google report flow</a>
            <button
              disabled={pending}
              onClick={() => start(async () => { await submitAction(row.disputeId); setMsg('Submitted') })}
              className="rounded-md bg-accent px-3 py-1.5 text-xs font-bold uppercase text-white disabled:opacity-50"
            >Mark submitted</button>
            <button
              disabled={pending}
              onClick={() => start(async () => { await denyAction(row.disputeId); setMsg('Denied') })}
              className="rounded-md border border-line px-3 py-1.5 text-xs font-semibold hover:border-accent"
            >Mark denied</button>
          </div>
        </>
      )}

      {row.state === 'SUBMITTED' && (
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            disabled={pending}
            onClick={() => {
              if (!confirm('Mark as removed? This will charge the client.')) return
              start(async () => { const r = await removeAction(row.disputeId); setMsg(r.ok ? 'Removed & charged' : `Removed, billing error: ${r.error}`) })
            }}
            className="rounded-md bg-accent px-3 py-1.5 text-xs font-bold uppercase text-white disabled:opacity-50"
          >Mark removed</button>
          <button
            disabled={pending}
            onClick={() => start(async () => { await denyAction(row.disputeId); setMsg('Denied') })}
            className="rounded-md border border-line px-3 py-1.5 text-xs font-semibold hover:border-accent"
          >Mark denied</button>
        </div>
      )}

      {msg && <p className="mt-2 text-xs text-accent">{msg}</p>}
    </div>
  )
}
