import { NextResponse } from 'next/server'
import { prisma } from '@/src/lib/prisma'
import { llm } from '@/src/lib/llm'
import { classifyReview } from '@/src/units/triage/triage'
import { getPolicy } from '@/src/domain/policies'
import {
  validateCheckerInput,
  hashIp,
  clientIp,
  CHECKER_DAILY_LIMIT,
  RATE_WINDOW_MS,
} from '@/src/lib/checker'

// Public, unauthenticated endpoint behind an IP rate limit. Reuses the same
// triage classifier the paid pipeline runs on synced reviews.
export async function POST(request: Request) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const validation = validateCheckerInput(body)
  if (!validation.ok) {
    return NextResponse.json({ error: validation.error }, { status: 400 })
  }

  const ipHash = hashIp(clientIp(request.headers))
  const since = new Date(Date.now() - RATE_WINDOW_MS)
  const used = await prisma.checkerRun.count({
    where: { ipHash, createdAt: { gte: since } },
  })
  if (used >= CHECKER_DAILY_LIMIT) {
    return NextResponse.json(
      { error: `Free limit reached (${CHECKER_DAILY_LIMIT} checks per day). Try again tomorrow.` },
      { status: 429 }
    )
  }

  if (!process.env.OLLAMA_BASE_URL) {
    console.error('[checker] OLLAMA_BASE_URL not set — checker unavailable')
    return NextResponse.json(
      { error: 'The checker is temporarily unavailable. Please try again later.' },
      { status: 503 }
    )
  }

  const { text, rating, authorName } = validation.input
  let result
  try {
    result = await classifyReview(
      { text, rating: rating ?? 1, authorName: authorName ?? 'Anonymous' },
      llm()
    )
  } catch (e) {
    console.error('[checker] classification failed:', e)
    return NextResponse.json(
      { error: 'Analysis failed. Please try again in a moment.' },
      { status: 502 }
    )
  }

  const run = await prisma.checkerRun.create({
    data: {
      ipHash,
      reviewText: text,
      rating: rating ?? null,
      violationType: result.violationType,
      caseStrength: result.caseStrength,
      confidence: result.confidence,
      eligible: result.eligible,
    },
  })

  return NextResponse.json({
    runId: run.id,
    violationType: result.violationType,
    caseStrength: result.caseStrength,
    confidence: result.confidence,
    eligible: result.eligible,
    needsHumanReview: result.needsHumanReview,
    policy: result.violationType ? getPolicy(result.violationType) : null,
    remaining: CHECKER_DAILY_LIMIT - used - 1,
  })
}
