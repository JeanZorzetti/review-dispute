export type LlmComplete = (prompt: string) => Promise<string> | string

let _real: LlmComplete | null = null
export function llm(): LlmComplete {
  if (!_real) {
    _real = async (prompt: string) => {
      const apiKey = process.env.LLM_API_KEY
      if (!apiKey) throw new Error('LLM_API_KEY not set')
      const { callProvider } = await import('./llm.provider')
      return callProvider(apiKey, prompt)
    }
  }
  return _real
}

export function mockLlm(fn: (prompt: string) => string): LlmComplete {
  return (prompt: string) => fn(prompt)
}
