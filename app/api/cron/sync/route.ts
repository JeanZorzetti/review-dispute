import { NextResponse } from 'next/server'
import { isAuthorizedCron } from '../cron-auth'
import { runSyncAllClients } from '@/src/units/operations/run-all'

export async function POST(request: Request) {
  if (!isAuthorizedCron(request)) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  const result = await runSyncAllClients()
  return NextResponse.json({ ok: true, ...result })
}
