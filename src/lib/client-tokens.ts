import { createHmac, timingSafeEqual } from 'crypto'

// Pure token logic for client (customer) auth — no Next.js imports so it can
// be unit-tested directly. Cookie/redirect wrappers live in client-auth.ts.
// Two token kinds share the signing scheme but carry a purpose tag so a
// magic-link token can never be replayed as a session cookie.

export const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000 // 30 days
export const MAGIC_TTL_MS = 15 * 60 * 1000 // 15 minutes

function secret(): string {
  const s = process.env.CLIENT_SESSION_SECRET ?? process.env.ADMIN_SESSION_SECRET
  if (!s) throw new Error('CLIENT_SESSION_SECRET is not set')
  return s
}

function sign(payload: string): string {
  return createHmac('sha256', secret()).update(payload).digest('hex')
}

function createToken(purpose: 'session' | 'magic', clientId: string, ttlMs: number): string {
  const payload = `${purpose}:${clientId}:${Date.now() + ttlMs}`
  return `${payload}.${sign(payload)}`
}

function verifyToken(purpose: 'session' | 'magic', token: string | undefined): string | null {
  if (!token) return null
  const dot = token.lastIndexOf('.')
  if (dot < 0) return null
  const payload = token.slice(0, dot)
  const mac = token.slice(dot + 1)
  const [kind, clientId, expiresAt] = payload.split(':')
  if (kind !== purpose || !clientId || !expiresAt) return null
  try {
    const a = Buffer.from(mac)
    const b = Buffer.from(sign(payload))
    if (a.length !== b.length) return null
    if (!timingSafeEqual(a, b)) return null
  } catch {
    return null
  }
  if (Number(expiresAt) < Date.now()) return null
  return clientId
}

export function createSessionToken(clientId: string): string {
  return createToken('session', clientId, SESSION_TTL_MS)
}

export function verifySessionToken(token: string | undefined): string | null {
  return verifyToken('session', token)
}

export function createMagicToken(clientId: string): string {
  return createToken('magic', clientId, MAGIC_TTL_MS)
}

export function verifyMagicToken(token: string | undefined): string | null {
  return verifyToken('magic', token)
}
