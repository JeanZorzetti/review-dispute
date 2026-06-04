import { describe, it, expect } from 'vitest'
import { organizationSchema, breadcrumbSchema, faqPageSchema, blogPostingSchema } from './schema'
import type { Post } from './blog'

describe('schema builders', () => {
  it('organizationSchema has correct type and url', () => {
    const s = organizationSchema()
    expect(s['@type']).toBe('Organization')
    expect(s.url).toContain('reviewshield.nimblabs.com')
  })
  it('breadcrumbSchema numbers positions from 1 and absolutizes urls', () => {
    const s = breadcrumbSchema([{ name: 'Home', url: '/' }, { name: 'Blog', url: '/blog' }])
    expect(s.itemListElement[0].position).toBe(1)
    expect(s.itemListElement[1].item).toBe('https://reviewshield.nimblabs.com/blog')
  })
  it('faqPageSchema maps Q&A to Question/Answer', () => {
    const s = faqPageSchema([{ q: 'Why?', a: 'Because.' }])
    expect(s.mainEntity[0].name).toBe('Why?')
    expect(s.mainEntity[0].acceptedAnswer.text).toBe('Because.')
  })
  it('blogPostingSchema sets headline, author, timeRequired', () => {
    const post = { slug: 's', title: 'T', description: 'd', datePublished: '2026-01-01', readingMinutes: 7, cluster: 'c' } as Post
    const s = blogPostingSchema(post, { name: 'A', role: 'Editor' })
    expect(s.headline).toBe('T')
    expect(s.author.name).toBe('A')
    expect(s.timeRequired).toBe('PT7M')
  })
})
