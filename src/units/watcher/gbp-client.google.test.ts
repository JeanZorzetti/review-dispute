import { describe, it, expect, vi } from 'vitest'
import { GoogleGbpClient } from './gbp-client.google'

describe('GoogleGbpClient.listReviews', () => {
  it('maps Google API review shape to RawReview', async () => {
    const fakeFetch = vi.fn(async () => ({
      ok: true,
      json: async () => ({
        reviews: [
          { reviewId: 'abc', reviewer: { displayName: 'Rival' }, starRating: 'ONE', comment: 'scam' },
        ],
      }),
    })) as any
    const client = new GoogleGbpClient('fake-token', fakeFetch)
    const reviews = await client.listReviews('loc-1')
    expect(reviews).toEqual([{ externalReviewId: 'abc', authorName: 'Rival', rating: 1, text: 'scam' }])
  })
})
