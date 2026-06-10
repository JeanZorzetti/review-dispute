import { prisma } from './prisma'
import { encryptJson, decryptJson, isEncrypted } from './crypto'

// Google OAuth token lifecycle. Tokens are stored encrypted (see crypto.ts)
// in Client.oauthTokens. Access tokens expire after ~1h; getValidAccessToken
// refreshes transparently using the stored refresh_token and persists the
// merged result. Legacy plain-JSON rows are read as-is and re-encrypted on
// the next write.

const TOKEN_URL = 'https://oauth2.googleapis.com/token'
const USERINFO_URL = 'https://openidconnect.googleapis.com/v1/userinfo'

export const OAUTH_STATE_COOKIE = 'oauth_state'

// Refresh 60s before the actual expiry to absorb clock skew and request latency.
const EXPIRY_MARGIN_MS = 60_000

export type GoogleTokens = {
  access_token?: string
  refresh_token?: string
  expires_in?: number
  expiry_date?: number // ms epoch, computed by us at save time
  scope?: string
  token_type?: string
  id_token?: string
}

export function withExpiry(tokens: GoogleTokens, now = Date.now()): GoogleTokens {
  if (tokens.expires_in && !tokens.expiry_date) {
    return { ...tokens, expiry_date: now + tokens.expires_in * 1000 }
  }
  return tokens
}

export function parseStoredTokens(value: unknown): GoogleTokens | null {
  if (!value) return null
  if (isEncrypted(value)) return decryptJson<GoogleTokens>(value)
  if (typeof value === 'object') return value as GoogleTokens
  return null
}

export async function saveClientTokens(clientId: string, tokens: GoogleTokens): Promise<GoogleTokens> {
  const existing = parseStoredTokens(
    (await prisma.client.findUniqueOrThrow({ where: { id: clientId }, select: { oauthTokens: true } })).oauthTokens
  )
  // Google omits refresh_token on repeat consents — never lose the one we have.
  const merged = withExpiry({ ...existing, ...tokens, refresh_token: tokens.refresh_token ?? existing?.refresh_token })
  await prisma.client.update({ where: { id: clientId }, data: { oauthTokens: encryptJson(merged) } })
  return merged
}

export async function exchangeCode(code: string, fetchImpl: typeof fetch = fetch): Promise<GoogleTokens> {
  const res = await fetchImpl(TOKEN_URL, {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      redirect_uri: process.env.GOOGLE_REDIRECT_URI!,
      grant_type: 'authorization_code',
    }),
  })
  if (!res.ok) throw new Error(`Google token exchange failed: ${res.status} ${await res.text()}`)
  return withExpiry((await res.json()) as GoogleTokens)
}

export async function fetchUserInfo(
  accessToken: string,
  fetchImpl: typeof fetch = fetch
): Promise<{ email: string; name?: string }> {
  const res = await fetchImpl(USERINFO_URL, { headers: { authorization: `Bearer ${accessToken}` } })
  if (!res.ok) throw new Error(`Google userinfo failed: ${res.status}`)
  const data = (await res.json()) as { email?: string; name?: string }
  if (!data.email) throw new Error('Google userinfo returned no email')
  return { email: data.email.toLowerCase(), name: data.name }
}

async function refreshAccessToken(refreshToken: string, fetchImpl: typeof fetch): Promise<GoogleTokens> {
  const res = await fetchImpl(TOKEN_URL, {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      refresh_token: refreshToken,
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      grant_type: 'refresh_token',
    }),
  })
  if (!res.ok) throw new Error(`Google token refresh failed: ${res.status} ${await res.text()}`)
  return withExpiry((await res.json()) as GoogleTokens)
}

/**
 * Returns a usable access token for the client, refreshing if expired.
 * Returns null when the client has no stored credentials at all.
 * Throws when a refresh is needed but fails (revoked grant, network) so the
 * caller can surface it per-client instead of silently going stale.
 */
export async function getValidAccessToken(
  client: { id: string; oauthTokens: unknown },
  fetchImpl: typeof fetch = fetch
): Promise<string | null> {
  const tokens = parseStoredTokens(client.oauthTokens)
  if (!tokens?.access_token && !tokens?.refresh_token) return null

  const stillValid =
    tokens.access_token && tokens.expiry_date && tokens.expiry_date - EXPIRY_MARGIN_MS > Date.now()
  if (stillValid) return tokens.access_token!

  // Expired (or legacy row with unknown expiry): refresh if we can.
  if (!tokens.refresh_token) {
    // Legacy best effort — token may still work; the GBP call will fail loudly if not.
    return tokens.access_token ?? null
  }
  const refreshed = await refreshAccessToken(tokens.refresh_token, fetchImpl)
  const merged = await saveClientTokens(client.id, refreshed)
  return merged.access_token ?? null
}
