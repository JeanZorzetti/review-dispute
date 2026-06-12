import { describe, it, expect } from 'vitest'
import {
  validateCheckerInput,
  hashIp,
  clientIp,
  isValidEmail,
  MIN_TEXT_LENGTH,
  MAX_TEXT_LENGTH,
} from './checker'

const validText = 'This reviewer never visited our store and is clearly a competitor posting lies.'

describe('validateCheckerInput', () => {
  it('rejects non-object bodies', () => {
    expect(validateCheckerInput(null).ok).toBe(false)
    expect(validateCheckerInput('hi').ok).toBe(false)
  })

  it('rejects missing or empty text', () => {
    expect(validateCheckerInput({}).ok).toBe(false)
    expect(validateCheckerInput({ text: '   ' }).ok).toBe(false)
  })

  it('rejects text below the minimum length', () => {
    const r = validateCheckerInput({ text: 'a'.repeat(MIN_TEXT_LENGTH - 1) })
    expect(r.ok).toBe(false)
  })

  it('rejects text above the maximum length', () => {
    const r = validateCheckerInput({ text: 'a'.repeat(MAX_TEXT_LENGTH + 1) })
    expect(r.ok).toBe(false)
  })

  it('accepts valid text and trims it', () => {
    const r = validateCheckerInput({ text: `  ${validText}  ` })
    expect(r).toEqual({ ok: true, input: { text: validText, rating: undefined, authorName: undefined } })
  })

  it('rejects out-of-range or fractional ratings', () => {
    expect(validateCheckerInput({ text: validText, rating: 0 }).ok).toBe(false)
    expect(validateCheckerInput({ text: validText, rating: 6 }).ok).toBe(false)
    expect(validateCheckerInput({ text: validText, rating: 2.5 }).ok).toBe(false)
  })

  it('accepts a valid rating, including as a numeric string', () => {
    const r1 = validateCheckerInput({ text: validText, rating: 1 })
    expect(r1.ok && r1.input.rating).toBe(1)
    const r2 = validateCheckerInput({ text: validText, rating: '3' })
    expect(r2.ok && r2.input.rating).toBe(3)
  })

  it('treats empty author name as absent and rejects oversized ones', () => {
    const r1 = validateCheckerInput({ text: validText, authorName: '  ' })
    expect(r1.ok && r1.input.authorName).toBeUndefined()
    expect(validateCheckerInput({ text: validText, authorName: 'x'.repeat(121) }).ok).toBe(false)
  })
})

describe('hashIp', () => {
  it('is deterministic and never echoes the raw IP', () => {
    const h = hashIp('203.0.113.7')
    expect(h).toBe(hashIp('203.0.113.7'))
    expect(h).not.toContain('203.0.113.7')
    expect(h).toMatch(/^[a-f0-9]{64}$/)
  })

  it('differs across IPs', () => {
    expect(hashIp('203.0.113.7')).not.toBe(hashIp('203.0.113.8'))
  })
})

describe('clientIp', () => {
  it('takes the first hop from x-forwarded-for', () => {
    const h = new Headers({ 'x-forwarded-for': '203.0.113.7, 10.0.0.1' })
    expect(clientIp(h)).toBe('203.0.113.7')
  })

  it('falls back to x-real-ip, then unknown', () => {
    expect(clientIp(new Headers({ 'x-real-ip': '198.51.100.2' }))).toBe('198.51.100.2')
    expect(clientIp(new Headers())).toBe('unknown')
  })
})

describe('isValidEmail', () => {
  it('accepts normal addresses and rejects junk', () => {
    expect(isValidEmail('owner@business.com')).toBe(true)
    expect(isValidEmail('not-an-email')).toBe(false)
    expect(isValidEmail('a b@c.com')).toBe(false)
    expect(isValidEmail(42)).toBe(false)
  })
})
