import type { Metadata } from 'next'
import { Header } from '@/src/components/landing/Header'
import { Footer } from '@/src/components/landing/Footer'
import { PRODUCT_NAME, PRICE_PER_REMOVAL } from '@/src/components/landing/site-config'

const LAST_UPDATED = 'August 10, 2026'
const CONTACT_EMAIL = 'flow.controlx@gmail.com'

export const metadata: Metadata = {
  title: `Terms of Service | ${PRODUCT_NAME}`,
  description: `The terms that govern your use of ${PRODUCT_NAME}.`,
}

export default function TermsOfService() {
  return (
    <main className="min-h-screen bg-bg text-white">
      <Header />
      <article className="mx-auto max-w-3xl px-5 py-12 md:px-8">
        <header>
          <h1 className="text-3xl font-black leading-tight md:text-4xl">Terms of Service</h1>
          <p className="mt-3 text-sm text-muted">Last updated: {LAST_UPDATED}</p>
        </header>

        <div className="prose prose-invert mt-8 max-w-none prose-headings:font-extrabold prose-a:text-accent">
          <p>
            These terms govern your use of {PRODUCT_NAME}, operated by <strong>ROI Labs</strong>
            (&ldquo;we,&rdquo; &ldquo;us&rdquo;). By connecting your Google Business Profile or otherwise
            using the service, you agree to them. If you don&apos;t agree, don&apos;t use the service.
          </p>

          <h2>1. What the service does</h2>
          <p>
            {PRODUCT_NAME} monitors reviews on your connected Google Business Profile, identifies reviews
            that appear to violate Google&apos;s content policies (fake engagement, conflict of interest,
            off-topic content, spam, or prohibited content), and prepares and files formal removal
            requests through Google&apos;s own dispute process. A human reviews and submits each request
            before it goes to Google — we don&apos;t act fully autonomously on your profile.
          </p>
          <p>
            We only dispute reviews that appear to break Google&apos;s published rules. We do not file
            requests against reviews just because they are negative, and we do not ask or pay anyone to
            flag content on your behalf outside Google&apos;s normal process.
          </p>

          <h2>2. Eligibility</h2>
          <p>
            You must be an owner, manager, or otherwise authorized representative of the Google Business
            Profile you connect. Connecting a profile you don&apos;t have the authority to manage is a
            violation of these terms and of Google&apos;s own terms of service.
          </p>

          <h2>3. Fees and billing</h2>
          <p>
            {PRODUCT_NAME} is pay-per-outcome: <strong>{PRICE_PER_REMOVAL} per review confirmed removed</strong>{' '}
            from your profile. There is no monthly fee, setup fee, or retainer. If a dispute is denied or
            a review stays up, you owe nothing for it.
          </p>
          <p>
            Depending on the billing method you choose at onboarding, we either charge your saved card
            automatically when a removal is confirmed, or issue an invoice payable by the terms stated on
            it. Charges are processed by Stripe; by using the service you also agree to Stripe&apos;s
            terms for the payment method you provide.
          </p>

          <h2>4. No guaranteed outcome</h2>
          <p>
            Whether a review comes down is Google&apos;s decision alone, made under its own policies and
            on its own timeline. We do not control Google&apos;s review queue and cannot guarantee any
            specific review will be removed, or removed by any particular date. Our only commitment on
            outcome is the billing rule above: no removal, no charge.
          </p>

          <h2>5. Your account and responsibilities</h2>
          <p>
            You&apos;re responsible for keeping your login credentials and connected Google account
            secure, for the accuracy of the billing information you provide, and for promptly telling us
            if you no longer have authority to manage a connected profile. You agree not to use the
            service to harass reviewers, submit disputes you know to be false, or otherwise abuse
            Google&apos;s review or dispute systems.
          </p>

          <h2>6. Intellectual property</h2>
          <p>
            The {PRODUCT_NAME} software, classification system, and site content are owned by ROI Labs.
            These terms don&apos;t grant you any rights to them beyond using the service as intended. You
            retain ownership of your business information; you grant us a limited license to use it to
            operate the service (sync reviews, classify them, file disputes, bill you).
          </p>

          <h2>7. Third-party services</h2>
          <p>
            The service depends on Google&apos;s Business Profile APIs and dispute process, and on
            Stripe for payments. We aren&apos;t responsible for outages, policy changes, or account
            actions on Google&apos;s or Stripe&apos;s side that are outside our control.
          </p>

          <h2>8. Disclaimer of warranties</h2>
          <p>
            The service is provided &ldquo;as is.&rdquo; We don&apos;t warrant that it will be
            uninterrupted, error-free, or that any given review will be removed. To the extent permitted
            by law, we disclaim all other warranties, express or implied.
          </p>

          <h2>9. Limitation of liability</h2>
          <p>
            To the extent permitted by law, ROI Labs&apos; total liability arising out of or related to
            the service is limited to the fees you paid us in the 12 months before the claim, and we are
            not liable for indirect, incidental, or consequential damages (including lost profits or lost
            business).
          </p>

          <h2>10. Termination</h2>
          <p>
            You can stop using the service and disconnect your Google account at any time. We may
            suspend or terminate access if you violate these terms, misuse the dispute process, or if
            your account is delinquent on billing. On termination, outstanding fees for already-confirmed
            removals remain owed.
          </p>

          <h2>11. Changes to these terms</h2>
          <p>
            We may update these terms as the service changes. Material changes will be reflected by the
            date at the top of this page, and for significant changes we&apos;ll email the address on
            your account. Continued use after a change means you accept the update.
          </p>

          <h2>12. Governing law</h2>
          <p>
            These terms are governed by the laws of the State of Delaware, USA, without regard to its
            conflict-of-laws principles.
          </p>

          <h2>13. Contact</h2>
          <p>
            Questions about these terms: <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
          </p>
        </div>
      </article>
      <Footer />
    </main>
  )
}
