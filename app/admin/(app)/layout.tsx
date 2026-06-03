import Link from 'next/link'
import { requireAdmin } from '@/src/lib/admin-auth'
import type { ReactNode } from 'react'

export const dynamic = 'force-dynamic'

export default async function AdminAppLayout({ children }: { children: ReactNode }) {
  await requireAdmin()
  return (
    <div>
      <nav className="flex gap-6 border-b border-line px-6 py-4 text-sm">
        <Link href="/admin" className="font-bold hover:text-accent">Disputes</Link>
        <Link href="/admin/clients" className="hover:text-accent">Clients</Link>
      </nav>
      {children}
    </div>
  )
}
