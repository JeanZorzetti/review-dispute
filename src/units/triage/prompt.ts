import { VIOLATION_TYPES } from '../../domain/policies'

export function buildTriagePrompt(review: { text: string; rating: number; authorName: string }): string {
  const catalog = VIOLATION_TYPES.map((t) => `- ${t}`).join('\n')
  return [
    'You are a strict Google review policy auditor for a US home-services business.',
    'Decide ONLY whether this review violates a Google policy. A negative-but-genuine customer experience is NOT a violation and must return violationType: null.',
    'Violation types:',
    catalog,
    'Return strict JSON: {"violationType": <one of the violation types or null>, "caseStrength": "HIGH"|"MEDIUM"|"NONE", "confidence": 0..1}',
    `Review by ${review.authorName} (rating ${review.rating}): """${review.text}"""`,
  ].join('\n')
}
