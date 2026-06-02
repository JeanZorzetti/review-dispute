import { prisma } from '../../lib/prisma'
import { ReviewState } from '../../domain/states'
import { assertTransition } from '../../domain/transitions'

export async function markSubmitted(disputeId: string): Promise<void> {
  const dispute = await prisma.dispute.findUniqueOrThrow({ where: { id: disputeId }, include: { review: true } })
  assertTransition(dispute.review.state as ReviewState, ReviewState.SUBMITTED)
  await prisma.$transaction([
    prisma.dispute.update({ where: { id: disputeId }, data: { submittedAt: new Date() } }),
    prisma.review.update({ where: { id: dispute.reviewId }, data: { state: ReviewState.SUBMITTED } }),
  ])
}
