import Link from 'next/link'
import type { MDXComponents } from 'mdx/types'

export const mdxComponents: MDXComponents = {
  a: ({ href, children, ...rest }) => {
    const url = String(href ?? '')
    if (url.startsWith('/')) return <Link href={url} {...rest}>{children}</Link>
    return <a href={url} target="_blank" rel="noopener noreferrer" {...rest}>{children}</a>
  },
}
