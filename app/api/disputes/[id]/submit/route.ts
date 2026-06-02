import { NextResponse } from 'next/server'
import { markSubmitted } from '@/src/units/executor/executor'

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  await markSubmitted(id)
  return NextResponse.json({ ok: true })
}
