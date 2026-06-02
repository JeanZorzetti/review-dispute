import { prisma } from '../../lib/prisma'
import { ReviewState } from '../../domain/states'
import { assertTransition } from '../../domain/transitions'
import type { GbpClient } from '../watcher/gbp-client'

const REQUIRED_CONFIRMATIONS = 2

export async function reconcile(clientId: string, gbp: GbpClient): Promise<void> {
  const client = await prisma.client.findUniqueOrThrow({ where: { id: clientId } })
  if (!client.gbpLocationId) throw new Error('client has no gbpLocationId')
  const present = new Set((await gbp.listReviews(client.gbpLocationId)).map((r) => r.externalReviewId))

  const submitted = await prisma.review.findMany({
    where: { clientId, state: ReviewState.SUBMITTED },
    include: { dispute: { include: { outcome: true } } },
  })

  for (const r of submitted) {
    const dispute = r.dispute
    if (!dispute) continue
    const stillUp = present.has(r.externalReviewId)
    if (stillUp) {
      if (dispute.outcome) await prisma.outcome.delete({ where: { id: dispute.outcome.id } })
      continue
    }
    const outcome = dispute.outcome
      ? await prisma.outcome.update({ where: { id: dispute.outcome.id }, data: { confirmations: { increment: 1 } } })
      : await prisma.outcome.create({ data: { disputeId: dispute.id, result: 'REMOVED', confirmations: 1 } })

    if (outcome.confirmations >= REQUIRED_CONFIRMATIONS) {
      assertTransition(ReviewState.SUBMITTED, ReviewState.REMOVED)
      await prisma.review.update({ where: { id: r.id }, data: { state: ReviewState.REMOVED } })
    }
  }
}
