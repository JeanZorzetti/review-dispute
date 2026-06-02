import { describe, it, expect } from 'vitest'
import { assertTransition, ReviewState } from './transitions'

describe('assertTransition', () => {
  it('allows NEW → ELIGIBLE', () => {
    expect(() => assertTransition(ReviewState.NEW, ReviewState.ELIGIBLE)).not.toThrow()
  })
  it('allows NEW → SKIPPED', () => {
    expect(() => assertTransition(ReviewState.NEW, ReviewState.SKIPPED)).not.toThrow()
  })
  it('rejects SKIPPED → SUBMITTED', () => {
    expect(() => assertTransition(ReviewState.SKIPPED, ReviewState.SUBMITTED)).toThrow(/illegal transition/i)
  })
  it('rejects BILLED → anything', () => {
    expect(() => assertTransition(ReviewState.BILLED, ReviewState.REMOVED)).toThrow(/illegal transition/i)
  })
})
