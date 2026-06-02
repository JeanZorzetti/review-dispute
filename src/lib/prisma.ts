import { PrismaClient } from '../../app/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

type PrismaClientInstance = InstanceType<typeof PrismaClient>

const globalForPrisma = globalThis as unknown as {
  __prismaClient?: PrismaClientInstance
}

function getClient(): PrismaClientInstance {
  if (!globalForPrisma.__prismaClient) {
    const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL ?? '' })
    globalForPrisma.__prismaClient = new PrismaClient({ adapter })
  }
  return globalForPrisma.__prismaClient
}

// Lazy proxy — defers PrismaClient construction until first property access.
// This prevents build-time / import-time failures when DATABASE_URL is absent.
export const prisma = new Proxy({} as PrismaClientInstance, {
  get(_target, prop) {
    const client = getClient()
    const val = (client as Record<string | symbol, unknown>)[prop]
    return typeof val === 'function' ? (val as Function).bind(client) : val
  },
})
