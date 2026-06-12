import { PRODUCT_NAME, CONNECT_URL, HERO } from './site-config'

export function Header() {
  return (
    <header className="sticky top-0 z-50 flex items-center justify-between border-b border-line bg-bg/90 px-5 py-4 backdrop-blur md:px-10">
      <span className="text-sm font-extrabold uppercase tracking-wide text-accent">{PRODUCT_NAME}</span>
      <nav className="flex items-center gap-6">
        <a href="/fake-review-checker" className="text-xs font-bold uppercase tracking-wide text-muted hover:text-white transition-colors">
          Free Checker
        </a>
        <a href="/blog" className="text-xs font-bold uppercase tracking-wide text-muted hover:text-white transition-colors">
          Blog
        </a>
        <a
          href={CONNECT_URL}
          className="rounded-md bg-accent px-4 py-2 text-xs font-extrabold uppercase tracking-wide text-white transition-transform hover:scale-105"
        >
          {HERO.cta}
        </a>
      </nav>
    </header>
  )
}
