import { describe, it, expect, beforeEach } from 'vitest'
import { prisma } from '../lib/prisma'
import { resetDb } from '../test/helpers/db'
import { ReviewState } from './states'

beforeEach(async () => { await resetDb() })

describe('schema', () => {
  it('persists a client with a review and enforces unique externalReviewId per client', async () => {
    const client = await prisma.client.create({ data: { businessName: 'ACME Roofing', email: 'a@acme.com' } })
    await prisma.review.create({
      data: { clientId: client.id, externalReviewId: 'g-1', authorName: 'X', rating: 1, text: 'fake', state: ReviewState.NEW },
    })
    await expect(prisma.review.create({
      data: { clientId: client.id, externalReviewId: 'g-1', authorName: 'Y', rating: 1, text: 'dup', state: ReviewState.NEW },
    })).rejects.toThrow()
  })
})
