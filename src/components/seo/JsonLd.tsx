export function JsonLd({ data }: { data: Record<string, unknown> | Record<string, unknown>[] }) {
  // Escape `</script>` so author-controlled MDX content (e.g. FAQ answers) can't
  // close the inline script tag early — the standard JSON-LD injection guard.
  const json = JSON.stringify(data).replace(/<\/script>/gi, '<\\/script>')
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: json }}
    />
  )
}
