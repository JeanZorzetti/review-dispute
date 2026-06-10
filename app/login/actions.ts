'use server'

import { prisma } from '@/src/lib/prisma'
import { createMagicToken } from '@/src/lib/client-tokens'
import { sendEmail } from '@/src/lib/email'
import { magicLinkEmail } from '@/src/lib/email-templates'
import { SITE_URL } from '@/src/lib/site'

// Always returns the same message whether or not the email exists, so the
// form can't be used to enumerate registered clients.
const NEUTRAL_MESSAGE = 'If that email is registered, a sign-in link is on its way. Check your inbox.'

export async function requestMagicLinkAction(_prev: string | undefined, formData: FormData): Promise<string> {
  const email = String(formData.get('email') ?? '').trim().toLowerCase()
  if (!email) return 'Enter your email.'

  const client = await prisma.client.findUnique({ where: { email }, select: { id: true } })
  if (client) {
    const link = `${SITE_URL}/api/auth/magic?token=${encodeURIComponent(createMagicToken(client.id))}`
    await sendEmail(magicLinkEmail(email, link))
  }
  return NEUTRAL_MESSAGE
}
