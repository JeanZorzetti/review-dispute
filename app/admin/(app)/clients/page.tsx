import { getClientsWithCounts } from '../queries'
import { NewClientForm } from './NewClientForm'

export const dynamic = 'force-dynamic'

export default async function AdminClients() {
  let rows: Awaited<ReturnType<typeof getClientsWithCounts>> = []
  try {
    rows = await getClientsWithCounts()
  } catch {
    return <main className="p-6">Database not reachable.</main>
  }
  return (
    <main className="space-y-6 p-6">
      <NewClientForm />
      <div className="grid gap-3">
        {rows.map((c) => (
          <div key={c.id} className="rounded-lg border border-line bg-surface p-4">
            <div className="flex items-center justify-between text-sm">
              <span className="font-bold">{c.businessName}</span>
              <span className={c.connected ? 'text-accent' : 'text-muted'}>
                {c.connected ? 'connected' : c.gbpLocationId ? 'no token' : 'not connected'}
              </span>
            </div>
            <div className="mt-1 text-xs text-muted">{c.email}</div>
            <div className="mt-2 text-xs text-muted">
              ready: {c.counts.READY} · submitted: {c.counts.SUBMITTED} · removed: {c.counts.REMOVED + c.counts.BILLED} · skipped: {c.counts.SKIPPED}
            </div>
          </div>
        ))}
        {rows.length === 0 && <p className="text-sm text-muted">No clients yet.</p>}
      </div>
    </main>
  )
}
