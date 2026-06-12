import { NextResponse } from 'next/server'
import { prisma } from '@/src/lib/prisma'
import { sendEmail } from '@/src/lib/email'
import { checkerAssessmentEmail } from '@/src/lib/email-templates'
import { isValidEmail } from '@/src/lib/checker'

export async function POST(request: Request) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { email, runId } = (body ?? {}) as Record<string, unknown>
  if (!isValidEmail(email)) {
    return NextResponse.json({ error: 'Enter a valid email address' }, { status: 400 })
  }

  let run = null
  if (typeof runId === 'string' && runId) {
    run = await prisma.checkerRun.findUnique({ where: { id: runId } })
    if (!run) return NextResponse.json({ error: 'Unknown check' }, { status: 400 })
    // A run converts at most once; later submissions just keep the first lead.
    const existing = await prisma.checkerLead.findUnique({ where: { runId } })
    if (existing) return NextResponse.json({ ok: true })
  }

  await prisma.checkerLead.create({
    data: { email, runId: run?.id ?? null },
  })

  // Fire-and-forget: email failure must not break the lead capture.
  void sendEmail(
    checkerAssessmentEmail(email, {
      violationType: run?.violationType ?? null,
      caseStrength: run?.caseStrength ?? 'NONE',
      eligible: run?.eligible ?? false,
    })
  )

  return NextResponse.json({ ok: true })
}
