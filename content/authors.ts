export interface Author {
  id: string
  name: string
  role: string
  bio: string
  avatar: string
  knowsAbout: string[]
  sameAs?: string[]
  credentials?: string[]
}

export const AUTHORS: Record<string, Author> = {
  'marcus-reyes': {
    id: 'marcus-reyes',
    name: 'Marcus Reyes',
    role: 'Reputation Specialist',
    bio: 'Marcus has spent over a decade helping home-services businesses protect their online reputation and navigate Google review policy. He leads dispute strategy at ReviewShield.',
    avatar: '/blog/authors/marcus-reyes.webp',
    knowsAbout: ['Google review policy', 'local SEO', 'online reputation management'],
    credentials: ['10+ years in local reputation management'],
  },
  'reviewshield-team': {
    id: 'reviewshield-team',
    name: 'The ReviewShield Team',
    role: 'Reputation Specialists',
    bio: 'The ReviewShield team helps US contractors remove policy-violating Google reviews and grow legitimate ones.',
    avatar: '/blog/authors/team.webp',
    knowsAbout: ['Google review removal', 'contractor reputation'],
  },
}

export function getAuthor(id: string): Author {
  return AUTHORS[id] ?? AUTHORS['reviewshield-team']
}
