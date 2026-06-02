import { PrismaClient } from '../../app/generated/prisma/index.js'
import { PrismaPg } from '@prisma/adapter-pg'

const globalForPrisma = globalThis as unknown as {
  __prismaClient?: PrismaClient
}

function getClient(): PrismaClient {
  if (!globalForPrisma.__prismaClient) {
    const url = process.env.DATABASE_URL
    if (!url) throw new Error('DATABASE_URL is not set')
    const adapter = new PrismaPg({ connectionString: url })
    globalForPrisma.__prismaClient = new PrismaClient({ adapter })
  }
  return globalForPrisma.__prismaClient
}

// Lazy proxy — defers PrismaClient construction until first property access.
// This prevents build-time / import-time failures when DATABASE_URL is absent.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const prisma: PrismaClient = new Proxy({} as any, {
  get(_target: unknown, prop: string | symbol) {
    const client = getClient()
    const val = (client as unknown as Record<string | symbol, unknown>)[prop]
    return typeof val === 'function' ? (val as (...args: unknown[]) => unknown).bind(client) : val
  },
}) as PrismaClient
