import fs from 'node:fs'
import path from 'node:path'
import matter from 'gray-matter'
import readingTime from 'reading-time'

const BLOG_DIR = path.join(process.cwd(), 'content', 'blog')

export interface PostFrontmatter {
  title: string
  slug?: string
  description: string
  keywords?: string[]
  datePublished: string
  dateModified?: string
  author: string
  reviewedBy?: string
  cluster: string
  pillar?: boolean
  featured?: boolean
  draft?: boolean
  ogImage?: string
  heroImage?: string
  heroAlt?: string
  internalLinks?: string[]
  faqs?: { q: string; a: string }[]
  takeaways?: string[]
}

export interface Post extends PostFrontmatter {
  slug: string
  content: string
  readingMinutes: number
}

const REQUIRED: (keyof PostFrontmatter)[] = ['title', 'description', 'datePublished', 'author', 'cluster']

export function validateFrontmatter(data: Record<string, unknown>, file: string): void {
  for (const field of REQUIRED) {
    if (!data[field]) throw new Error(`Blog frontmatter error in ${file}: missing required field "${String(field)}"`)
  }
  const desc = String(data.description)
  if (desc.length < 80 || desc.length > 165) {
    throw new Error(`Blog frontmatter error in ${file}: description must be 80-165 chars (got ${desc.length})`)
  }
}

export function deriveSlug(filename: string, frontmatterSlug?: string): string {
  return frontmatterSlug ?? filename.replace(/\.mdx$/, '')
}

function parseFile(filename: string): Post {
  const raw = fs.readFileSync(path.join(BLOG_DIR, filename), 'utf-8')
  const { data, content } = matter(raw)
  validateFrontmatter(data, filename)
  const fm = data as PostFrontmatter
  return {
    ...fm,
    slug: deriveSlug(filename, fm.slug),
    content,
    readingMinutes: Math.max(1, Math.round(readingTime(content).minutes)),
    dateModified: fm.dateModified ?? fm.datePublished,
  }
}

export function getAllPosts(): Post[] {
  if (!fs.existsSync(BLOG_DIR)) return []
  return fs
    .readdirSync(BLOG_DIR)
    .filter((f) => f.endsWith('.mdx'))
    .map(parseFile)
    .filter((p) => !p.draft)
    .sort((a, b) => (a.datePublished < b.datePublished ? 1 : -1))
}

export function getPostBySlug(slug: string): Post | null {
  return getAllPosts().find((p) => p.slug === slug) ?? null
}

export function getAllClusters(): string[] {
  return [...new Set(getAllPosts().map((p) => p.cluster))]
}

export function getCluster(cluster: string): { pillar: Post | null; members: Post[] } {
  const posts = getAllPosts().filter((p) => p.cluster === cluster)
  return {
    pillar: posts.find((p) => p.pillar) ?? null,
    members: posts.filter((p) => !p.pillar),
  }
}

export function getRelated(post: Post, limit = 3): Post[] {
  const explicit = (post.internalLinks ?? [])
    .map((s) => getPostBySlug(s))
    .filter((p): p is Post => p !== null)
  const siblings = getAllPosts().filter((p) => p.cluster === post.cluster && p.slug !== post.slug)
  const merged: Post[] = []
  for (const p of [...explicit, ...siblings]) {
    if (!merged.find((m) => m.slug === p.slug)) merged.push(p)
  }
  return merged.slice(0, limit)
}
