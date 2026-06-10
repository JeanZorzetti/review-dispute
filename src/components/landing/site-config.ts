// Single source of truth for landing copy. PRODUCT_NAME is official:
// ReviewShield (decided 2026-06-10). PRICE is set: $499/removal, benchmarked
// (see docs/superpowers/specs/2026-06-03-pricing-decision.md). Change here only.
export const CONNECT_URL = '/api/auth/google'

export const PRODUCT_NAME = 'ReviewShield'

export const PRICE_PER_REMOVAL = '$499'

export const HERO = {
  h1: 'Stop losing jobs to fake reviews',
  sub: 'We remove policy-violating reviews from your Google profile. You only pay when one comes down.',
  cta: 'Connect Google',
}

export const HONEST_PROMISE = {
  title: "We only remove reviews that break Google's rules",
  body: "Fake. Competitor. Extortion. Off-topic. We never touch a real unhappy customer — that's exactly why it works, and why Google approves the removals.",
  tags: ['Fake / no real visit', 'Posted by a competitor', 'Extortion & threats', 'Off-topic / spam'],
}

export const PROBLEM = {
  title: 'One fake review can cost you a job this week',
  body: 'For a roofer, HVAC tech, or plumber, a single contract is worth thousands. Most customers read your reviews before they call — and a fake 1-star from a competitor sends them straight to the next guy.',
  stats: [
    { value: '$10k+', label: 'Value of a single job you could lose' },
    { value: '88%', label: 'of people trust online reviews like a personal recommendation' },
    { value: '1', label: 'fake review is enough to tank your local ranking' },
  ],
}

export const HOW_IT_WORKS = {
  title: 'How it works',
  steps: [
    { n: '1', title: 'Connect your Google profile', body: 'Securely link your Business Profile in a couple of clicks. We read your incoming reviews — we never post as you.' },
    { n: '2', title: 'We flag & dispute the bad ones', body: 'Our system spots reviews that violate Google policy and files the formal removal request, end to end.' },
    { n: '3', title: 'Pay only when removed', body: 'A review comes down, you get charged. It stays up, you owe nothing. Simple.' },
  ],
}

export const PRICING = {
  title: 'Pay only for results',
  body: 'Less than the cost of one lost job. No monthly fee, no retainer — no removal, no charge.',
  highlight: 'per review removed',
}

export const FAQ_TITLE = 'FAQ'

export const FAQ = [
  { q: 'Is this legal?', a: "Completely. We file the same removal requests Google provides to every business — we just do it expertly and only when a review genuinely violates policy." },
  { q: 'Will Google ban my profile?', a: "No. We never abuse the system. We only dispute reviews that break Google's published rules, which is exactly what the dispute process is for. Abusing it is what gets profiles flagged — and that's the opposite of what we do." },
  { q: "What if you can't get it removed?", a: "Then you pay nothing. We only charge when a review is confirmed removed from your profile." },
  { q: 'How long does it take?', a: "It varies by case and by Google's review queue — some come down in days, others take longer. We track each dispute until it resolves." },
]

export const FOOTER = {
  tagline: 'Clean up your Google profile. Win back the jobs you were losing.',
  cta: 'Connect Google',
}
