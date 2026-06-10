import { sendEmail } from './email'
import { SITE_NAME } from './site'

// Operator alerting for background jobs. Logs always; emails the operator
// when ADMIN_ALERT_EMAIL is set. Must never throw — an alerting failure on
// top of a cron failure would mask the original error.

export async function alertAdmin(subject: string, detail: string): Promise<void> {
  console.error(`[alert] ${subject}\n${detail}`)
  const to = process.env.ADMIN_ALERT_EMAIL
  if (!to) return
  try {
    await sendEmail({
      to,
      subject: `[${SITE_NAME}] ${subject}`,
      html: `<pre style="font-family:monospace;white-space:pre-wrap;">${detail
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')}</pre>`,
    })
  } catch (e) {
    console.error('[alert] failed to send alert email:', e)
  }
}
