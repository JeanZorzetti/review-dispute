import { describe, it, expect } from 'vitest'
import { sendEmail } from './email'

describe('sendEmail', () => {
  it('skips quietly when RESEND_API_KEY is not set', async () => {
    const saved = process.env.RESEND_API_KEY
    delete process.env.RESEND_API_KEY
    try {
      const result = await sendEmail({ to: 'a@b.com', subject: 's', html: '<p>x</p>' })
      expect(result.sent).toBe(false)
      expect(result.skipped).toMatch(/RESEND_API_KEY/)
    } finally {
      if (saved) process.env.RESEND_API_KEY = saved
    }
  })

  it('posts to Resend and reports success', async () => {
    process.env.RESEND_API_KEY = 're_test_key'
    try {
      let captured: { url: string; init: RequestInit } | null = null
      const fakeFetch: typeof fetch = (async (url: string, init: RequestInit) => {
        captured = { url, init }
        return { ok: true, status: 200, json: async () => ({ id: 'em_1' }), text: async () => '' } as Response
      }) as typeof fetch

      const result = await sendEmail({ to: 'a@b.com', subject: 'Hello', html: '<p>x</p>' }, fakeFetch)
      expect(result.sent).toBe(true)
      expect(captured!.url).toBe('https://api.resend.com/emails')
      const body = JSON.parse(String(captured!.init.body))
      expect(body.to).toBe('a@b.com')
      expect(body.subject).toBe('Hello')
    } finally {
      delete process.env.RESEND_API_KEY
    }
  })

  it('fails soft on a Resend error response', async () => {
    process.env.RESEND_API_KEY = 're_test_key'
    try {
      const fakeFetch: typeof fetch = (async () =>
        ({ ok: false, status: 422, json: async () => ({}), text: async () => 'bad' }) as Response) as typeof fetch
      const result = await sendEmail({ to: 'a@b.com', subject: 's', html: 'x' }, fakeFetch)
      expect(result.sent).toBe(false)
      expect(result.error).toMatch(/422/)
    } finally {
      delete process.env.RESEND_API_KEY
    }
  })

  it('fails soft when fetch itself throws', async () => {
    process.env.RESEND_API_KEY = 're_test_key'
    try {
      const fakeFetch: typeof fetch = (async () => {
        throw new Error('network down')
      }) as typeof fetch
      const result = await sendEmail({ to: 'a@b.com', subject: 's', html: 'x' }, fakeFetch)
      expect(result.sent).toBe(false)
      expect(result.error).toBe('network down')
    } finally {
      delete process.env.RESEND_API_KEY
    }
  })
})
