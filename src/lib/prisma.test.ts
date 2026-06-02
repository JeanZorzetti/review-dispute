import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { prisma } from './prisma'

describe('prisma singleton', () => {
  it('returns the same proxy on repeated imports', async () => {
    const a = (await import('./prisma')).prisma
    const b = (await import('./prisma')).prisma
    expect(a).toBe(b)
    expect(prisma).toBe(a)
  })

  it('globalThis guard prevents duplicate client creation', () => {
    const globalForPrisma = globalThis as unknown as { __prismaClient?: unknown }

    // Reset cached client so we can observe fresh construction
    const previousClient = globalForPrisma.__prismaClient
    const previousUrl = process.env.DATABASE_URL
    delete globalForPrisma.__prismaClient
    process.env.DATABASE_URL = 'postgresql://user:pass@localhost:5432/testdb'

    try {
      // Trigger lazy init by accessing a property on the proxy
      void (prisma as any).$connect
      expect(globalForPrisma.__prismaClient).toBeDefined()

      // Accessing again must return the same cached instance — not a new one
      const before = globalForPrisma.__prismaClient
      void (prisma as any).$connect
      expect(globalForPrisma.__prismaClient).toBe(before)
    } finally {
      // Restore original state
      globalForPrisma.__prismaClient = previousClient
      if (previousUrl !== undefined) {
        process.env.DATABASE_URL = previousUrl
      } else {
        delete process.env.DATABASE_URL
      }
    }
  })
})
