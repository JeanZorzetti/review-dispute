# Landing Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the default Next.js placeholder home with a production-grade landing page for the Review Dispute Agent — English, targeting US contractors, ROI hero + honest promise, "Connect Google" CTA, Bold Contractor visual style.

**Architecture:** A single static route (`app/page.tsx`) composed of isolated section components under `src/components/landing/`. All copy/config lives in one `site-config.ts`. Styling via Tailwind; interactive bits (FAQ accordion, scroll animations, CTA hover) via shadcn/ui + Framer Motion in small client components. The page touches no database, so the build stays static (unlike `/dashboard`).

**Tech Stack:** Next.js 16 (App Router) · Tailwind CSS · shadcn/ui (Accordion, Button) · Framer Motion · TypeScript.

**Design source:** `docs/superpowers/specs/2026-06-03-landing-page-design.md`

---

## Note on testing

This is a static marketing page — pure presentation, no business logic. Unit tests add little value here and the project's test runner (Vitest, node env) doesn't render React. **Verification is done by build + manual visual check**, not automated tests. Each task ends with `npm run build` passing and (where relevant) a `npm run dev` visual check. This is a deliberate, honest choice — not a skipped step.

---

## File Structure

```
app/
├── layout.tsx                       # MODIFY: real metadata + dark bg; keep fonts
├── globals.css                      # MODIFY: Tailwind directives + Bold Contractor CSS vars
├── page.tsx                         # REPLACE: compose landing sections
└── page.module.css                  # DELETE (scaffold placeholder)
src/
├── lib/
│   └── utils.ts                     # CREATE: shadcn `cn()` helper
└── components/
    ├── ui/                          # shadcn-generated (button.tsx, accordion.tsx)
    └── landing/
        ├── site-config.ts           # CREATE: PRODUCT_NAME, PRICE_PER_REMOVAL, CONNECT_URL, copy
        ├── Reveal.tsx               # CREATE: client wrapper, Framer whileInView fade/slide-up
        ├── Header.tsx               # CREATE
        ├── Hero.tsx                 # CREATE
        ├── HonestPromise.tsx        # CREATE
        ├── Problem.tsx              # CREATE
        ├── HowItWorks.tsx           # CREATE
        ├── Pricing.tsx              # CREATE
        ├── Faq.tsx                  # CREATE (client — shadcn Accordion)
        └── Footer.tsx               # CREATE
tailwind.config.ts                   # CREATE
postcss.config.mjs                   # CREATE (or MODIFY if scaffold made one)
components.json                      # CREATE (shadcn config)
```

---

## Task 1: Install and configure Tailwind + shadcn/ui + Framer Motion

**Files:**
- Create: `tailwind.config.ts`, `components.json`, `src/lib/utils.ts`
- Modify: `app/globals.css`, `postcss.config.mjs` (if present)

- [ ] **Step 1: Install dependencies**

Run from project root:
```bash
npm i -D tailwindcss@latest postcss autoprefixer
npm i framer-motion class-variance-authority clsx tailwind-merge lucide-react
npm i -D tailwindcss-animate
```

- [ ] **Step 2: Create `tailwind.config.ts` with Bold Contractor tokens**

Create `tailwind.config.ts`:
```typescript
import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: ['./app/**/*.{ts,tsx}', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#16181d',
        surface: '#1c1f26',
        card: '#23262e',
        accent: '#ff5b35',
        muted: '#b8bcc4',
        line: '#2a2e36',
      },
      fontFamily: {
        sans: ['var(--font-geist-sans)', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}
export default config
```

- [ ] **Step 3: Ensure PostCSS config**

Create/overwrite `postcss.config.mjs`:
```javascript
const config = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
export default config
```

- [ ] **Step 4: Add Tailwind directives + CSS vars to `globals.css`**

Replace the entire content of `app/globals.css` with:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --background: #16181d;
  --foreground: #ffffff;
}

body {
  background: var(--background);
  color: var(--foreground);
  font-family: var(--font-geist-sans), system-ui, sans-serif;
}
```

- [ ] **Step 5: Create the `cn()` util**

Create `src/lib/utils.ts`:
```typescript
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

