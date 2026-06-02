export async function callProvider(apiKey: string, prompt: string): Promise<string> {
  if (!apiKey) throw new Error('LLM api key missing')
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 300,
      messages: [{ role: 'user', content: prompt }],
    }),
  })
  if (!res.ok) throw new Error(`LLM provider error ${res.status}`)
  const data = (await res.json()) as { content: { text: string }[] }
  return data.content?.[0]?.text ?? ''
}
