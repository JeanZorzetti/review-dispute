import { prisma } from '@/src/lib/prisma'
import { ReviewState } from '@/src/domain/states'
import { parseStoredTokens } from '@/src/lib/google-oauth'

export interface DisputeRow {
  disputeId: string
  businessName: string
  violationType: string
  caseStrength: string
  argument: string
  reviewText: string
  authorName: string
  state: string
  submittedAt: Date | null
}

export async function getDisputesByState(): Promise<Record<string, DisputeRow[]>> {
  const disputes = await prisma.dispute.findMany({
    include: { review: { include: { client: true } } },
    orderBy: { createdAt: 'desc' },
  })
  const grouped: Record<string, DisputeRow[]> = {}
  for (const d of disputes) {
    const row: DisputeRow = {
      disputeId: d.id,
      businessName: d.review.client.businessName,
      violationType: d.violationType,
      caseStrength: d.caseStrength,
      argument: d.argument,
      reviewText: d.review.text,
      authorName: d.review.authorName,
      state: d.review.state,
      submittedAt: d.submittedAt,
    }
    ;(grouped[d.review.state] ??= []).push(row)
  }
  return grouped
}

export interface ClientRow {
  id: string
  businessName: string
  email: string
  gbpLocationId: string | null
  connected: boolean
  counts: Record<string, number>
}

export async function getClientsWithCounts(): Promise<ClientRow[]> {
  const clients = await prisma.client.findMany({
    include: { reviews: { select: { state: true } } },
    orderBy: { createdAt: 'desc' },
  })
  return clients.map((c) => {
    const counts: Record<string, number> = {}
    for (const s of Object.values(ReviewState)) counts[s] = 0
    for (const r of c.reviews) counts[r.state]++
    const tokens = parseStoredTokens(c.oauthTokens)
    return {
      id: c.id,
      businessName: c.businessName,
      email: c.email,
      gbpLocationId: c.gbpLocationId,
      connected: Boolean(tokens?.access_token ?? tokens?.refresh_token),
      counts,
    }
  })
}
