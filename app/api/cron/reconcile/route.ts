import { NextResponse } from 'next/server'
import { isAuthorizedCron } from '../cron-auth'
import { runReconcileAllClients } from '@/src/units/operations/run-all'

export async function POST(request: Request) {
  if (!isAuthorizedCron(request)) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  const result = await runReconcileAllClients()
  return NextResponse.json({ ok: true, ...result })
}
