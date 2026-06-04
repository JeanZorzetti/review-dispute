import { describe, it, expect } from 'vitest'
import { validateFrontmatter, deriveSlug } from './blog'

describe('blog loader helpers', () => {
  it('deriveSlug uses frontmatter slug when present', () => {
    expect(deriveSlug('foo.mdx', 'custom-slug')).toBe('custom-slug')
  })
  it('deriveSlug falls back to filename', () => {
    expect(deriveSlug('how-to-remove.mdx')).toBe('how-to-remove')
  })
  it('validateFrontmatter throws on missing required field', () => {
    expect(() => validateFrontmatter({ title: 'x', description: 'a'.repeat(100), datePublished: '2026-01-01', author: 'a' }, 'f.mdx')).toThrow(/cluster/)
  })
  it('validateFrontmatter throws on too-short description', () => {
    expect(() => validateFrontmatter({ title: 'x', description: 'short', datePublished: '2026-01-01', author: 'a', cluster: 'c' }, 'f.mdx')).toThrow(/80-165/)
  })
  it('validateFrontmatter passes a valid object', () => {
    expect(() => validateFrontmatter({ title: 'x', description: 'a'.repeat(100), datePublished: '2026-01-01', author: 'a', cluster: 'c' }, 'f.mdx')).not.toThrow()
  })
})
