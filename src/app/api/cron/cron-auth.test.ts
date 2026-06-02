import { describe, it, expect } from 'vitest'
import { isAuthorizedCron } from '../../../../app/api/cron/cron-auth'

describe('isAuthorizedCron', () => {
  it('accepts the correct bearer secret', () => {
    process.env.CRON_SECRET = 's3cret'
    expect(isAuthorizedCron(new Request('http://x', { headers: { authorization: 'Bearer s3cret' } }))).toBe(true)
  })
  it('rejects a wrong secret', () => {
    process.env.CRON_SECRET = 's3cret'
    expect(isAuthorizedCron(new Request('http://x', { headers: { authorization: 'Bearer nope' } }))).toBe(false)
  })
})
