import type { MetadataRoute } from 'next'
import { SITE_URL } from '@/src/lib/site'
import { getAllPosts, getAllClusters, getCluster } from '@/src/lib/blog'

export default function sitemap(): MetadataRoute.Sitemap {
  const posts = getAllPosts()
  const articleEntries: MetadataRoute.Sitemap = posts.map((p) => ({
    url: `${SITE_URL}/blog/${p.slug}`,
    lastModified: new Date(p.dateModified ?? p.datePublished),
    changeFrequency: 'monthly',
    priority: p.pillar ? 0.8 : 0.6,
  }))
  const clusterEntries: MetadataRoute.Sitemap = getAllClusters().map((c) => {
    const { pillar, members } = getCluster(c)
    const clusterPosts = [pillar, ...members].filter((p): p is NonNullable<typeof p> => p !== null)
    // lastModified of the cluster hub = most recent post update in the cluster
    const latest = clusterPosts.reduce<string>((max, p) => {
      const d = p.dateModified ?? p.datePublished
      return d > max ? d : max
    }, '')
    return {
      url: `${SITE_URL}/blog/category/${c}`,
      lastModified: latest ? new Date(latest) : undefined,
      changeFrequency: 'weekly',
      priority: 0.5,
    }
  })
  return [
    { url: SITE_URL, changeFrequency: 'weekly', priority: 1 },
    { url: `${SITE_URL}/fake-review-checker`, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${SITE_URL}/blog`, changeFrequency: 'daily', priority: 0.9 },
    ...clusterEntries,
    ...articleEntries,
  ]
}
