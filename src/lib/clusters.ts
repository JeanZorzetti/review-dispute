export const CLUSTER_LABELS: Record<string, string> = {
  'review-removal': 'Review Removal',
  'review-policy': 'Google Review Policy',
  'local-reputation': 'Local Reputation',
  'responding-reviews': 'Responding to Reviews',
  'by-vertical': 'By Trade',
  'getting-reviews': 'Getting More Reviews',
}

export function clusterLabel(slug: string): string {
  return CLUSTER_LABELS[slug] ?? slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}
