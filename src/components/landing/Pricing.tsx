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