- [ ] **Step 6: Create `components.json` for shadcn**

Create `components.json`:
```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "default",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "config": "tailwind.config.ts",
    "css": "app/globals.css",
    "baseColor": "neutral",
    "cssVariables": true
  },
  "aliases": {
    "components": "@/src/components",
    "utils": "@/src/lib/utils",
    "ui": "@/src/components/ui"
  }
}
```

- [ ] **Step 7: Add shadcn Button and Accordion**

```bash
npx shadcn@latest add button accordion --yes
```
If the CLI prompts or fails on path resolution, manually create `src/components/ui/button.tsx` and `src/components/ui/accordion.tsx` from the shadcn docs (default style), importing `cn` from `@/src/lib/utils`. Verify both files exist under `src/components/ui/`.

- [ ] **Step 8: Verify build**

Run: `npm run build`
Expected: build succeeds; Tailwind compiles. (The page is still the placeholder — that's fine, this task only wires the stack.)

- [ ] **Step 9: Commit**

```bash
git add tailwind.config.ts postcss.config.mjs components.json src/lib/utils.ts src/components/ui app/globals.css package.json package-lock.json
git commit -m "chore: add Tailwind, shadcn/ui (button+accordion), Framer Motion"
```

---

## Task 2: Site config (single source of truth for copy)

**Files:**
- Create: `src/components/landing/site-config.ts`

- [ ] **Step 1: Create `site-config.ts`**

Create `src/components/landing/site-config.ts`:
```typescript
// Single source of truth for landing copy. PRODUCT_NAME and PRICE are placeholders
// until naming/pricing is finalized — change here only.
export const CONNECT_URL = '/api/auth/google'

export const PRODUCT_NAME = 'ReviewShield'

export const PRICE_PER_REMOVAL = '$99'

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
  body: 'No monthly fee. No retainer. No removal, no charge.',
  highlight: 'per review removed',
}

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
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors from this file.

- [ ] **Step 3: Commit**

```bash
git add src/components/landing/site-config.ts
git commit -m "feat: add landing site-config with all copy (placeholders for name/price)"
```

---

## Task 3: Reveal animation wrapper (Framer Motion)

**Files:**
- Create: `src/components/landing/Reveal.tsx`

- [ ] **Step 1: Create the Reveal client component**

Create `src/components/landing/Reveal.tsx`:
```tsx
'use client'

import { motion } from 'framer-motion'
import type { ReactNode } from 'react'

export function Reveal({ children, delay = 0 }: { children: ReactNode; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.5, delay, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  )
}
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/landing/Reveal.tsx
git commit -m "feat: add Reveal scroll-animation wrapper"
```

---

## Task 4: Header + Hero sections

**Files:**
- Create: `src/components/landing/Header.tsx`, `src/components/landing/Hero.tsx`

- [ ] **Step 1: Create `Header.tsx`**

Create `src/components/landing/Header.tsx`:
```tsx
import { PRODUCT_NAME, CONNECT_URL, HERO } from './site-config'

export function Header() {
  return (
    <header className="sticky top-0 z-50 flex items-center justify-between border-b border-line bg-bg/90 px-5 py-4 backdrop-blur md:px-10">
      <span className="text-sm font-extrabold uppercase tracking-wide text-accent">{PRODUCT_NAME}</span>
      <a
        href={CONNECT_URL}
        className="rounded-md bg-accent px-4 py-2 text-xs font-extrabold uppercase tracking-wide text-white transition-transform hover:scale-105"
      >
        {HERO.cta}
      </a>
    </header>
  )
}
```

- [ ] **Step 2: Create `Hero.tsx`**

Create `src/components/landing/Hero.tsx`:
```tsx
'use client'

import { motion } from 'framer-motion'
import { CONNECT_URL, HERO } from './site-config'

export function Hero() {
  return (
    <section className="mx-auto max-w-4xl px-5 py-20 text-center md:py-28">
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="text-4xl font-black uppercase leading-[1.05] tracking-tight md:text-6xl"
      >
        {HERO.h1}
      </motion.h1>
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.15, ease: 'easeOut' }}
        className="mx-auto mt-5 max-w-2xl text-base text-muted md:text-lg"
      >
        {HERO.sub}
      </motion.p>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3, ease: 'easeOut' }}
        className="mt-9"
      >
        <a
          href={CONNECT_URL}
          className="inline-block rounded-md bg-accent px-7 py-3.5 text-sm font-extrabold uppercase tracking-wide text-white transition-transform hover:scale-105"
        >
          {HERO.cta}
        </a>
      </motion.div>
    </section>
  )
}
```

- [ ] **Step 3: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add src/components/landing/Header.tsx src/components/landing/Hero.tsx
git commit -m "feat: add landing header and hero sections"
```

