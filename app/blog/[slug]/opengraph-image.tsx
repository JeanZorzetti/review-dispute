import { ImageResponse } from 'next/og'
import { getAllPosts, getPostBySlug } from '@/src/lib/blog'
import { SITE_NAME } from '@/src/lib/site'

export const dynamicParams = false
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export function generateStaticParams() {
  return getAllPosts().map((p) => ({ slug: p.slug }))
}

export default async function OgImage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const post = getPostBySlug(slug)
  const title = post?.title ?? SITE_NAME
  return new ImageResponse(
    (
      <div style={{ height: '100%', width: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', background: '#16181d', padding: 64 }}>
        <div style={{ color: '#ff5b35', fontSize: 28, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 2 }}>{SITE_NAME}</div>
        <div style={{ color: '#ffffff', fontSize: 60, fontWeight: 900, lineHeight: 1.1 }}>{title}</div>
        <div style={{ color: '#b8bcc4', fontSize: 24 }}>reviewshield.nimblabs.com/blog</div>
      </div>
    ),
    { ...size },
  )
}
