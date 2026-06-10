import { describe, it, expect, beforeEach } from 'vitest'
import { prisma } from './prisma'
import { resetDb } from '../test/helpers/db'
import { isEncrypted, decryptJson } from './crypto'
import { parseStoredTokens, saveClientTokens, getValidAccessToken, withExpiry, type GoogleTokens } from './google-oauth'

beforeEach(async () => {
  process.env.TOKEN_ENCRYPTION_KEY ??= 'b'.repeat(64)
  await resetDb()
})

function fakeFetch(body: unknown, ok = true): typeof fetch {
  return (async () =>
    ({ ok, status: ok ? 200 : 400, json: async () => body, text: async () => JSON.stringify(body) }) as Response) as typeof fetch
}

describe('parseStoredTokens', () => {
  it('reads legacy plain-JSON rows', () => {
    expect(parseStoredTokens({ access_token: 'plain' })).toEqual({ access_token: 'plain' })
  })

  it('reads encrypted rows and returns null for empty', () => {
    expect(parseStoredTokens(null)).toBeNull()
    expect(parseStoredTokens(undefined)).toBeNull()
  })
})

describe('withExpiry', () => {
  it('computes expiry_date from expires_in', () => {
    const t = withExpiry({ access_token: 'a', expires_in: 3600 }, 1_000_000)
    expect(t.expiry_date).toBe(1_000_000 + 3_600_000)
  })
})

describe('saveClientTokens', () => {
  it('stores tokens encrypted and preserves the existing refresh_token', async () => {
    const client = await prisma.client.create({ data: { businessName: 'T', email: 'oauth1@t.com' } })
    await saveClientTokens(client.id, { access_token: 'first', refresh_token: 'keep-me', expires_in: 3600 })
    // A refresh response has no refresh_token — the stored one must survive.
    await saveClientTokens(client.id, { access_token: 'second', expires_in: 3600 })

    const row = await prisma.client.findUniqueOrThrow({ where: { id: client.id } })
    expect(isEncrypted(row.oauthTokens)).toBe(true)
    const tokens = decryptJson<GoogleTokens>(row.oauthTokens as string)
    expect(tokens.access_token).toBe('second')
    expect(tokens.refresh_token).toBe('keep-me')
    expect(tokens.expiry_date).toBeGreaterThan(Date.now())
  })
})

describe('getValidAccessToken', () => {
  it('returns null when the client has no credentials', async () => {
    expect(await getValidAccessToken({ id: 'x', oauthTokens: null })).toBeNull()
  })

  it('returns the stored token while it is still fresh (no refresh call)', async () => {
    const client = await prisma.client.create({ data: { businessName: 'T', email: 'oauth2@t.com' } })
    const saved = await saveClientTokens(client.id, { access_token: 'fresh', refresh_token: 'r', expires_in: 3600 })
    const failingFetch: typeof fetch = (async () => {
      throw new Error('should not refresh')
    }) as typeof fetch
    const row = await prisma.client.findUniqueOrThrow({ where: { id: client.id } })
    expect(saved.expiry_date).toBeGreaterThan(Date.now())
    expect(await getValidAccessToken(row, failingFetch)).toBe('fresh')
  })

  it('refreshes an expired token and persists the new one encrypted', async () => {
    const client = await prisma.client.create({ data: { businessName: 'T', email: 'oauth3@t.com' } })
    await saveClientTokens(client.id, {
      access_token: 'stale',
      refresh_token: 'r-1',
      expiry_date: Date.now() - 1000,
    })
    const row = await prisma.client.findUniqueOrThrow({ where: { id: client.id } })
    const token = await getValidAccessToken(row, fakeFetch({ access_token: 'renewed', expires_in: 3600 }))
    expect(token).toBe('renewed')

    const after = await prisma.client.findUniqueOrThrow({ where: { id: client.id } })
    const stored = decryptJson<GoogleTokens>(after.oauthTokens as string)
    expect(stored.access_token).toBe('renewed')
    expect(stored.refresh_token).toBe('r-1')
  })

  it('refreshes legacy plain rows (unknown expiry) when a refresh_token exists', async () => {
    const client = await prisma.client.create({
      data: { businessName: 'T', email: 'oauth4@t.com', oauthTokens: { access_token: 'legacy', refresh_token: 'r-2', expires_in: 3599 } },
    })
    const token = await getValidAccessToken(client, fakeFetch({ access_token: 'renewed-2', expires_in: 3600 }))
    expect(token).toBe('renewed-2')
    // Legacy row got re-encrypted on write.
    const after = await prisma.client.findUniqueOrThrow({ where: { id: client.id } })
    expect(isEncrypted(after.oauthTokens)).toBe(true)
  })

  it('throws loudly when the refresh fails', async () => {
    const client = await prisma.client.create({ data: { businessName: 'T', email: 'oauth5@t.com' } })
    await saveClientTokens(client.id, { access_token: 'stale', refresh_token: 'revoked', expiry_date: Date.now() - 1000 })
    const row = await prisma.client.findUniqueOrThrow({ where: { id: client.id } })
    await expect(getValidAccessToken(row, fakeFetch({ error: 'invalid_grant' }, false))).rejects.toThrow(/refresh failed/)
  })
})
