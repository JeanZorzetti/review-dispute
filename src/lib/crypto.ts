import { createCipheriv, createDecipheriv, randomBytes } from 'crypto'

// AES-256-GCM envelope for secrets at rest (OAuth tokens). Key is a 64-char
// hex string in TOKEN_ENCRYPTION_KEY. Format: enc:v1:<iv>:<authTag>:<ciphertext>
// (all base64). Legacy rows written before encryption are plain JSON objects —
// callers detect those with isEncrypted() and re-encrypt on next write.

const PREFIX = 'enc:v1:'

function key(): Buffer {
  const hex = process.env.TOKEN_ENCRYPTION_KEY
  if (!hex) throw new Error('TOKEN_ENCRYPTION_KEY is not set')
  const buf = Buffer.from(hex, 'hex')
  if (buf.length !== 32) throw new Error('TOKEN_ENCRYPTION_KEY must be 64 hex chars (32 bytes)')
  return buf
}

export function encryptJson(value: unknown): string {
  const iv = randomBytes(12)
  const cipher = createCipheriv('aes-256-gcm', key(), iv)
  const plaintext = Buffer.from(JSON.stringify(value), 'utf8')
  const ciphertext = Buffer.concat([cipher.update(plaintext), cipher.final()])
  const tag = cipher.getAuthTag()
  return `${PREFIX}${iv.toString('base64')}:${tag.toString('base64')}:${ciphertext.toString('base64')}`
}

export function decryptJson<T>(payload: string): T {
  if (!payload.startsWith(PREFIX)) throw new Error('not an encrypted payload')
  const [iv, tag, data] = payload.slice(PREFIX.length).split(':')
  if (!iv || !tag || !data) throw new Error('malformed encrypted payload')
  const decipher = createDecipheriv('aes-256-gcm', key(), Buffer.from(iv, 'base64'))
  decipher.setAuthTag(Buffer.from(tag, 'base64'))
  const plaintext = Buffer.concat([decipher.update(Buffer.from(data, 'base64')), decipher.final()])
  return JSON.parse(plaintext.toString('utf8')) as T
}

export function isEncrypted(value: unknown): value is string {
  return typeof value === 'string' && value.startsWith(PREFIX)
}
