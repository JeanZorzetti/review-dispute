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
