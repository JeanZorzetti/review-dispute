import { prisma } from '../../lib/prisma'

export async function removalRateByViolationType(): Promise<Record<string, number>> {
  const outcomes = await prisma.outcome.findMany({ include: { dispute: true } })
  const tally: Record<string, { removed: number; total: number }> = {}
  for (const o of outcomes) {
    const vt = o.dispute.violationType
    tally[vt] ??= { removed: 0, total: 0 }
    tally[vt].total++
    if (o.result === 'REMOVED') tally[vt].removed++
  }
  const rates: Record<string, number> = {}
  for (const [vt, { removed, total }] of Object.entries(tally)) {
    rates[vt] = total === 0 ? 0 : removed / total
  }
  return rates
}
