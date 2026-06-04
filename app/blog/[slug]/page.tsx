import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { MDXRemote } from 'next-mdx-remote/rsc'
import remarkGfm from 'remark-gfm'
import rehypeSlug from 'rehype-slug'
import rehypeAutolinkHeadings from 'rehype-autolink-headings'
import { getAllPosts, getPostBySlug, getRelated } from '@/src/lib/blog'
import { mdxComponents } from '@/src/lib/mdx-components'
import { JsonLd } from '@/src/components/seo/JsonLd'
import { blogPostingSchema, faqPageSchema, breadcrumbSchema } from '@/src/lib/schema'
import { clusterLabel } from '@/src/lib/clusters'
import { SITE_URL } from '@/src/lib/site'
import Link from 'next/link'

export const dynamicParams = false

export function generateStaticParams() {
  return getAllPosts().map((p) => ({ slug: p.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const post = getPostBySlug(slug)
  if (!post) return {}
  return {
    title: post.title,
    description: post.description,
    keywords: post.keywords,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      type: 'article',
      title: post.title,
      description: post.description,
      url: `${SITE_URL}/blog/${post.slug}`,
      publishedTime: post.datePublished,
      modifiedTime: post.dateModified,
      images: post.ogImage ? [post.ogImage] : undefined,
    },
    twitter: { card: 'summary_large_image', title: post.title, description: post.description },
  }
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const post = getPostBySlug(slug)
  if (!post) notFound()

  const related = getRelated(post, 3)
  // Author resolution is Phase 3 (content/authors.ts). For now use a sensible default.
  const author = { name: 'The ReviewShield Team', role: 'Reputation Specialists' }

  const schemas = [
    blogPostingSchema(post, author),
    breadcrumbSchema([
      { name: 'Home', url: '/' },
      { name: 'Blog', url: '/blog' },
      { name: clusterLabel(post.cluster), url: `/blog/category/${post.cluster}` },
      { name: post.title, url: `/blog/${post.slug}` },
    ]),
    ...(post.faqs && post.faqs.length ? [faqPageSchema(post.faqs)] : []),
  ]

  return (
    <article className="mx-auto max-w-3xl px-5 py-12 md:px-8">
      <JsonLd data={schemas} />

      <nav className="text-xs text-muted">
        <Link href="/blog" className="hover:text-accent">Blog</Link>
        {' / '}
        <Link href={`/blog/category/${post.cluster}`} className="hover:text-accent">{clusterLabel(post.cluster)}</Link>
      </nav>

      <header className="mt-4">
        <h1 className="text-3xl font-black uppercase leading-tight md:text-4xl">{post.title}</h1>
        <div className="mt-3 text-sm text-muted">
          {author.name} · {new Date(post.datePublished).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })} · {post.readingMinutes} min read
        </div>
      </header>

      {post.takeaways && post.takeaways.length > 0 && (
        <div className="mt-8 rounded-lg border border-line bg-surface p-5">
          <h2 className="text-sm font-bold uppercase tracking-wide text-accent">Key Takeaways</h2>
          <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-muted">
            {post.takeaways.map((t, i) => <li key={i}>{t}</li>)}
          </ul>
        </div>
      )}

      <div className="prose prose-invert mt-8 max-w-none prose-headings:font-extrabold prose-a:text-accent">
        <MDXRemote
          source={post.content}
          components={mdxComponents}
          options={{ mdxOptions: { remarkPlugins: [remarkGfm], rehypePlugins: [rehypeSlug, [rehypeAutolinkHeadings, { behavior: 'wrap' }]] } }}
        />
      </div>

      {post.faqs && post.faqs.length > 0 && (
        <section className="mt-12">
          <h2 className="text-2xl font-extrabold uppercase">FAQ</h2>
          <div className="mt-4 space-y-4">
            {post.faqs.map((f, i) => (
              <div key={i} className="rounded-lg border border-line bg-surface p-4">
                <p className="font-bold">{f.q}</p>
                <p className="mt-1 text-sm text-muted">{f.a}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {related.length > 0 && (
        <section className="mt-12 border-t border-line pt-8">
          <h2 className="text-sm font-bold uppercase tracking-wide text-muted">Related articles</h2>
          <div className="mt-4 grid gap-3">
            {related.map((r) => (
              <Link key={r.slug} href={`/blog/${r.slug}`} className="rounded-lg border border-line bg-surface p-4 hover:border-accent">
                <p className="font-bold">{r.title}</p>
                <p className="mt-1 text-sm text-muted">{r.description}</p>
              </Link>
            ))}
          </div>
        </section>
      )}
    </article>
  )
}
