import { SITE_URL, SITE_NAME } from './site'
import type { EmailMessage } from './email'

// Client-facing transactional emails. Brand: dark #16181d + orange #ff5b35,
// matching the landing. Inline styles only (email clients ignore <style>).

function layout(title: string, bodyHtml: string): string {
  return `<!doctype html>
<html>
  <body style="margin:0;padding:0;background:#16181d;font-family:Arial,Helvetica,sans-serif;color:#e8e8ea;">
    <div style="max-width:560px;margin:0 auto;padding:32px 24px;">
      <p style="font-size:14px;font-weight:800;letter-spacing:2px;text-transform:uppercase;color:#ff5b35;margin:0 0 24px;">${SITE_NAME}</p>
      <h1 style="font-size:22px;font-weight:800;text-transform:uppercase;color:#ffffff;margin:0 0 16px;">${title}</h1>
      ${bodyHtml}
      <p style="font-size:12px;color:#8b8d93;margin-top:32px;border-top:1px solid #2a2d34;padding-top:16px;">
        ${SITE_NAME} — Remove fake Google reviews. Pay only when they come down.<br/>
        <a href="${SITE_URL}" style="color:#8b8d93;">${SITE_URL.replace('https://', '')}</a>
      </p>
    </div>
  </body>
</html>`
}

function p(text: string): string {
  return `<p style="font-size:15px;line-height:1.6;color:#c9cbd1;margin:0 0 14px;">${text}</p>`
}

function button(href: string, label: string): string {
  return `<p style="margin:24px 0;"><a href="${href}" style="background:#ff5b35;color:#ffffff;font-weight:800;text-transform:uppercase;font-size:14px;letter-spacing:1px;text-decoration:none;padding:14px 28px;border-radius:6px;display:inline-block;">${label}</a></p>`
}

export function welcomeEmail(to: string, businessName: string): EmailMessage {
  return {
    to,
    subject: `Your Google profile is now protected — ${SITE_NAME}`,
    html: layout(
      'You are protected',
      p(`Hi ${businessName},`) +
        p(
          `Your Google Business Profile is now connected. From here on, we monitor every new review, flag the ones that violate Google's policies, and prepare removal disputes for you.`
        ) +
        p(`You only pay when a review actually comes down. No removal, no charge — ever.`) +
        button(`${SITE_URL}/dashboard`, 'View your dashboard')
    ),
  }
}

export function disputeSubmittedEmail(
  to: string,
  businessName: string,
  review: { authorName: string; rating: number },
  violationType: string
): EmailMessage {
  return {
    to,
    subject: `We disputed a policy-violating review on your profile`,
    html: layout(
      'Dispute submitted',
      p(`Hi ${businessName},`) +
        p(
          `We found a review on your profile that violates Google's policies (<strong style="color:#ffffff;">${violationType.replace(/_/g, ' ').toLowerCase()}</strong>) and submitted a formal removal request to Google.`
        ) +
        p(`Review: ${review.rating}&#9733; from "${review.authorName}"`) +
        p(`Google usually responds within a few days to a few weeks. We track it daily and will email you the moment it comes down. If Google denies it, you pay nothing.`) +
        button(`${SITE_URL}/dashboard`, 'Track progress')
    ),
  }
}

export function reviewRemovedEmail(
  to: string,
  businessName: string,
  review: { authorName: string; rating: number },
  amountCents: number,
  billingMethod: string
): EmailMessage {
  const amount = `$${(amountCents / 100).toFixed(0)}`
  const billingLine =
    billingMethod === 'card'
      ? `Per our agreement, your card on file was charged ${amount} for this confirmed removal.`
      : `Per our agreement, an invoice for ${amount} is on its way to this address for this confirmed removal.`
  return {
    to,
    subject: `Removed: the ${review.rating}-star review from "${review.authorName}" is gone`,
    html: layout(
      'Review removed',
      p(`Hi ${businessName},`) +
        p(
          `Good news — Google removed the policy-violating review from "${review.authorName}". It is no longer visible on your profile, and it no longer drags your rating down.`
        ) +
        p(billingLine) +
        button(`${SITE_URL}/dashboard`, 'See your profile health')
    ),
  }
}

export function magicLinkEmail(to: string, link: string): EmailMessage {
  return {
    to,
    subject: `Your ${SITE_NAME} sign-in link`,
    html: layout(
      'Sign in',
      p(`Click below to sign in to your ${SITE_NAME} dashboard. This link expires in 15 minutes and can only be used once per session.`) +
        button(link, 'Sign in to dashboard') +
        p(`If you didn't request this, you can safely ignore this email.`)
    ),
  }
}

export function checkerAssessmentEmail(
  to: string,
  verdict: { violationType: string | null; caseStrength: string; eligible: boolean }
): EmailMessage {
  const verdictLine = verdict.eligible
    ? p(
        `Our analysis found that the review you checked appears to violate Google's review policies (<strong>${verdict.violationType ?? 'policy violation'}</strong>, case strength: ${verdict.caseStrength}). Reviews like this can be disputed and removed.`
      )
    : p(
        `The review you checked didn't show a clear policy violation on its own — but text is only part of the picture. Reviewer history, posting patterns, and conflict-of-interest signals often make the difference, and we check those too.`
      )
  return {
    to,
    subject: verdict.eligible
      ? `Your review check: removable — here's the next step`
      : `Your review check results — and what we'd look at next`,
    html: layout(
      'Your removal assessment',
      verdictLine +
        p(
          `${SITE_NAME} monitors your Google Business Profile, flags every policy-violating review, files the disputes, and follows up with Google until they come down.`
        ) +
        p(`<strong>You only pay when a review is actually removed.</strong> No removal, no charge — ever.`) +
        button(`${SITE_URL}/api/auth/google`, 'Protect my profile')
    ),
  }
}
