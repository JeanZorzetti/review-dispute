import { prisma } from '../../lib/prisma'
import { ReviewState } from '../../domain/states'
import { assertTransition } from '../../domain/transitions'
import { classifyReview } from './triage'
import type { LlmComplete } from '../../lib/llm'

export async function runTriage(clientId: string, complete: LlmComplete): Promise<void> {
  const news = await prisma.review.findMany({ where: { clientId, state: ReviewState.NEW } })
  for (const r of news) {
    const result = await classifyReview({ text: r.text, rating: r.rating, authorName: r.authorName }, complete)
    await prisma.classificationLog.create({
      data: {
        reviewId: r.id,
        violationType: result.violationType ?? null,
        caseStrength: result.caseStrength,
        confidence: result.confidence,
      },
    })
    const next = result.eligible ? ReviewState.ELIGIBLE : ReviewState.SKIPPED
    assertTransition(ReviewState.NEW, next)
    await prisma.review.update({ where: { id: r.id }, data: { state: next } })
  }
}
