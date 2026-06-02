import type { GbpClient, RawReview } from './gbp-client'

const STAR_MAP: Record<string, number> = { ONE: 1, TWO: 2, THREE: 3, FOUR: 4, FIVE: 5 }

export class GoogleGbpClient implements GbpClient {
  constructor(private readonly accessToken: string, private readonly fetchImpl: typeof fetch = fetch) {}

  async listReviews(gbpLocationId: string): Promise<RawReview[]> {
    const res = await this.fetchImpl(
      `https://mybusiness.googleapis.com/v4/${gbpLocationId}/reviews`,
      { headers: { authorization: `Bearer ${this.accessToken}` } }
    )
    if (!res.ok) throw new Error(`GBP API error ${res.status}`)
    const data = (await res.json()) as { reviews?: { reviewId: string; reviewer?: { displayName?: string }; starRating?: string; comment?: string }[] }
    return (data.reviews ?? []).map((r) => ({
      externalReviewId: r.reviewId,
      authorName: r.reviewer?.displayName ?? 'Unknown',
      rating: STAR_MAP[r.starRating ?? 'ONE'] ?? 1,
      text: r.comment ?? '',
    }))
  }
}
