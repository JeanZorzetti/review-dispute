import { getDashboardData } from '@/src/units/dashboard/queries'
import { removalRateByViolationType } from '@/src/units/learning/learning'
import { prisma } from '@/src/lib/prisma'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const client = await prisma.client.findFirst()
  if (!client) return <main className="p-8">No client onboarded yet.</main>
  const data = await getDashboardData(client.id)
  const rates = await removalRateByViolationType()
  return (
    <main className="p-8 space-y-8">
      <h1 className="text-2xl font-bold">{client.businessName} — Review Dispute Status</h1>
      <section>
        <h2 className="font-semibold">Pipeline</h2>
        <ul>{Object.entries(data.counts).map(([s, n]) => <li key={s}>{s}: {n}</li>)}</ul>
      </section>
      <section>
        <h2 className="font-semibold">Removed (billed)</h2>
        <ul>{data.removed.map((r) => <li key={r.id}>{r.authorName}: {r.text}</li>)}</ul>
      </section>
      <section>
        <h2 className="font-semibold">Not eligible (legitimate — we won&apos;t dispute)</h2>
        <ul>{data.skipped.map((r) => <li key={r.id}>{r.authorName}: {r.text}</li>)}</ul>
      </section>
      <section>
        <h2 className="font-semibold">Removal rate by violation type</h2>
        <ul>{Object.entries(rates).map(([vt, rate]) => <li key={vt}>{vt}: {(rate * 100).toFixed(0)}%</li>)}</ul>
      </section>
    </main>
  )
}
