export function Definition({ term, children }: { term: string; children: React.ReactNode }) {
  return (
    <div className="not-prose my-6 rounded-lg border border-line bg-surface p-4">
      <p className="font-bold text-white">{term}</p>
      <p className="mt-1 text-sm text-muted">{children}</p>
    </div>
  )
}
