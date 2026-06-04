import type { Author } from '@/content/authors'

export function AuthorCard({ author }: { author: Author }) {
  return (
    <div className="not-prose mt-12 rounded-xl border border-line bg-surface p-6">
      <p className="text-sm font-bold uppercase tracking-wide text-accent">{author.role}</p>
      <p className="mt-1 text-lg font-bold text-white">{author.name}</p>
      <p className="mt-2 text-sm text-muted">{author.bio}</p>
      {author.credentials && author.credentials.length > 0 && (
        <ul className="mt-3 flex flex-wrap gap-2">
          {author.credentials.map((c) => (
            <li key={c} className="rounded-full border border-line bg-card px-3 py-1 text-xs text-muted">{c}</li>
          ))}
        </ul>
      )}
    </div>
  )
}
