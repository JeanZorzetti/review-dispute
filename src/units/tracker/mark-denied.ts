import { prisma } from '../../lib/prisma'
import { ReviewState } from '../../domain/states'
import { assertTransition } from '../../domain/transitions'

export async function markDenied(disputeId: string): Promise<void> {
  const dispute = await prisma.dispute.findUniqueOrThrow({ where: { id: disputeId }, include: { review: true, outcome: true } })
  assertTransition(dispute.review.state as ReviewState, ReviewState.DENIED)
  await prisma.$transaction(async (tx) => {
    if (dispute.outcome) {
      await tx.outcome.update({ where: { id: dispute.outcome.id }, data: { result: 'DENIED' } })
    } else {
      await tx.outcome.create({ data: { disputeId, result: 'DENIED', confirmations: 0 } })
    }
    await tx.review.update({ where: { id: dispute.reviewId }, data: { state: ReviewState.DENIED } })
    assertTransition(ReviewState.DENIED, ReviewState.CLOSED_LOST)
    await tx.review.update({ where: { id: dispute.reviewId }, data: { state: ReviewState.CLOSED_LOST } })
  })
}
