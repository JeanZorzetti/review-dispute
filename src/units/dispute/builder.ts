import { prisma } from '../../lib/prisma'
import { ReviewState } from '../../domain/states'
import { assertTransition } from '../../domain/transitions'
import { getPolicy, type ViolationType } from '../../domain/policies'

export async function buildDisputes(clientId: string): Promise<void> {
  const eligible = await prisma.review.findMany({
    where: { clientId, state: ReviewState.ELIGIBLE, dispute: null },
    include: { logs: { orderBy: { createdAt: 'desc' }, take: 1 } },
  })
  for (const r of eligible) {
    const log = r.logs[0]
    if (!log?.violationType) continue
    const policy = getPolicy(log.violationType as ViolationType)
    const argument = [
      `${policy.citation}.`,
      `This review by ${r.authorName} violates the policy: ${policy.description}`,
      `Evidence from the review text: "${r.text}".`,
      'We request removal as it does not reflect a genuine customer experience and breaches Google policy.',
    ].join(' ')
    await prisma.dispute.create({
      data: { reviewId: r.id, violationType: log.violationType, caseStrength: log.caseStrength, argument },
    })
    assertTransition(ReviewState.ELIGIBLE, ReviewState.READY)
    await prisma.review.update({ where: { id: r.id }, data: { state: ReviewState.READY } })
  }
}
