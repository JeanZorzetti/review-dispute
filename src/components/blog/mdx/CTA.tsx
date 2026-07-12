import Link from 'next/link'

// ponytail: every post links to the free checker, not the OAuth connect — tool-led funnel (killgate 2026-07-11).
export function CTA({ headline = 'Got a fake review killing your jobs?', sub = 'Paste it into our free checker: find out in seconds if it violates Google policy and can be removed. No account needed.' }: { headline?: string; sub?: string }) {
  return (
    <div className="not-prose my-10 rounded-xl border border-line bg-surface p-6 text-center">
      <p className="text-lg font-black uppercase text-white">{headline}</p>
      <p className="mt-2 text-sm text-muted">{sub}</p>
      <Link href="/fake-review-checker" className="mt-4 inline-block rounded-md bg-accent px-6 py-3 text-sm font-extrabold uppercase tracking-wide text-white transition-transform hover:scale-105">Check a review free</Link>
    </div>
  )
}
