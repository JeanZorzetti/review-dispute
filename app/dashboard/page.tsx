import { getDashboardData } from '@/src/units/dashboard/queries'
import { prisma } from '@/src/lib/prisma'
import { PRODUCT_NAME } from '@/src/components/landing/site-config'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  // The DB may be unreachable during the build (page-data collection runs even
  // for force-dynamic routes). Fail soft so the build never breaks; at runtime
  // the connection is available and the real data renders.
  let client: Awaited<ReturnType<typeof prisma.client.findFirst>> = null
  try {
    client = await prisma.client.findFirst()
  } catch {
    return (
      <main className="flex min-h-screen items-center justify-center bg-bg p-8 text-muted">
        Dashboard unavailable — please try again shortly.
      </main>
    )
  }

  if (!client) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-bg p-8 text-center text-white">
        <h1 className="text-2xl font-black uppercase">Almost there</h1>
        <p className="mt-3 max-w-md text-muted">
          Connect your Google Business Profile to start protecting your reviews.
        </p>
        <a
          href="/api/auth/google"
          className="mt-6 rounded-md bg-accent px-6 py-3 text-sm font-extrabold uppercase tracking-wide text-white transition-transform hover:scale-105"
        >
          Connect Google
        </a>
      </main>
    )
  }

  const data = await getDashboardData(client.id)

  const monitored =
    data.counts.NEW +
    data.counts.ELIGIBLE +
    data.counts.SKIPPED +
    data.counts.READY +
    data.counts.SUBMITTED +
    data.counts.REMOVED +
    data.counts.BILLED +
    data.counts.DENIED +
    data.counts.CLOSED_LOST
  const inProgress = data.counts.READY + data.counts.SUBMITTED
  const removed = data.counts.REMOVED + data.counts.BILLED

  const stats = [
    { value: monitored, label: 'Reviews monitored' },
    { value: inProgress, label: 'In progress' },
    { value: removed, label: 'Removed for you' },
  ]

  return (
    <main className="min-h-screen bg-bg text-white">
      <header className="border-b border-line px-5 py-4 md:px-10">
        <span className="text-sm font-extrabold uppercase tracking-wide text-accent">{PRODUCT_NAME}</span>
      </header>

      <div className="mx-auto max-w-4xl space-y-10 px-5 py-12 md:px-10">
        {/* Reassurance */}
        <section>
          <div className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3 py-1 text-xs font-semibold text-accent">
            <span className="h-2 w-2 rounded-full bg-accent" />
            Active &amp; watching
          </div>
          <h1 className="mt-4 text-3xl font-black uppercase leading-tight md:text-4xl">
            {client.businessName} is protected
          </h1>
          <p className="mt-3 max-w-2xl text-muted">
            We&apos;re monitoring your Google profile around the clock. When a review breaks Google&apos;s
            rules, we dispute it for you — and you only pay when one comes down.
          </p>
        </section>

        {/* Status cards */}
        <section className="grid gap-4 sm:grid-cols-3">
          {stats.map((s) => (
            <div key={s.label} className="rounded-xl border border-line bg-surface p-6">
              <div className="text-4xl font-black text-accent">{s.value}</div>
              <div className="mt-2 text-sm text-muted">{s.label}</div>
            </div>
          ))}
        </section>

        {/* Removed wins */}
        {data.removed.length > 0 && (
          <section>
            <h2 className="text-sm font-bold uppercase tracking-wide text-muted">Reviews we removed</h2>
            <div className="mt-3 grid gap-3">
              {data.removed.map((r) => (
                <div key={r.id} className="rounded-lg border border-line bg-surface p-4">
                  <p className="text-sm text-white">&ldquo;{r.text}&rdquo;</p>
                  <p className="mt-1 text-xs text-muted">— {r.authorName}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Honest, reassuring note about what we don't touch */}
        <section className="rounded-xl border border-line bg-surface p-6">
          <h2 className="text-sm font-bold uppercase tracking-wide text-muted">How we keep it clean</h2>
          <p className="mt-2 text-sm text-muted">
            We only dispute reviews that genuinely violate Google&apos;s policies — fake, competitor,
            off-topic, or abusive. We never touch honest feedback from real customers. That&apos;s what
            keeps your profile in good standing with Google.
          </p>
        </section>
      </div>
    </main>
  )
}
