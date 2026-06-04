import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import { getAllClusters, getCluster } from '@/src/lib/blog'
import { clusterLabel } from '@/src/lib/clusters'
import { JsonLd } from '@/src/components/seo/JsonLd'
import { breadcrumbSchema } from '@/src/lib/schema'

export const dynamicParams = false

export function generateStaticParams() {
  return getAllClusters().map((cluster) => ({ cluster }))
}

export async function generateMetadata({ params }: { params: Promise<{ cluster: string }> }): Promise<Metadata> {
  const { cluster } = await params
  const label = clusterLabel(cluster)
  return {
    title: label,
    description: `${label} articles for contractors.`,
    alternates: { canonical: `/blog/category/${cluster}` },
  }
}

export default async function ClusterHub({ params }: { params: Promise<{ cluster: string }> }) {
  const { cluster } = await params
  const { pillar, members } = getCluster(cluster)
  const posts = [pillar, ...members].filter((p): p is NonNullable<typeof p> => p !== null)
  if (posts.length === 0) notFound()
  const label = clusterLabel(cluster)
  return (
    <main className="mx-auto max-w-4xl px-5 py-12 md:px-8">
      <JsonLd data={breadcrumbSchema([{ name: 'Home', url: '/' }, { name: 'Blog', url: '/blog' }, { name: label, url: `/blog/category/${cluster}` }])} />
      <nav className="text-xs text-muted"><Link href="/blog" className="hover:text-accent">Blog</Link> / {label}</nav>
      <h1 className="mt-4 text-3xl font-black uppercase md:text-4xl">{label}</h1>
      <div className="mt-8 grid gap-3">
        {posts.map((p) => (
          <Link key={p.slug} href={`/blog/${p.slug}`} className="rounded-lg border border-line bg-surface p-4 hover:border-accent">
            <p className="font-bold">{p.title}</p>
            <p className="mt-1 text-sm text-muted">{p.description}</p>
          </Link>
        ))}
      </div>
    </main>
  )
}
