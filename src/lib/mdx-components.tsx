import Link from 'next/link'
import type { MDXComponents } from 'mdx/types'
import { KeyTakeaways } from '@/src/components/blog/mdx/KeyTakeaways'
import { AnswerBox } from '@/src/components/blog/mdx/AnswerBox'
import { Stat, StatGrid } from '@/src/components/blog/mdx/Stat'
import { Definition } from '@/src/components/blog/mdx/Definition'
import { Callout } from '@/src/components/blog/mdx/Callout'
import { CTA } from '@/src/components/blog/mdx/CTA'

export const mdxComponents: MDXComponents = {
  a: ({ href, children, ...rest }) => {
    const url = String(href ?? '')
    if (url.startsWith('/')) return <Link href={url} {...rest}>{children}</Link>
    return <a href={url} target="_blank" rel="noopener noreferrer" {...rest}>{children}</a>
  },
  img: ({ src, alt, ...rest }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={String(src ?? '')} alt={alt ?? ''} loading="lazy" {...rest} />
  ),
  KeyTakeaways,
  AnswerBox,
  Stat,
  StatGrid,
  Definition,
  Callout,
  CTA,
}