---

## Task 5: HonestPromise + Problem sections

**Files:**
- Create: `src/components/landing/HonestPromise.tsx`, `src/components/landing/Problem.tsx`

- [ ] **Step 1: Create `HonestPromise.tsx`**

Create `src/components/landing/HonestPromise.tsx`:
```tsx
import { Reveal } from './Reveal'
import { HONEST_PROMISE } from './site-config'

export function HonestPromise() {
  return (
    <section className="border-y border-line bg-surface px-5 py-16 md:px-10">
      <Reveal>
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-2xl font-extrabold md:text-3xl">{HONEST_PROMISE.title}</h2>
          <p className="mx-auto mt-4 max-w-2xl text-muted">{HONEST_PROMISE.body}</p>
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            {HONEST_PROMISE.tags.map((t) => (
              <span key={t} className="rounded-full border border-line bg-card px-3 py-1.5 text-xs font-semibold text-muted">
                {t}
              </span>
            ))}
          </div>
        </div>
      </Reveal>
    </section>
  )
}
```

- [ ] **Step 2: Create `Problem.tsx`**

Create `src/components/landing/Problem.tsx`:
```tsx
import { Reveal } from './Reveal'
import { PROBLEM } from './site-config'

export function Problem() {
  return (
    <section className="px-5 py-16 md:px-10">
      <Reveal>
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-2xl font-extrabold uppercase md:text-3xl">{PROBLEM.title}</h2>
          <p className="mx-auto mt-4 max-w-2xl text-muted">{PROBLEM.body}</p>
          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            {PROBLEM.stats.map((s) => (
              <div key={s.label} className="rounded-lg border border-line bg-surface p-6">
                <div className="text-3xl font-black text-accent">{s.value}</div>
                <div className="mt-2 text-sm text-muted">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </Reveal>
    </section>
  )
}
```

- [ ] **Step 3: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add src/components/landing/HonestPromise.tsx src/components/landing/Problem.tsx
git commit -m "feat: add honest-promise and problem sections"
```

---

## Task 6: HowItWorks + Pricing sections

**Files:**
- Create: `src/components/landing/HowItWorks.tsx`, `src/components/landing/Pricing.tsx`

- [ ] **Step 1: Create `HowItWorks.tsx`**

Create `src/components/landing/HowItWorks.tsx`:
```tsx
import { Reveal } from './Reveal'
import { HOW_IT_WORKS } from './site-config'

