import { describe, it, expect } from 'vitest'
import { VIOLATION_TYPES, getPolicy } from './policies'

describe('policies', () => {
  it('exposes the canonical violation types', () => {
    expect(VIOLATION_TYPES).toEqual(
      expect.arrayContaining(['OFF_TOPIC', 'FAKE_NO_EXPERIENCE', 'CONFLICT_OF_INTEREST', 'SPAM', 'PROHIBITED_CONTENT'])
    )
  })
  it('returns a description and citation per type', () => {
    const p = getPolicy('OFF_TOPIC')
    expect(p.description.length).toBeGreaterThan(10)
    expect(p.citation.length).toBeGreaterThan(0)
  })
})
