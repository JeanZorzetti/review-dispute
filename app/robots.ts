import type { MetadataRoute } from 'next'
import { SITE_URL } from '@/src/lib/site'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: '*', allow: '/', disallow: ['/admin', '/dashboard', '/onboarding', '/api'] },
      { userAgent: ['GPTBot', 'PerplexityBot', 'Google-Extended', 'ClaudeBot'], allow: '/blog' },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  }
}
