import { describe, it, expect, vi, afterEach } from 'vitest'
import { callProvider } from './llm.provider'

afterEach(() => { vi.restoreAllMocks() })

describe('callProvider (Ollama)', () => {
  it('throws a clear error when baseUrl is empty', async () => {
    await expect(callProvider('', 'hi')).rejects.toThrow(/base url/i)
  })

  it('posts to /api/generate and returns the model response field', async () => {
    const fetchMock = vi.fn(async () => ({
      ok: true,
      json: async () => ({ response: '{"violationType":null,"caseStrength":"NONE","confidence":0.9}' }),
    })) as unknown as typeof fetch
    vi.stubGlobal('fetch', fetchMock)

    const out = await callProvider('http://ollama:11434', 'classify this')

    expect(out).toBe('{"violationType":null,"caseStrength":"NONE","confidence":0.9}')
    expect(fetchMock).toHaveBeenCalledWith(
      'http://ollama:11434/api/generate',
      expect.objectContaining({ method: 'POST' })
    )
    const body = JSON.parse((fetchMock as unknown as ReturnType<typeof vi.fn>).mock.calls[0][1].body)
    expect(body.format).toBe('json')
    expect(body.stream).toBe(false)
  })

  it('throws on non-ok HTTP status', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => ({ ok: false, status: 503 })) as unknown as typeof fetch)
    await expect(callProvider('http://ollama:11434', 'x')).rejects.toThrow(/503/)
  })
})
