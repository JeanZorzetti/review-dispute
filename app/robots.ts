import type { MetadataRoute } from 'next'
import { SITE_URL } from '@/src/lib/site'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: '*', allow: '/', disallow: ['/admin', '/dashboard', '/onboarding', '/api'] },
      // robots.txt blocks are evaluated per-agent in isolation — the `*` disallows
      // do NOT cascade. So AI bots need their own disallow or they'd crawl /admin etc.
      // /llms.txt rides along: an llms.txt the AI crawlers are disallowed from fetching is
      // decoration. It is the one path outside /blog they need.
      { userAgent: ['GPTBot', 'PerplexityBot', 'Google-Extended', 'ClaudeBot'], allow: ['/blog', '/llms.txt'], disallow: '/' },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  }
}
