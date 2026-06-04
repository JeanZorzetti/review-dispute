import type { Metadata } from 'next'
import Link from 'next/link'
import { getAllClusters, getCluster } from '@/src/lib/blog'
import { clusterLabel } from '@/src/lib/clusters'
import { SITE_NAME } from '@/src/lib/site'

export const metadata: Metadata = {
  title: 'Blog',
  description: `Guides on Google review removal, reputation, and local SEO for contractors from ${SITE_NAME}.`,
  alternates: { canonical: '/blog' },
}

export default function BlogIndex() {
  const clusters = getAllClusters()
  return (
    <main className="mx-auto max-w-5xl px-5 py-12 md:px-8">
      <h1 className="text-3xl font-black uppercase md:text-4xl">The ReviewShield Blog</h1>
      <p className="mt-3 max-w-2xl text-muted">Google review removal, reputation management, and local SEO — written for contractors.</p>

      {clusters.length === 0 && <p className="mt-10 text-muted">No articles yet.</p>}

      <div className="mt-12 space-y-12">
        {clusters.map((c) => {
          const { pillar, members } = getCluster(c)
          const posts = [pillar, ...members].filter((p): p is NonNullable<typeof p> => p !== null)
          return (
            <section key={c}>
              <h2 className="text-sm font-bold uppercase tracking-wide text-accent">{clusterLabel(c)}</h2>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {posts.map((p) => (
                  <Link key={p.slug} href={`/blog/${p.slug}`} className="rounded-lg border border-line bg-surface p-4 hover:border-accent">
                    <p className="font-bold">{p.title}</p>
                    <p className="mt-1 text-sm text-muted">{p.description}</p>
                    <p className="mt-2 text-xs text-muted">{p.readingMinutes} min read</p>
                  </Link>
                ))}
              </div>
            </section>
          )
        })}
      </div>
    </main>
  )
}
