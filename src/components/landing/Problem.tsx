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
