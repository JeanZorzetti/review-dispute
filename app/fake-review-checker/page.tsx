import type { Metadata } from 'next'
import { Header } from '@/src/components/landing/Header'
import { Footer } from '@/src/components/landing/Footer'
import { CheckerForm } from '@/src/components/checker/CheckerForm'
import { VIOLATION_TYPES, getPolicy } from '@/src/domain/policies'
import { VIOLATION_LABELS } from '@/src/lib/checker'
import { SITE_URL, SITE_NAME } from '@/src/lib/site'
import { CONNECT_URL } from '@/src/components/landing/site-config'

const PAGE_URL = `${SITE_URL}/fake-review-checker`

export const metadata: Metadata = {
  title: 'Free Fake Google Review Checker — Is This Review Removable?',
  description:
    'Paste any Google review and find out in seconds if it violates Google’s review policies and can be removed. Free AI-powered checker for business owners.',
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: 'Free Fake Google Review Checker — Is This Review Removable?',
    description:
      'Paste any Google review and find out in seconds if it violates Google’s review policies and can be removed.',
    url: PAGE_URL,
    siteName: SITE_NAME,
    type: 'website',
  },
}

const FAQ = [
  {
    q: 'How do I know if a Google review is fake?',
    a: 'Common signs: the reviewer never appears in your customer records, the account has reviewed many businesses across distant locations, the text is generic or off-topic, or it was posted right after a dispute with an ex-employee or competitor. Our checker analyzes the review text against Google’s published policies to flag likely violations.',
  },
  {
    q: 'Can fake Google reviews be removed?',
    a: 'Yes — Google removes reviews that violate its review policies, including fake engagement, conflicts of interest, spam, off-topic content, and restricted content. The catch: you must report them with the right policy argument, and follow up. Google does not remove reviews just because they are negative.',
  },
  {
    q: 'How long does Google take to remove a reported review?',
    a: 'Typically anywhere from a few days to several weeks. Initial automated decisions can come within 3 business days; escalations and re-evaluations take longer. Persistence with a correct policy citation significantly improves removal odds.',
  },
  {
    q: 'Is this checker really free?',
    a: 'Yes — you can check up to 5 reviews per day at no cost, no account needed. If a review looks removable, we offer a done-for-you dispute service where you only pay when the review is actually removed.',
  },
  {
    q: 'What if the review doesn’t violate any policy?',
    a: 'If a genuine customer left honest negative feedback, Google will not remove it — and no service can. In that case the right move is a professional public reply and collecting fresh positive reviews. Our checker is honest about this instead of selling you a dispute that will fail.',
  },
]

const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: FAQ.map((f) => ({
    '@type': 'Question',
    name: f.q,
    acceptedAnswer: { '@type': 'Answer', text: f.a },
  })),
}

const appJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'Fake Google Review Checker',
  url: PAGE_URL,
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Web',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  publisher: { '@type': 'Organization', name: SITE_NAME, url: SITE_URL },
}

export default function FakeReviewCheckerPage() {
  return (
    <main className="min-h-screen bg-bg text-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(appJsonLd) }}
      />
      <Header />

      {/* Hero + tool */}
      <section className="mx-auto max-w-4xl px-5 pb-16 pt-16 text-center md:pt-24">
        <h1 className="text-3xl font-black uppercase leading-[1.05] tracking-tight md:text-5xl">
          Fake Google Review Checker
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-base text-muted md:text-lg">
          Paste a review and find out in seconds if it violates Google&apos;s review policies —
          and whether it can be removed. Free, no account needed.
        </p>
        <div className="mt-10 text-left">
          <CheckerForm />
        </div>
        <p className="mt-4 text-xs text-muted/70">
          5 free checks per day. AI analysis based on Google&apos;s published review policies — not
          legal advice.
        </p>
      </section>

      {/* What Google prohibits */}
      <section className="border-t border-line bg-surface/40 py-16">
        <div className="mx-auto max-w-4xl px-5">
          <h2 className="text-center text-2xl font-black uppercase tracking-tight md:text-3xl">
            What Google actually removes
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-center text-sm text-muted md:text-base">
            Google won&apos;t take a review down for being negative — only for violating policy.
            These are the five violations that get reviews removed:
          </p>
          <div className="mt-10 grid gap-4 md:grid-cols-2">
            {VIOLATION_TYPES.map((type) => {
              const policy = getPolicy(type)
              return (
                <div key={type} className="rounded-xl border border-line bg-card p-6">
                  <h3 className="text-sm font-extrabold uppercase tracking-wide text-accent">
                    {VIOLATION_LABELS[type]}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted">{policy.description}</p>
                  <p className="mt-3 text-xs text-muted/60">{policy.citation}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16">
        <div className="mx-auto max-w-4xl px-5">
          <h2 className="text-center text-2xl font-black uppercase tracking-tight md:text-3xl">
            How the checker works
          </h2>
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {[
              {
                n: '1',
                t: 'Paste the review',
                d: 'Copy the full review text from your Google Business Profile and paste it above.',
              },
              {
                n: '2',
                t: 'AI checks the policies',
                d: 'The same classifier our dispute pipeline uses scores the text against all five removable violation types.',
              },
              {
                n: '3',
                t: 'Get your verdict',
                d: 'See which policy it violates, how strong the case is — and what to do next to get it removed.',
              },
            ].map((s) => (
              <div key={s.n} className="rounded-xl border border-line bg-card p-6 text-center">
                <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full border border-line bg-surface text-sm font-extrabold text-accent">
                  {s.n}
                </div>
                <h3 className="mt-4 text-base font-extrabold uppercase tracking-wide">{s.t}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="border-t border-line bg-surface/40 py-16">
        <div className="mx-auto max-w-3xl px-5">
          <h2 className="text-center text-2xl font-black uppercase tracking-tight md:text-3xl">
            Frequently asked questions
          </h2>
          <div className="mt-10 space-y-4">
            {FAQ.map((f) => (
              <details key={f.q} className="group rounded-xl border border-line bg-card p-6">
                <summary className="cursor-pointer list-none text-sm font-extrabold uppercase tracking-wide marker:hidden">
                  {f.q}
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-muted">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 text-center">
        <div className="mx-auto max-w-3xl px-5">
          <h2 className="text-2xl font-black uppercase tracking-tight md:text-4xl">
            Stop checking reviews one by one
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-sm text-muted md:text-base">
            Connect your Google Business Profile and {SITE_NAME} monitors every review, flags
            violations, and files the disputes for you. You only pay when a review comes down.
          </p>
          <a
            href={CONNECT_URL}
            className="mt-8 inline-block rounded-md bg-accent px-7 py-3.5 text-sm font-extrabold uppercase tracking-wide text-white transition-transform hover:scale-105"
          >
            Protect my profile
          </a>
        </div>
      </section>

      <Footer />
    </main>
  )
}
