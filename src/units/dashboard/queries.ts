import { prisma } from '../../lib/prisma'
import { ReviewState } from '../../domain/states'

export async function getDashboardData(clientId: string) {
  const reviews = await prisma.review.findMany({
    where: { clientId },
    include: { dispute: { include: { outcome: { include: { charge: true } } } } },
    orderBy: { createdAt: 'desc' },
  })
  const counts: Record<string, number> = {}
  for (const s of Object.values(ReviewState)) counts[s] = 0
  for (const r of reviews) counts[r.state]++
  return {
    counts,
    skipped: reviews.filter((r) => r.state === ReviewState.SKIPPED).map((r) => ({ id: r.id, text: r.text, authorName: r.authorName })),
    active: reviews.filter((r) => [ReviewState.READY, ReviewState.SUBMITTED].includes(r.state as ReviewState)),
    removed: reviews.filter((r) => [ReviewState.REMOVED, ReviewState.BILLED].includes(r.state as ReviewState)),
  }
}
