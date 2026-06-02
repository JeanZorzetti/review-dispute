import { describe, it, expect } from 'vitest'
import golden from '../../test/fixtures/golden-reviews.json'
import { classifyReview, type TriageResult } from './triage'
import { mockLlm } from '../../lib/llm'

// Deterministic LLM stub: echoes the expected label from each golden fixture
const stub = mockLlm((prompt) => {
  const match = (golden as any[]).find((g) => prompt.includes(g.text))
  return JSON.stringify({
    violationType: match?.expectViolation ?? null,
    caseStrength: match?.expectViolation ? 'HIGH' : 'NONE',
    confidence: 0.95,
  })
})

describe('classifyReview (core)', () => {
  for (const g of golden as any[]) {
    it(`classifies: ${g.note}`, async () => {
      const result: TriageResult = await classifyReview(
        { text: g.text, rating: g.rating, authorName: g.authorName },
        stub
      )
      expect(result.violationType).toBe(g.expectViolation)
      if (g.expectViolation === null) {
        expect(result.eligible).toBe(false)
      } else {
        expect(result.eligible).toBe(true)
      }
    })
  }

  it('treats low confidence as NOT eligible (sends to human review)', async () => {
    const lowConf = mockLlm(() => JSON.stringify({ violationType: 'OFF_TOPIC', caseStrength: 'HIGH', confidence: 0.4 }))
    const r = await classifyReview({ text: 'ambiguous', rating: 1, authorName: 'Z' }, lowConf)
    expect(r.eligible).toBe(false)
    expect(r.needsHumanReview).toBe(true)
  })
})
