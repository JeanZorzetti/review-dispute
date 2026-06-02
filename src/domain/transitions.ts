import { ReviewState } from './states'
export { ReviewState }

const LEGAL: Record<ReviewState, ReviewState[]> = {
  [ReviewState.NEW]: [ReviewState.ELIGIBLE, ReviewState.SKIPPED],
  [ReviewState.ELIGIBLE]: [ReviewState.READY, ReviewState.SKIPPED],
  [ReviewState.SKIPPED]: [],
  [ReviewState.READY]: [ReviewState.SUBMITTED],
  [ReviewState.SUBMITTED]: [ReviewState.REMOVED, ReviewState.DENIED, ReviewState.SUBMITTED],
  [ReviewState.REMOVED]: [ReviewState.BILLED, ReviewState.SUBMITTED], // re-listed → re-track
  [ReviewState.DENIED]: [ReviewState.CLOSED_LOST],
  [ReviewState.CLOSED_LOST]: [],
  [ReviewState.BILLED]: [],
}

export function assertTransition(from: ReviewState, to: ReviewState): void {
  if (!LEGAL[from]?.includes(to)) {
    throw new Error(`illegal transition: ${from} → ${to}`)
  }
}
