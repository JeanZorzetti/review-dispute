import type { ReactNode } from 'react'
import type { Metadata } from 'next'
import { JsonLd } from '@/src/components/seo/JsonLd'
import { organizationSchema, websiteSchema } from '@/src/lib/schema'
import { BLOG_TITLE_TEMPLATE, SITE_NAME } from '@/src/lib/site'

export const metadata: Metadata = {
  title: { template: BLOG_TITLE_TEMPLATE, default: `${SITE_NAME} Blog` },
}

export default function BlogLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-bg text-white">
      <JsonLd data={[organizationSchema(), websiteSchema()]} />
      {children}
    </div>
  )
}
