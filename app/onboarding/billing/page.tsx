import { redirect } from 'next/navigation'
import { prisma } from '@/src/lib/prisma'
import { requireClientId } from '@/src/lib/client-auth'
import { BillingChoice } from './BillingChoice'

export const dynamic = 'force-dynamic'

export default async function OnboardingBilling() {
  // The OAuth callback sets the session cookie, so identity comes from the
  // session — never from a query param anyone can guess.
  const clientId = await requireClientId()
  let client = null
  try {
    client = await prisma.client.findUnique({ where: { id: clientId } })
  } catch {
    return <main className="p-8 text-muted">Unavailable — please try again shortly.</main>
  }
  if (!client) redirect('/login')

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
