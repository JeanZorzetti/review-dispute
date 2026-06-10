import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { createSessionToken, verifySessionToken, SESSION_TTL_MS } from './client-tokens'

// Client (customer) session auth, mirroring admin-auth.ts: HMAC-signed cookie,
// no DB session table. Token logic lives in client-tokens.ts.

const COOKIE_NAME = 'client_session'

export { createSessionToken, verifySessionToken, createMagicToken, verifyMagicToken } from './client-tokens'

/** Returns the authenticated client id or redirects to /login. */
export async function requireClientId(): Promise<string> {
  const store = await cookies()
  const clientId = verifySessionToken(store.get(COOKIE_NAME)?.value)
  if (!clientId) redirect('/login')
  return clientId
}

export async function setClientSessionCookie(clientId: string): Promise<void> {
  const store = await cookies()
  store.set(COOKIE_NAME, createSessionToken(clientId), {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: SESSION_TTL_MS / 1000,
  })
}

export async function clearClientSessionCookie(): Promise<void> {
  const store = await cookies()
  store.delete(COOKIE_NAME)
}

export { COOKIE_NAME as CLIENT_COOKIE_NAME }
