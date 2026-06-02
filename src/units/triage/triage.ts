import { buildTriagePrompt } from './prompt'
import type { LlmComplete } from '../../lib/llm'
import type { ViolationType } from '../../domain/policies'

export interface TriageResult {
  violationType: ViolationType | null
  caseStrength: 'HIGH' | 'MEDIUM' | 'NONE'
  confidence: number
  eligible: boolean
  needsHumanReview: boolean
}

const CONFIDENCE_FLOOR = 0.7

export async function classifyReview(
  review: { text: string; rating: number; authorName: string },
  complete: LlmComplete
): Promise<TriageResult> {
  const raw = await complete(buildTriagePrompt(review))
  let parsed: { violationType: ViolationType | null; caseStrength: 'HIGH' | 'MEDIUM' | 'NONE'; confidence: number }
  try {
    parsed = JSON.parse(raw)
  } catch {
    return { violationType: null, caseStrength: 'NONE', confidence: 0, eligible: false, needsHumanReview: true }
  }
  const confident = parsed.confidence >= CONFIDENCE_FLOOR
  const hasViolation = parsed.violationType != null && parsed.caseStrength !== 'NONE'
  const eligible = hasViolation && confident
  return {
    violationType: parsed.violationType,
    caseStrength: parsed.caseStrength,
    confidence: parsed.confidence,
    eligible,
    needsHumanReview: hasViolation && !confident,
  }
}
