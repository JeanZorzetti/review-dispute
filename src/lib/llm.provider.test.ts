import { describe, it, expect } from 'vitest'
import { callProvider } from './llm.provider'

describe('callProvider', () => {
  it('throws a clear error when apiKey is empty', async () => {
    await expect(callProvider('', 'hi')).rejects.toThrow(/api key/i)
  })
})
