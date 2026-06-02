import { prisma } from '../../lib/prisma'
import { ReviewState } from '../../domain/states'
import type { GbpClient } from './gbp-client'

export async function syncReviews(clientId: string, gbp: GbpClient): Promise<{ imported: number }> {
  const client = await prisma.client.findUniqueOrThrow({ where: { id: clientId } })
  if (!client.gbpLocationId) throw new Error('client has no gbpLocationId')
  const raw = await gbp.listReviews(client.gbpLocationId)
  let imported = 0
  for (const r of raw) {
    const existing = await prisma.review.findUnique({
      where: { clientId_externalReviewId: { clientId, externalReviewId: r.externalReviewId } },
    })
    if (existing) continue
    await prisma.review.create({
      data: {
        clientId,
        externalReviewId: r.externalReviewId,
        authorName: r.authorName,
        rating: r.rating,
        text: r.text,
        state: ReviewState.NEW,
      },
    })
    imported++
  }
  return { imported }
}
