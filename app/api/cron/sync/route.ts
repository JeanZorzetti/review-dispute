import { NextResponse } from 'next/server'
import { isAuthorizedCron } from '../cron-auth'
import { runSyncAllClients } from '@/src/units/operations/run-all'
import { alertAdmin } from '@/src/lib/alert'

export async function POST(request: Request) {
  if (!isAuthorizedCron(request)) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  try {
    const result = await runSyncAllClients()
    if (result.errors.length > 0) {
      await alertAdmin(
        `cron/sync: ${result.errors.length} client(s) failed`,
        result.errors.map((e) => `${e.clientId}: ${e.error}`).join('\n')
      )
    }
    return NextResponse.json({ ok: true, ...result })
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e)
    await alertAdmin('cron/sync: run crashed', message)
    return NextResponse.json({ ok: false, error: message }, { status: 500 })
  }
}
