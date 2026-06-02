import { describe, it, expect, beforeEach } from 'vitest'
import { prisma } from '../../lib/prisma'
import { resetDb } from '../../test/helpers/db'
import { ReviewState } from '../../domain/states'
import { mockLlm } from '../../lib/llm'
import { runTriage } from './run-triage'

beforeEach(async () => { await resetDb() })

describe('runTriage', () => {
  it('moves a violating review to ELIGIBLE and a legitimate one to SKIPPED, logging both', async () => {
    const client = await prisma.client.create({ data: { businessName: 'ACME', email: 'a@acme.com' } })
    const bad = await prisma.review.create({ data: { clientId: client.id, externalReviewId: 'g-1', authorName: 'Rival', rating: 1, text: 'I am a competitor, scam', state: ReviewState.NEW } })
    const ok = await prisma.review.create({ data: { clientId: client.id, externalReviewId: 'g-2', authorName: 'Real', rating: 2, text: 'roof still leaks', state: ReviewState.NEW } })

    const stub = mockLlm((p) =>
      p.includes('"""I am a competitor, scam"""')
        ? JSON.stringify({ violationType: 'CONFLICT_OF_INTEREST', caseStrength: 'HIGH', confidence: 0.95 })
        : JSON.stringify({ violationType: null, caseStrength: 'NONE', confidence: 0.95 })
    )
    await runTriage(client.id, stub)

    expect((await prisma.review.findUniqueOrThrow({ where: { id: bad.id } })).state).toBe(ReviewState.ELIGIBLE)
    expect((await prisma.review.findUniqueOrThrow({ where: { id: ok.id } })).state).toBe(ReviewState.SKIPPED)
    expect(await prisma.classificationLog.count()).toBe(2)
  })
})
