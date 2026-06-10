// Outbound email via Resend's HTTP API (no SDK dependency). Fails soft by
// design: a missing key or a Resend outage must never break the state machine
// or billing — callers fire-and-forget and the result records what happened.

export type EmailMessage = { to: string; subject: string; html: string }
export type EmailResult = { sent: boolean; skipped?: string; error?: string }

const RESEND_URL = 'https://api.resend.com/emails'

export async function sendEmail(msg: EmailMessage, fetchImpl: typeof fetch = fetch): Promise<EmailResult> {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) return { sent: false, skipped: 'RESEND_API_KEY not set' }
  const from = process.env.EMAIL_FROM ?? 'ReviewShield <onboarding@resend.dev>'
  try {
    const res = await fetchImpl(RESEND_URL, {
      method: 'POST',
      headers: { authorization: `Bearer ${apiKey}`, 'content-type': 'application/json' },
      body: JSON.stringify({ from, to: msg.to, subject: msg.subject, html: msg.html }),
    })
    if (!res.ok) {
      const body = await res.text()
      console.error(`[email] Resend ${res.status} sending "${msg.subject}" to ${msg.to}: ${body}`)
      return { sent: false, error: `Resend ${res.status}` }
    }
    return { sent: true }
  } catch (e) {
    console.error(`[email] failed sending "${msg.subject}" to ${msg.to}:`, e)
    return { sent: false, error: e instanceof Error ? e.message : String(e) }
  }
}
