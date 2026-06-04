import type { ReactNode } from 'react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { JsonLd } from '@/src/components/seo/JsonLd'
import { organizationSchema, websiteSchema } from '@/src/lib/schema'
import { BLOG_TITLE_TEMPLATE, SITE_NAME } from '@/src/lib/site'
import { CONNECT_URL, PRODUCT_NAME } from '@/src/components/landing/site-config'

export const metadata: Metadata = {
  title: { template: BLOG_TITLE_TEMPLATE, default: `${SITE_NAME} Blog` },
}

export default function BlogLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-bg text-white">
      <JsonLd data={[organizationSchema(), websiteSchema()]} />
      <header className="sticky top-0 z-50 flex items-center justify-between border-b border-line bg-bg/90 px-5 py-4 backdrop-blur md:px-10">
        <Link href="/" className="text-sm font-extrabold uppercase tracking-wide text-accent hover:opacity-80 transition-opacity">
          {PRODUCT_NAME}
        </Link>
        <nav className="flex items-center gap-6">
          <Link href="/blog" className="text-xs font-bold uppercase tracking-wide text-muted hover:text-white transition-colors">
            Blog
          </Link>
          <a
            href={CONNECT_URL}
            className="rounded-md bg-accent px-4 py-2 text-xs font-extrabold uppercase tracking-wide text-white transition-transform hover:scale-105"
          >
            Get Started
          </a>
        </nav>
      </header>
      {children}
    </div>
  )
}
