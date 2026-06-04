import { CONNECT_URL } from '@/src/components/landing/site-config'

export function CTA({ headline = 'Got a fake review killing your jobs?', sub = 'We remove policy-violating Google reviews. You only pay when one comes down.' }: { headline?: string; sub?: string }) {
  return (
    <div className="not-prose my-10 rounded-xl border border-line bg-surface p-6 text-center">
      <p className="text-lg font-black uppercase text-white">{headline}</p>
      <p className="mt-2 text-sm text-muted">{sub}</p>
      <a href={CONNECT_URL} className="mt-4 inline-block rounded-md bg-accent px-6 py-3 text-sm font-extrabold uppercase tracking-wide text-white transition-transform hover:scale-105">Connect Google</a>
    </div>
  )
}
