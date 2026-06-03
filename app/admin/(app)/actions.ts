'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { requireAdmin, clearSessionCookie } from '@/src/lib/admin-auth'
import { prisma } from '@/src/lib/prisma'
import { markSubmitted } from '@/src/units/executor/executor'
import { markDenied } from '@/src/units/tracker/mark-denied'
import { markRemovedManually } from '@/src/units/tracker/mark-removed'
import { chargeRemovals } from '@/src/units/billing/billing'
import { stripe } from '@/src/lib/stripe'
import { runSyncAllClients, runReconcileAllClients } from '@/src/units/operations/run-all'

export async function submitAction(disputeId: string): Promise<void> {
  await requireAdmin()
  await markSubmitted(disputeId)
  revalidatePath('/admin')
}

export async function denyAction(disputeId: string): Promise<void> {
  await requireAdmin()
  await markDenied(disputeId)
  revalidatePath('/admin')
}

export async function removeAction(disputeId: string): Promise<{ ok: boolean; error?: string }> {
  await requireAdmin()
  await markRemovedManually(disputeId)
  const dispute = await prisma.dispute.findUniqueOrThrow({ where: { id: disputeId }, include: { review: true } })
  try {
    await chargeRemovals(dispute.review.clientId, stripe())
  } catch (e) {
    revalidatePath('/admin')
    return { ok: false, error: e instanceof Error ? e.message : 'billing failed' }
  }
  revalidatePath('/admin')
  return { ok: true }
}

export async function newClientAction(formData: FormData): Promise<void> {
  await requireAdmin()
  const businessName = String(formData.get('businessName') ?? '').trim()
  const email = String(formData.get('email') ?? '').trim()
  if (!businessName || !email) return
  await prisma.client.create({ data: { businessName, email } })
  revalidatePath('/admin/clients')
}

export async function runSyncAction(): Promise<{ clients: number; synced: number }> {
  await requireAdmin()
  const result = await runSyncAllClients()
  revalidatePath('/admin')
  return result
}

export async function runReconcileAction(): Promise<{ clients: number; reconciled: number }> {
  await requireAdmin()
  const result = await runReconcileAllClients()
  revalidatePath('/admin')
  return result
}

export async function logoutAction(): Promise<void> {
  await requireAdmin()
  await clearSessionCookie()
  redirect('/admin/login')
}
