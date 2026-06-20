import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import { AUTHORS } from '@/content/authors'
import { getAllPosts } from '@/src/lib/blog'
import { JsonLd } from '@/src/components/seo/JsonLd'
import { SITE_URL } from '@/src/lib/site'

export const dynamicParams = false

export function generateStaticParams() {
  return Object.keys(AUTHORS).map((id) => ({ id }))
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params
  const a = AUTHORS[id]
  if (!a) return {}
  return { title: a.name, description: a.bio, alternates: { canonical: `/blog/author/${id}` } }
}

export default async function AuthorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const author = AUTHORS[id]
  if (!author) notFound()
  const posts = getAllPosts().filter((p) => p.author === id)
  const personSchema = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: author.name,
    jobTitle: author.role,
    description: author.bio,
    knowsAbout: author.knowsAbout,
    url: `${SITE_URL}/blog/author/${id}`,
    ...(author.sameAs && author.sameAs.length > 0 ? { sameAs: author.sameAs } : {}),
  }
  return (
    <main className="mx-auto max-w-3xl px-5 py-12 md:px-8">
      <JsonLd data={personSchema} />
      <h1 className="text-3xl font-black">{author.name}</h1>
      <p className="mt-1 text-sm text-accent">{author.role}</p>
      <p className="mt-4 text-muted">{author.bio}</p>

      {author.credentials && author.credentials.length > 0 && (
        <ul className="mt-4 space-y-1">
          {author.credentials.map((c) => (
            <li key={c} className="flex items-center gap-2 text-sm text-muted">
              <span className="text-accent">✓</span> {c}
            </li>
          ))}
        </ul>
      )}

      {author.mediaMentions && author.mediaMentions.length > 0 && (
        <div className="mt-6">
          <p className="text-xs font-bold uppercase tracking-wide text-muted">As featured in</p>
          <ul className="mt-2 space-y-1">
            {author.mediaMentions.map((m) => (
              <li key={m} className="text-sm text-muted">{m}</li>
            ))}
          </ul>
        </div>
      )}

      <h2 className="mt-10 text-sm font-bold uppercase tracking-wide text-muted">Articles by {author.name}</h2>
      <div className="mt-4 grid gap-3">
        {posts.map((p) => (
          <Link key={p.slug} href={`/blog/${p.slug}`} className="rounded-lg border border-line bg-surface p-4 hover:border-accent">
            <p className="font-bold">{p.title}</p>
            <p className="mt-1 text-sm text-muted">{p.description}</p>
          </Link>
        ))}
        {posts.length === 0 && <p className="text-sm text-muted">No articles yet.</p>}
      </div>
    </main>
  )
}
