import { getAllPosts, getAllClusters, getCluster } from '../src/lib/blog'

let errors = 0
function err(msg: string) {
  console.error(`✗ ${msg}`)
  errors++
}

const posts = getAllPosts()
const slugs = new Set(posts.map((p) => p.slug))

for (const p of posts) {
  if (!p.heroAlt && p.heroImage) err(`${p.slug}: has heroImage but no heroAlt`)
  if (p.description.length < 80 || p.description.length > 165) err(`${p.slug}: description length ${p.description.length} (need 80-165)`)
  for (const link of p.internalLinks ?? []) {
    if (!slugs.has(link)) err(`${p.slug}: internalLink "${link}" does not resolve to a real post`)
  }
  // orphan check: non-pillar singleton cluster with no internal links
}

for (const c of getAllClusters()) {
  const { pillar, members } = getCluster(c)
  if (!pillar) err(`cluster "${c}" has no pillar article (pillar: true)`)
  if (members.length === 0 && !pillar) err(`cluster "${c}" is empty`)
}

if (errors > 0) {
  console.error(`\n${errors} blog content error(s) found.`)
  process.exit(1)
}
console.log(`✓ blog content OK (${posts.length} posts, ${getAllClusters().length} clusters)`)
