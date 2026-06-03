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
