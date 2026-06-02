export const VIOLATION_TYPES = [
  'OFF_TOPIC',
  'FAKE_NO_EXPERIENCE',
  'CONFLICT_OF_INTEREST',
  'SPAM',
  'PROHIBITED_CONTENT',
] as const
export type ViolationType = (typeof VIOLATION_TYPES)[number]

interface Policy { description: string; citation: string }

const POLICIES: Record<ViolationType, Policy> = {
  OFF_TOPIC: {
    description: 'Content not about the customer experience at this business (rants, unrelated topics).',
    citation: 'Google Maps reviews policy — Off-topic',
  },
  FAKE_NO_EXPERIENCE: {
    description: 'Reviewer never used the business; fabricated or no genuine interaction.',
    citation: 'Google Maps reviews policy — Fake engagement',
  },
  CONFLICT_OF_INTEREST: {
    description: 'Posted by a competitor, ex-employee, or someone with a stake in harming the business.',
    citation: 'Google Maps reviews policy — Conflict of interest',
  },
  SPAM: {
    description: 'Repetitive, promotional, or auto-generated content.',
    citation: 'Google Maps reviews policy — Spam & fake content',
  },
  PROHIBITED_CONTENT: {
    description: 'Harassment, hate speech, profanity, or other restricted content.',
    citation: 'Google Maps reviews policy — Restricted content',
  },
}

export function getPolicy(type: ViolationType): Policy {
  return POLICIES[type]
}
