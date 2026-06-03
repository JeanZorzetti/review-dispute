const DEFAULT_MODEL = 'qwen2.5:7b-instruct'

// Calls a self-hosted Ollama instance. `format: 'json'` forces the model to
// emit a syntactically valid JSON object, which the triage classifier parses.
export async function callProvider(baseUrl: string, prompt: string): Promise<string> {
  if (!baseUrl) throw new Error('Ollama base url missing')
  const model = process.env.OLLAMA_MODEL ?? DEFAULT_MODEL
  const res = await fetch(`${baseUrl.replace(/\/$/, '')}/api/generate`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      model,
      prompt,
      stream: false,
      format: 'json',
      options: { temperature: 0 },
    }),
  })
  if (!res.ok) throw new Error(`LLM provider error ${res.status}`)
  const data = (await res.json()) as { response?: string }
  return data.response ?? ''
}
