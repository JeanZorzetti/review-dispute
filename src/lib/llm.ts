export type LlmComplete = (prompt: string) => Promise<string> | string

let _real: LlmComplete | null = null
export function llm(): LlmComplete {
  if (!_real) {
    _real = async (prompt: string) => {
      const baseUrl = process.env.OLLAMA_BASE_URL
      if (!baseUrl) throw new Error('OLLAMA_BASE_URL not set')
      const { callProvider } = await import('./llm.provider')
      return callProvider(baseUrl, prompt)
    }
  }
  return _real
}

export function mockLlm(fn: (prompt: string) => string): LlmComplete {
  return (prompt: string) => fn(prompt)
}
