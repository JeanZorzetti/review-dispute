export function KeyTakeaways({ children }: { children: React.ReactNode }) {
  return (
    <div className="not-prose my-8 rounded-lg border border-line bg-surface p-5">
      <p className="text-sm font-bold uppercase tracking-wide text-accent">Key Takeaways</p>
      <div className="mt-3 text-sm text-muted [&_ul]:list-disc [&_ul]:space-y-1 [&_ul]:pl-5">{children}</div>
    </div>
  )
}
