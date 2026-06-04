export function AnswerBox({ children }: { children: React.ReactNode }) {
  return (
    <div className="not-prose my-6 rounded-lg border-l-4 border-accent bg-surface p-4 text-base text-white">
      {children}
    </div>
  )
}
