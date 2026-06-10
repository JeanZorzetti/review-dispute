import { describe, it, expect, beforeEach } from 'vitest'
import { createHmac } from 'crypto'
import { createSessionToken, verifySessionToken, createMagicToken, verifyMagicToken } from './client-tokens'

beforeEach(() => {
  process.env.CLIENT_SESSION_SECRET ??= 'test-secret-for-client-tokens'
})

describe('client tokens', () => {
  it('round-trips a session token', () => {
    const token = createSessionToken('client-123')
    expect(verifySessionToken(token)).toBe('client-123')
  })

  it('round-trips a magic token', () => {
    const token = createMagicToken('client-456')
    expect(verifyMagicToken(token)).toBe('client-456')
  })

  it('rejects a magic token presented as a session token (purpose binding)', () => {
    expect(verifySessionToken(createMagicToken('client-1'))).toBeNull()
    expect(verifyMagicToken(createSessionToken('client-1'))).toBeNull()
  })

  it('rejects tampered tokens', () => {
    const token = createSessionToken('client-123')
    expect(verifySessionToken(token.replace('client-123', 'client-999'))).toBeNull()
    expect(verifySessionToken(token.slice(0, -2) + 'ff')).toBeNull()
    expect(verifySessionToken(undefined)).toBeNull()
    expect(verifySessionToken('garbage')).toBeNull()
  })

  it('rejects expired tokens', () => {
    // Sign a payload whose expiry is in the past with the real secret.
    const payload = `session:client-123:${Date.now() - 1000}`
    const mac = createHmac('sha256', process.env.CLIENT_SESSION_SECRET!).update(payload).digest('hex')
    expect(verifySessionToken(`${payload}.${mac}`)).toBeNull()
  })
})
