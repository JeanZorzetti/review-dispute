'use client'

import { useState } from 'react'
import { CONNECT_URL } from '../landing/site-config'

interface Verdict {
  runId: string
  violationType: string | null
  caseStrength: 'HIGH' | 'MEDIUM' | 'NONE'
  confidence: number
  eligible: boolean
  needsHumanReview: boolean
  policy: { description: string; citation: string } | null
  remaining: number
}

const VIOLATION_LABELS: Record<string, string> = {
  OFF_TOPIC: 'Off-topic content',
  FAKE_NO_EXPERIENCE: 'Fake engagement (no real experience)',
  CONFLICT_OF_INTEREST: 'Conflict of interest',
  SPAM: 'Spam or fake content',
  PROHIBITED_CONTENT: 'Restricted or prohibited content',
}

const STRENGTH_LABELS: Record<Verdict['caseStrength'], string> = {
  HIGH: 'Strong case',
  MEDIUM: 'Moderate case',
  NONE: 'No clear case',
}

export function CheckerForm() {
  const [text, setText] = useState('')
  const [rating, setRating] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [verdict, setVerdict] = useState<Verdict | null>(null)

  const [email, setEmail] = useState('')
  const [leadState, setLeadState] = useState<'idle' | 'sending' | 'done' | 'error'>('idle')

  async function handleCheck(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setVerdict(null)
    setLeadState('idle')
    try {
      const res = await fetch('/api/checker', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ text, rating: rating || undefined }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? 'Something went wrong. Please try again.')
        return
      }
      setVerdict(data as Verdict)
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  async function handleLead(e: React.FormEvent) {
    e.preventDefault()
    if (!verdict) return
    setLeadState('sending')
    try {
      const res = await fetch('/api/checker/lead', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email, runId: verdict.runId }),
      })
      setLeadState(res.ok ? 'done' : 'error')
    } catch {
      setLeadState('error')
    }
  }

  const violated = verdict !== null && verdict.violationType !== null && verdict.caseStrength !== 'NONE'

  return (
    <div className="mx-auto w-full max-w-2xl">
      <form onSubmit={handleCheck} className="rounded-xl border border-line bg-card p-6 md:p-8">
        <label htmlFor="review-text" className="mb-2 block text-xs font-bold uppercase tracking-wide text-muted">
          Paste the Google review
        </label>
        <textarea
          id="review-text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          required
          minLength={30}
          maxLength={3000}
          rows={6}
          placeholder="Paste the full text of the review you want to check…"
          className="w-full resize-y rounded-md border border-line bg-surface p-4 text-sm text-white placeholder:text-muted/60 focus:border-accent focus:outline-none"
        />
        <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <label htmlFor="review-rating" className="mb-2 block text-xs font-bold uppercase tracking-wide text-muted">
              Star rating <span className="normal-case font-normal">(optional)</span>
            </label>
            <select
              id="review-rating"
              value={rating}
              onChange={(e) => setRating(e.target.value)}
              className="rounded-md border border-line bg-surface px-3 py-2.5 text-sm text-white focus:border-accent focus:outline-none"
            >
              <option value="">Not sure</option>
              {[1, 2, 3, 4, 5].map((n) => (
                <option key={n} value={n}>
                  {n} star{n > 1 ? 's' : ''}
                </option>
              ))}
            </select>
          </div>
          <button
            type="submit"
            disabled={loading || text.trim().length < 30}
            className="rounded-md bg-accent px-7 py-3.5 text-sm font-extrabold uppercase tracking-wide text-white transition-transform hover:scale-105 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
          >
            {loading ? 'Analyzing…' : 'Check this review'}
          </button>
        </div>
        {error && <p className="mt-4 text-sm font-semibold text-accent">{error}</p>}
      </form>

      {verdict && (
        <div className="mt-6 rounded-xl border border-line bg-card p-6 md:p-8">
          {violated ? (
            <>
              <p className="text-xs font-bold uppercase tracking-wide text-accent">Policy violation detected</p>
              <h3 className="mt-2 text-2xl font-black uppercase leading-tight">
                {VIOLATION_LABELS[verdict.violationType!] ?? verdict.violationType}
              </h3>
              {verdict.policy && (
                <p className="mt-3 text-sm leading-relaxed text-muted">
                  {verdict.policy.description}{' '}
                  <span className="text-muted/70">({verdict.policy.citation})</span>
                </p>
              )}
              <div className="mt-5 flex flex-wrap items-center gap-3">
                <span className="rounded-md border border-accent/40 bg-accent/10 px-3 py-1.5 text-xs font-extrabold uppercase tracking-wide text-accent">
                  {STRENGTH_LABELS[verdict.caseStrength]}
                </span>
                <span className="rounded-md border border-line bg-surface px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-muted">
                  Confidence {Math.round(verdict.confidence * 100)}%
                </span>
              </div>
              <p className="mt-5 text-sm leading-relaxed text-muted">
                This review can likely be disputed under Google&apos;s review policies. The next step is
                filing a removal dispute with the right policy argument — that&apos;s exactly what we do,
                and <strong className="text-white">you only pay if it actually comes down</strong>.
              </p>
            </>
          ) : (
            <>
              <p className="text-xs font-bold uppercase tracking-wide text-muted">No clear violation in the text</p>
              <h3 className="mt-2 text-2xl font-black uppercase leading-tight">
                This text alone may not be enough
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-muted">
                The wording doesn&apos;t show an obvious policy violation — but text is only part of the
                case. Reviewer history, posting patterns, and conflict-of-interest signals often make
                reviews removable even when the text looks clean. A human assessment can tell.
              </p>
            </>
          )}

          <div className="mt-6 border-t border-line pt-6">
            {leadState === 'done' ? (
              <p className="text-sm font-semibold text-white">
                ✓ Check your inbox — your full assessment is on the way.
              </p>
            ) : (
              <form onSubmit={handleLead} className="flex flex-col gap-3 sm:flex-row">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@yourbusiness.com"
                  aria-label="Email for your full removal assessment"
                  className="flex-1 rounded-md border border-line bg-surface px-4 py-3 text-sm text-white placeholder:text-muted/60 focus:border-accent focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={leadState === 'sending'}
                  className="rounded-md bg-accent px-5 py-3 text-xs font-extrabold uppercase tracking-wide text-white transition-transform hover:scale-105 disabled:opacity-50"
                >
                  {leadState === 'sending' ? 'Sending…' : 'Email me the full assessment'}
                </button>
              </form>
            )}
            {leadState === 'error' && (
              <p className="mt-2 text-sm font-semibold text-accent">Could not save your email — try again.</p>
            )}
            <p className="mt-4 text-sm text-muted">
              Or skip the email and{' '}
              <a href={CONNECT_URL} className="font-bold text-accent underline-offset-2 hover:underline">
                connect your Google profile
              </a>{' '}
              — we monitor every review and dispute the bad ones. Pay only per removal.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
