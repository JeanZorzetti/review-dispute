import type { GbpClient, RawReview } from './gbp-client'
export class MockGbpClient implements GbpClient {
  constructor(private readonly reviews: RawReview[]) {}
  async listReviews(): Promise<RawReview[]> { return this.reviews }
}