export function HowItWorks() {
  return (
    <section className="border-y border-line bg-surface px-5 py-16 md:px-10">
      <Reveal>
        <div className="mx-auto max-w-5xl">
          <h2 className="text-center text-2xl font-extrabold uppercase md:text-3xl">{HOW_IT_WORKS.title}</h2>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {HOW_IT_WORKS.steps.map((s) => (
              <div key={s.n} className="rounded-lg border border-line bg-card p-6">
                <div className="text-2xl font-black text-accent">{s.n}</div>
                <h3 className="mt-3 text-lg font-bold">{s.title}</h3>
                <p className="mt-2 text-sm text-muted">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </Reveal>
    </section>
  )
}
```

- [ ] **Step 2: Create `Pricing.tsx`**

Create `src/components/landing/Pricing.tsx`:
```tsx
import { Reveal } from './Reveal'
import { PRICING, PRICE_PER_REMOVAL } from './site-config'

export function Pricing() {
  return (
    <section className="px-5 py-16 md:px-10">
      <Reveal>
        <div className="mx-auto max-w-2xl rounded-2xl border border-line bg-surface p-10 text-center">
          <h2 className="text-2xl font-extrabold uppercase md:text-3xl">{PRICING.title}</h2>
          <div className="mt-6 flex items-baseline justify-center gap-2">
            <span className="text-5xl font-black text-accent md:text-6xl">{PRICE_PER_REMOVAL}</span>
            <span className="text-sm text-muted">{PRICING.highlight}</span>
          </div>
          <p className="mt-4 text-muted">{PRICING.body}</p>
        </div>
      </Reveal>
    </section>
  )
}
```

- [ ] **Step 3: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add src/components/landing/HowItWorks.tsx src/components/landing/Pricing.tsx
git commit -m "feat: add how-it-works and pricing sections"
```

---

## Task 7: FAQ (shadcn Accordion) + Footer

**Files:**
- Create: `src/components/landing/Faq.tsx`, `src/components/landing/Footer.tsx`

- [ ] **Step 1: Create `Faq.tsx`**

Create `src/components/landing/Faq.tsx`:
```tsx
'use client'

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/src/components/ui/accordion'
import { FAQ } from './site-config'

export function Faq() {
  return (
    <section className="border-y border-line bg-surface px-5 py-16 md:px-10">
      <div className="mx-auto max-w-2xl">
        <h2 className="text-center text-2xl font-extrabold uppercase md:text-3xl">FAQ</h2>
        <Accordion type="single" collapsible className="mt-8">
          {FAQ.map((item, i) => (
            <AccordionItem key={i} value={`item-${i}`} className="border-line">
              <AccordionTrigger className="text-left text-base font-semibold hover:text-accent">
                {item.q}
              </AccordionTrigger>
              <AccordionContent className="text-muted">{item.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Create `Footer.tsx`**

Create `src/components/landing/Footer.tsx`:
```tsx
import { CONNECT_URL, FOOTER, PRODUCT_NAME } from './site-config'

export function Footer() {
  return (
    <footer className="px-5 py-20 text-center md:px-10">
      <h2 className="mx-auto max-w-2xl text-2xl font-black uppercase md:text-3xl">{FOOTER.tagline}</h2>
      <div className="mt-8">
        <a
          href={CONNECT_URL}
          className="inline-block rounded-md bg-accent px-7 py-3.5 text-sm font-extrabold uppercase tracking-wide text-white transition-transform hover:scale-105"
        >
          {FOOTER.cta}
        </a>
      </div>
      <div className="mt-16 border-t border-line pt-8 text-xs text-muted">
        © {new Date().getFullYear()} {PRODUCT_NAME}. All rights reserved.
      </div>
    </footer>
  )
}
```

- [ ] **Step 3: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors. If the accordion import path errors, confirm shadcn generated `src/components/ui/accordion.tsx` and the `@/src/components/ui/accordion` alias resolves (tsconfig `@/*` → `./*`).

- [ ] **Step 4: Commit**

```bash
git add src/components/landing/Faq.tsx src/components/landing/Footer.tsx
git commit -m "feat: add faq accordion and footer sections"
```

---

## Task 8: Compose the page + metadata + delete placeholder

**Files:**
- Replace: `app/page.tsx`
- Modify: `app/layout.tsx`
- Delete: `app/page.module.css`

- [ ] **Step 1: Replace `app/page.tsx`**

Overwrite `app/page.tsx` with:
```tsx
import { Header } from '@/src/components/landing/Header'
import { Hero } from '@/src/components/landing/Hero'
import { HonestPromise } from '@/src/components/landing/HonestPromise'
import { Problem } from '@/src/components/landing/Problem'
import { HowItWorks } from '@/src/components/landing/HowItWorks'
import { Pricing } from '@/src/components/landing/Pricing'
import { Faq } from '@/src/components/landing/Faq'
import { Footer } from '@/src/components/landing/Footer'

export default function Home() {
  return (
    <main className="min-h-screen bg-bg text-white">
      <Header />
      <Hero />
      <HonestPromise />
      <Problem />
      <HowItWorks />
      <Pricing />
      <Faq />
      <Footer />
    </main>
  )
}
```

- [ ] **Step 2: Update metadata in `app/layout.tsx`**

In `app/layout.tsx`, replace the `metadata` export with:
```tsx
export const metadata: Metadata = {
  title: 'ReviewShield — Remove fake Google reviews, pay only when they come down',
  description:
    'We remove policy-violating Google reviews for contractors. Fake, competitor, and off-topic reviews disputed and removed. You only pay when one comes down.',
  openGraph: {
    title: 'ReviewShield — Stop losing jobs to fake reviews',
    description: 'Policy-violating Google reviews removed. Pay only on removal.',
    type: 'website',
  },
}
```
Also ensure the `<body>` keeps the existing font variables; no other layout change needed.

- [ ] **Step 3: Delete the placeholder CSS module**

```bash
rm app/page.module.css
```
Confirm nothing else imports it: `grep -r "page.module" app src` returns nothing.

- [ ] **Step 4: Build**

Run: `npm run build`
Expected: build succeeds; `/` is static (`○`), no DB error.

- [ ] **Step 5: Visual check**

Run: `npm run dev` (use `next dev --webpack` if Turbopack misbehaves on Windows+OneDrive, per project history).
Open `http://localhost:3000`:
- All 7 sections render top-to-bottom in Bold Contractor style (dark bg, orange accents, uppercase headings).
- Sections fade/slide up on scroll (Framer `whileInView`).
- FAQ accordion opens/closes.
- Every "Connect Google" button links to `/api/auth/google`.
- Resize to mobile width (DevTools) — hero and 3-column grids stack to single column.

- [ ] **Step 6: Commit**

```bash
git add app/page.tsx app/layout.tsx
git rm app/page.module.css
git commit -m "feat: compose landing page, add metadata, remove scaffold placeholder"
```

---

## Task 9: Deploy verification

**Files:** none (deploy + smoke check)

- [ ] **Step 1: Push**

```bash
git push
```

- [ ] **Step 2: Redeploy on EasyPanel** (user action)

Trigger a redeploy of the `review-dispute` service so it picks up the new commit.

- [ ] **Step 3: Smoke-check production**

```bash
curl -s -o /dev/null -w "HTTP %{http_code}\n" https://sofia-review-dispute.7c17iw.easypanel.host/
```
Expected: HTTP 200, and visiting in a browser shows the landing (not the Next placeholder). Confirm a "Connect Google" button redirects to Google OAuth.

---

## Self-Review (against spec)

**Spec coverage:**
- Bold Contractor style (dark + orange + uppercase) → Task 1 tokens + every section ✅
- Public = contractor, English copy → site-config (Task 2) ✅
- CTA "Connect Google" → `/api/auth/google` in Header/Hero/Footer ✅
- ROI hero + honest promise right after → Hero (Task 4) + HonestPromise (Task 5) ✅
- 7 sections in order → composed in Task 8 ✅
- Tailwind + Framer Motion + shadcn (Accordion+Button) → Task 1 + Reveal (Task 3) + Faq (Task 7) ✅
- Single source of truth (PRODUCT_NAME/PRICE/CONNECT_URL) → site-config (Task 2) ✅
- No social proof, no waitlist → omitted (honored) ✅
- Static build, no DB → page composes static components only; verified Task 8 ✅
- SEO metadata → Task 8 ✅
- Delete page.module.css placeholder → Task 8 ✅

**Placeholder scan:** PRODUCT_NAME ('ReviewShield') and PRICE_PER_REMOVAL ('$99') are intentional, isolated in site-config, flagged as placeholders. No "TBD"/"implement later" in steps; all code shown in full.

**Type consistency:** `CONNECT_URL`, `PRODUCT_NAME`, `HERO`, `HONEST_PROMISE`, `PROBLEM`, `HOW_IT_WORKS`, `PRICING`, `FAQ`, `FOOTER`, `Reveal`, and section component names are defined once (Tasks 2-7) and imported consistently in Task 8. shadcn UI imported from `@/src/components/ui/*`. ✅

**Testing note:** No automated tests — deliberate, justified above (static presentation page). Verification is build + visual + deploy smoke check.
