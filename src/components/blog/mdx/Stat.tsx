export function Stat({ value, label, source }: { value: string; label: string; source?: string }) {
  return (
    <div className="not-prose rounded-lg border border-line bg-card p-5">
      <div className="text-3xl font-black text-accent">{value}</div>
      <div className="mt-1 text-sm text-muted">{label}</div>
      {source && <div className="mt-2 text-xs text-muted/70">Source: {source}</div>}
    </div>
  )
}

export function StatGrid({ children }: { children: React.ReactNode }) {
  return <div className="not-prose my-8 grid gap-4 sm:grid-cols-3">{children}</div>
}
