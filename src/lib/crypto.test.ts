import { describe, it, expect, beforeEach } from 'vitest'
import { encryptJson, decryptJson, isEncrypted } from './crypto'

beforeEach(() => {
  process.env.TOKEN_ENCRYPTION_KEY ??= 'a'.repeat(64)
})

describe('crypto', () => {
  it('round-trips a JSON value', () => {
    const value = { access_token: 'ya29.secret', refresh_token: '1//abc', expiry_date: 123 }
    const payload = encryptJson(value)
    expect(isEncrypted(payload)).toBe(true)
    expect(payload).not.toContain('ya29.secret')
    expect(decryptJson(payload)).toEqual(value)
  })

  it('produces a different ciphertext each time (random IV)', () => {
    expect(encryptJson({ a: 1 })).not.toBe(encryptJson({ a: 1 }))
  })

  it('rejects tampered payloads', () => {
    const payload = encryptJson({ a: 1 })
    const tampered = payload.slice(0, -4) + 'AAAA'
    expect(() => decryptJson(tampered)).toThrow()
  })

  it('identifies non-encrypted values', () => {
    expect(isEncrypted({ access_token: 'plain' })).toBe(false)
    expect(isEncrypted(null)).toBe(false)
    expect(isEncrypted('just a string')).toBe(false)
  })

  it('throws without a key', () => {
    const saved = process.env.TOKEN_ENCRYPTION_KEY
    delete process.env.TOKEN_ENCRYPTION_KEY
    try {
      expect(() => encryptJson({ a: 1 })).toThrow(/TOKEN_ENCRYPTION_KEY/)
    } finally {
      process.env.TOKEN_ENCRYPTION_KEY = saved
    }
  })
})
