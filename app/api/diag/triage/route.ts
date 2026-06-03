import { NextResponse } from 'next/server'
import { isAuthorizedCron } from '../../cron/cron-auth'
import { classifyReview } from '@/src/units/triage/triage'
import { llm } from '@/src/lib/llm'

export const dynamic = 'force-dynamic'

// TEMPORARY diagnostic endpoint: classifies a fixed set of sample reviews
// against the live Ollama instance to verify the triage core works in prod.
// Does NOT touch client data or persist anything. Protected by CRON_SECRET.
// Remove after validation.
const SAMPLES = [
  { authorName: 'Rival', rating: 1, text: 'I run the competing roofing company down the street and these guys are total scammers, avoid.', expect: 'violation (CONFLICT_OF_INTEREST)' },
  { authorName: 'Bot', rating: 5, text: 'Best deals here >>> buy cheap backlinks at spammylink dot com click now', expect: 'violation (SPAM)' },
  { authorName: 'Anon', rating: 1, text: 'Never actually used them but I heard from a friend they are bad.', expect: 'violation (FAKE_NO_EXPERIENCE)' },
  { authorName: 'RealCustomer', rating: 2, text: 'They installed my AC three weeks late and the crew left trash in my yard. Disappointed.', expect: 'legitimate (SKIP)' },
]

export async function POST(request: Request) {
  if (!isAuthorizedCron(request)) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }
  const complete = llm()
  const results = []
  for (const s of SAMPLES) {
    const startedAt = Date.now()
    try {
      const r = await classifyReview({ text: s.text, rating: s.rating, authorName: s.authorName }, complete)
      results.push({
        text: s.text,
        expected: s.expect,
        got: r,
        ms: Date.now() - startedAt,
      })
    } catch (err) {
      results.push({
        text: s.text,
        expected: s.expect,
        error: err instanceof Error ? err.message : String(err),
        ms: Date.now() - startedAt,
      })
    }
  }
  return NextResponse.json({ ollamaModel: process.env.OLLAMA_MODEL ?? 'qwen2.5:7b-instruct', results })
}
