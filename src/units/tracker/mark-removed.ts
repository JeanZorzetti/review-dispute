import { prisma } from '../../lib/prisma'
import { ReviewState } from '../../domain/states'
import { assertTransition } from '../../domain/transitions'

export async function markRemovedManually(disputeId: string): Promise<void> {
  const dispute = await prisma.dispute.findUniqueOrThrow({
    where: { id: disputeId },
    include: { review: true, outcome: true },
  })
  if (dispute.review.state === ReviewState.REMOVED) return
  assertTransition(dispute.review.state as ReviewState, ReviewState.REMOVED)
  await prisma.$transaction(async (tx) => {
    if (dispute.outcome) {
      await tx.outcome.update({ where: { id: dispute.outcome.id }, data: { result: 'REMOVED' } })
    } else {
      await tx.outcome.create({ data: { disputeId, result: 'REMOVED', confirmations: 2 } })
    }
    await tx.review.update({ where: { id: dispute.reviewId }, data: { state: ReviewState.REMOVED } })
  })
}
