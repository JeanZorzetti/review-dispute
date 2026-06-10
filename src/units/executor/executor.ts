import { prisma } from '../../lib/prisma'
import { ReviewState } from '../../domain/states'
import { assertTransition } from '../../domain/transitions'
import { sendEmail } from '../../lib/email'
import { disputeSubmittedEmail } from '../../lib/email-templates'

export async function markSubmitted(disputeId: string): Promise<void> {
  const dispute = await prisma.dispute.findUniqueOrThrow({
    where: { id: disputeId },
    include: { review: { include: { client: true } } },
  })
  assertTransition(dispute.review.state as ReviewState, ReviewState.SUBMITTED)
  await prisma.$transaction([
    prisma.dispute.update({ where: { id: disputeId }, data: { submittedAt: new Date() } }),
    prisma.review.update({ where: { id: dispute.reviewId }, data: { state: ReviewState.SUBMITTED } }),
  ])
  // Notify the client after the state change committed; email failure (or a
  // missing RESEND_API_KEY) must never roll back or break the submission.
  await sendEmail(
    disputeSubmittedEmail(
      dispute.review.client.email,
      dispute.review.client.businessName,
      { authorName: dispute.review.authorName, rating: dispute.review.rating },
      dispute.violationType
    )
  )
}
