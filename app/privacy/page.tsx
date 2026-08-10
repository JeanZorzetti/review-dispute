import type { Metadata } from 'next'
import { Header } from '@/src/components/landing/Header'
import { Footer } from '@/src/components/landing/Footer'
import { PRODUCT_NAME } from '@/src/components/landing/site-config'

const LAST_UPDATED = 'August 10, 2026'
const CONTACT_EMAIL = 'flow.controlx@gmail.com'

export const metadata: Metadata = {
  title: `Privacy Policy | ${PRODUCT_NAME}`,
  description: `How ${PRODUCT_NAME} collects, uses, and protects data from your connected Google Business Profile.`,
}

export default function PrivacyPolicy() {
  return (
    <main className="min-h-screen bg-bg text-white">
      <Header />
      <article className="mx-auto max-w-3xl px-5 py-12 md:px-8">
        <header>
          <h1 className="text-3xl font-black leading-tight md:text-4xl">Privacy Policy</h1>
          <p className="mt-3 text-sm text-muted">Last updated: {LAST_UPDATED}</p>
        </header>

        <div className="prose prose-invert mt-8 max-w-none prose-headings:font-extrabold prose-a:text-accent">
          <p>
            {PRODUCT_NAME} is operated by <strong>ROI Labs</strong> (&ldquo;we,&rdquo; &ldquo;us,&rdquo;
            &ldquo;our&rdquo;). This policy explains what data we collect when you connect your Google
            Business Profile to {PRODUCT_NAME}, why we collect it, and what you can do about it. If
            anything here is unclear, email us at{' '}
            <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
          </p>

          <h2>What we access on Google</h2>
          <p>
            When you click &ldquo;Connect Google,&rdquo; you authorize {PRODUCT_NAME} via Google OAuth
            to access your Google Business Profile with the following scopes:
          </p>
          <ul>
            <li>
              <code>business.manage</code> — lets us read reviews on your connected location and file
              removal requests on your behalf. We never post, edit, or reply to reviews as you, and we
              never touch a review that doesn&apos;t violate Google&apos;s content policies.
            </li>
            <li><code>openid</code> and <code>email</code> — identifies your account so we know which profile is yours.</li>
          </ul>
          <p>
            You can revoke this access at any time from{' '}
            <a href="https://myaccount.google.com/permissions" target="_blank" rel="noopener noreferrer">
              myaccount.google.com/permissions
            </a>
            , independent of anything in your {PRODUCT_NAME} account. Revoking access stops all future
            syncing immediately; it doesn&apos;t retroactively withdraw disputes Google is already
            processing.
          </p>

          <h2>What we store</h2>
          <ul>
            <li>Your account email, the connected Business Profile location, and billing method.</li>
            <li>Review text, star rating, and reviewer name for reviews on your connected location — needed to classify and dispute them.</li>
            <li>The status of each dispute (submitted, removed, denied) and the removal outcome, which determines billing.</li>
            <li>
              Your Google OAuth tokens, encrypted at rest with AES-256-GCM. Nobody at ROI Labs can read
              them directly from the database.
            </li>
          </ul>

          <h2>How review text is analyzed</h2>
          <p>
            Reviews are classified by a large language model to check them against Google&apos;s content
            policies (fake engagement, conflict of interest, off-topic, spam, prohibited content). This
            model runs <strong>self-hosted on our own server</strong> — review text is never sent to
            OpenAI, Anthropic, or any third-party AI API. It stays on infrastructure we control.
          </p>

          <h2>Who else sees your data</h2>
          <ul>
            <li><strong>Google</strong> — receives the dispute we file, as part of the normal removal-request process every business has access to.</li>
            <li><strong>Stripe</strong> — processes payment when a review is confirmed removed. We don&apos;t store your card number; Stripe does, under its own privacy policy.</li>
            <li><strong>Resend</strong> — delivers transactional emails (dispute updates, login links, receipts). It doesn&apos;t receive review content.</li>
          </ul>
          <p>We do not sell your data, and we do not use it for advertising or ad targeting.</p>

          <h2>Cookies and sessions</h2>
          <p>
            We set a single signed session cookie to keep you logged in, and a short-lived (15-minute),
            single-purpose token when you request a magic-link login. Neither is used for tracking or
            analytics across other sites.
          </p>

          <h2>How long we keep data</h2>
          <p>
            We keep review and dispute records for as long as your account is active, since removal
            outcomes can take weeks to resolve and billing depends on that history. If you close your
            account, email <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a> and we&apos;ll delete
            your stored data within 30 days, except records we&apos;re required to keep for billing/tax
            purposes.
          </p>

          <h2>Your rights</h2>
          <p>
            You can ask us at any time to see what we have on file, correct it, or delete it, by emailing{' '}
            <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>. If you&apos;re in the EU/UK, this
            covers your GDPR access, rectification, and erasure rights; if you&apos;re a California
            resident, it covers your CCPA rights. We don&apos;t charge for these requests.
          </p>

          <h2>Children</h2>
          <p>{PRODUCT_NAME} is a B2B tool for businesses and isn&apos;t directed at anyone under 16.</p>

          <h2>Changes to this policy</h2>
          <p>
            If we make a material change, we&apos;ll update the date at the top of this page and, for
            significant changes, email the address on your account.
          </p>

          <h2>Contact</h2>
          <p>
            Questions about this policy or your data: <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
          </p>
        </div>
      </article>
      <Footer />
    </main>
  )
}
