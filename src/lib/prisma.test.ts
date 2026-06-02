import { describe, it, expect } from 'vitest'
import { prisma } from './prisma'

describe('prisma singleton', () => {
  it('returns the same instance on repeated imports', async () => {
    const a = (await import('./prisma')).prisma
    const b = (await import('./prisma')).prisma
    expect(a).toBe(b)
    expect(prisma).toBe(a)
  })
})
