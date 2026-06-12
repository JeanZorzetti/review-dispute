import { createHash } from 'crypto'
import type { ViolationType } from '../domain/policies'

// Public Fake Review Checker — input validation and IP-based rate limiting
// for the anonymous endpoint. Pure functions; the route wires them to Prisma.

export const CHECKER_DAILY_LIMIT = 5
export const MIN_TEXT_LENGTH = 30
export const MAX_TEXT_LENGTH = 3000
export const RATE_WINDOW_MS = 24 * 60 * 60 * 1000

export interface CheckerInput {
  text: string
  rating?: number
  authorName?: string
}

export type CheckerValidation =
  | { ok: true; input: CheckerInput }
  | { ok: false; error: string }

export function validateCheckerInput(body: unknown): CheckerValidation {
  if (typeof body !== 'object' || body === null) {
    return { ok: false, error: 'Invalid request body' }
  }
  const { text, rating, authorName } = body as Record<string, unknown>

  if (typeof text !== 'string' || text.trim().length === 0) {
    return { ok: false, error: 'Paste the review text to analyze' }
  }
  const trimmed = text.trim()
  if (trimmed.length < MIN_TEXT_LENGTH) {
    return { ok: false, error: `Review text must be at least ${MIN_TEXT_LENGTH} characters` }
  }
  if (trimmed.length > MAX_TEXT_LENGTH) {
    return { ok: false, error: `Review text must be at most ${MAX_TEXT_LENGTH} characters` }
  }

  let parsedRating: number | undefined
  if (rating !== undefined && rating !== null && rating !== '') {
    const n = Number(rating)
    if (!Number.isInteger(n) || n < 1 || n > 5) {
      return { ok: false, error: 'Rating must be a whole number from 1 to 5' }
    }
    parsedRating = n
  }

  let parsedAuthor: string | undefined
  if (authorName !== undefined && authorName !== null) {
    if (typeof authorName !== 'string' || authorName.length > 120) {
      return { ok: false, error: 'Invalid reviewer name' }
    }
    parsedAuthor = authorName.trim() || undefined
  }

  return { ok: true, input: { text: trimmed, rating: parsedRating, authorName: parsedAuthor } }
}

// Hash before storing — we rate-limit by IP without keeping raw IPs at rest.
export function hashIp(ip: string): string {
  const salt = process.env.CHECKER_IP_SALT ?? 'reviewshield-checker'
  return createHash('sha256').update(`${salt}:${ip}`).digest('hex')
}

export function clientIp(headers: Headers): string {
  const forwarded = headers.get('x-forwarded-for')
  if (forwarded) {
    const first = forwarded.split(',')[0]?.trim()
    if (first) return first
  }
  return headers.get('x-real-ip') ?? 'unknown'
}

export function isValidEmail(email: unknown): email is string {
  return (
    typeof email === 'string' &&
    email.length <= 254 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  )
}

export const VIOLATION_LABELS: Record<ViolationType, string> = {
  OFF_TOPIC: 'Off-topic content',
  FAKE_NO_EXPERIENCE: 'Fake engagement (no real experience)',
  CONFLICT_OF_INTEREST: 'Conflict of interest',
  SPAM: 'Spam or fake content',
  PROHIBITED_CONTENT: 'Restricted or prohibited content',
}
