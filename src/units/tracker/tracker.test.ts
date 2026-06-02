import { describe, it, expect, beforeEach } from 'vitest'
import { prisma } from '../../lib/prisma'
import { resetDb } from '../../test/helpers/db'
import { ReviewState } from '../../domain/states'
import { MockGbpClient } from '../watcher/gbp-client.mock'
import { reconcile } from './tracker'

beforeEach(async () => { await resetDb() })

async function seedSubmitted(email: string, externalId: string) {
  const client = await prisma.client.create({ data: { businessName: 'ACME', email, gbpLocationId: 'loc-1' } })
  const review = await prisma.review.create({ data: { clientId: client.id, externalReviewId: externalId, authorName: 'X', rating: 1, text: 't', state: ReviewState.SUBMITTED } })
  await prisma.dispute.create({ data: { reviewId: review.id, violationType: 'OFF_TOPIC', caseStrength: 'HIGH', argument: 'a', submittedAt: new Date() } })
  return { client, review }
}

describe('reconcile', () => {
  it('requires TWO consecutive absences before marking REMOVED + creating Outcome', async () => {
    const { client, review } = await seedSubmitted('a@tracker.com', 'g-1')
    const gbpGone = new MockGbpClient([])

    await reconcile(client.id, gbpGone) // confirmation 1
    let r = await prisma.review.findUniqueOrThrow({ where: { id: review.id } })
    expect(r.state).toBe(ReviewState.SUBMITTED) // not yet

    await reconcile(client.id, gbpGone) // confirmation 2
    r = await prisma.review.findUniqueOrThrow({ where: { id: review.id } })
    expect(r.state).toBe(ReviewState.REMOVED)
    const outcome = await prisma.outcome.findFirst()
    expect(outcome?.result).toBe('REMOVED')
  })

  it('resets confirmation count if the review reappears', async () => {
    const { client, review } = await seedSubmitted('b@tracker.com', 'g-2')
    await reconcile(client.id, new MockGbpClient([])) // absent once
    await reconcile(client.id, new MockGbpClient([{ externalReviewId: 'g-2', authorName: 'X', rating: 1, text: 't' }])) // reappeared
    await reconcile(client.id, new MockGbpClient([])) // absent once again (count should be 1, not 2)
    const r = await prisma.review.findUniqueOrThrow({ where: { id: review.id } })
    expect(r.state).toBe(ReviewState.SUBMITTED)
  })
})
