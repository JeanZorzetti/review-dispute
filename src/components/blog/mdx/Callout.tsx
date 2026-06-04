export function Callout({ type = 'tip', children }: { type?: 'tip' | 'warning'; children: React.ReactNode }) {
  const color = type === 'warning' ? 'border-accent' : 'border-line'
  return <div className={`not-prose my-6 rounded-lg border-l-4 ${color} bg-surface p-4 text-sm text-muted`}>{children}</div>
}
