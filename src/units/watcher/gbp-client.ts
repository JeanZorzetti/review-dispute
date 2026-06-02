export interface RawReview {
  externalReviewId: string
  authorName: string
  rating: number
  text: string
}
export interface GbpClient {
  listReviews(gbpLocationId: string): Promise<RawReview[]>
}
