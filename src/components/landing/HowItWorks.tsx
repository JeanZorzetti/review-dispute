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
