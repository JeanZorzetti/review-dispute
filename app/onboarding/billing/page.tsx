import { prisma } from '@/src/lib/prisma'
import { BillingChoice } from './BillingChoice'

export const dynamic = 'force-dynamic'

export default async function OnboardingBilling({ searchParams }: { searchParams: Promise<{ clientId?: string }> }) {
  const { clientId } = await searchParams
  let client = null
  try {
    client = clientId
      ? await prisma.client.findUnique({ where: { id: clientId } })
      : await prisma.client.findFirst({ orderBy: { createdAt: 'desc' } })
  } catch {
    return <main className="p-8 text-muted">Unavailable — please try again shortly.</main>
  }
  if (!client) return <main className="p-8 text-white">No client found.</main>

  return (
    <main className="mx-auto min-h-screen max-w-md bg-bg px-5 py-16 text-white">
      <h1 className="text-2xl font-black uppercase">Choose how you&apos;ll pay</h1>
      <p className="mt-2 text-sm text-muted">You only pay when we remove a review. Pick a method to finish setup.</p>
      <div className="mt-8">
        <BillingChoice clientId={client.id} />
      </div>
    </main>
  )
}
