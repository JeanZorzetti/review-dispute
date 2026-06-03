import { getDisputesByState } from './queries'
import { DisputeCard } from './DisputeCard'
import { RunButtons } from './RunButtons'

export const dynamic = 'force-dynamic'

const ORDER = ['READY', 'SUBMITTED', 'REMOVED', 'BILLED', 'DENIED', 'CLOSED_LOST']

export default async function AdminQueue() {
  let grouped: Record<string, Awaited<ReturnType<typeof getDisputesByState>>[string]> = {}
  try {
    grouped = await getDisputesByState()
  } catch {
    return <main className="p-6">Database not reachable.</main>
  }
  return (
    <main className="space-y-8 p-6">
      <RunButtons />
      {ORDER.map((state) => {
        const rows = grouped[state] ?? []
        if (rows.length === 0) return null
        return (
          <section key={state}>
            <h2 className="mb-3 text-sm font-bold uppercase text-muted">{state} · {rows.length}</h2>
            <div className="grid gap-3">
              {rows.map((r) => <DisputeCard key={r.disputeId} row={r} />)}
            </div>
          </section>
        )
      })}
    </main>
  )
}
