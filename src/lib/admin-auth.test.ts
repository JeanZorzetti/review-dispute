import { describe, it, expect, beforeEach } from 'vitest'
import { verifyPassword, createSessionToken, verifySessionToken } from './admin-auth'

beforeEach(() => {
  process.env.ADMIN_PASSWORD = 'hunter2'
  process.env.ADMIN_SESSION_SECRET = 'sekret'
})

describe('admin-auth', () => {
  it('verifyPassword accepts the correct password', () => {
    expect(verifyPassword('hunter2')).toBe(true)
  })
  it('verifyPassword rejects the wrong password', () => {
    expect(verifyPassword('nope')).toBe(false)
  })
  it('verifyPassword returns false when ADMIN_PASSWORD is unset', () => {
    delete process.env.ADMIN_PASSWORD
    expect(verifyPassword('anything')).toBe(false)
  })
  it('a created session token verifies as valid', () => {
    const token = createSessionToken()
    expect(verifySessionToken(token)).toBe(true)
  })
  it('a tampered token is invalid', () => {
    const token = createSessionToken()
    expect(verifySessionToken(token + 'x')).toBe(false)
  })
  it('a token signed with a different secret is invalid', () => {
    const token = createSessionToken()
    process.env.ADMIN_SESSION_SECRET = 'different'
    expect(verifySessionToken(token)).toBe(false)
  })
})
