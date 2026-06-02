import { NextResponse } from 'next/server'
import { markDenied } from '@/src/units/tracker/mark-denied'

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  await markDenied(id)
  return NextResponse.json({ ok: true })
}
