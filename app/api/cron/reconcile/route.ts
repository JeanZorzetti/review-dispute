import { NextResponse } from 'next/server'
import { isAuthorizedCron } from '../cron-auth'
import { runReconcileAllClients } from '@/src/units/operations/run-all'
import { alertAdmin } from '@/src/lib/alert'

export async function POST(request: Request) {
  if (!isAuthorizedCron(request)) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  try {
    const result = await runReconcileAllClients()
    if (result.errors.length > 0) {
      await alertAdmin(
        `cron/reconcile: ${result.errors.length} client(s) failed`,
        result.errors.map((e) => `${e.clientId}: ${e.error}`).join('\n')
      )
    }
    return NextResponse.json({ ok: true, ...result })
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e)
    await alertAdmin('cron/reconcile: run crashed', message)
    return NextResponse.json({ ok: false, error: message }, { status: 500 })
  }
}
