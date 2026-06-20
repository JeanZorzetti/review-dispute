export interface Author {
  id: string
  name: string
  role: string
  bio: string
  avatar: string
  knowsAbout: string[]
  sameAs?: string[]
  credentials?: string[]
  mediaMentions?: string[]
}

export const AUTHORS: Record<string, Author> = {
  'marcus-reyes': {
    id: 'marcus-reyes',
    name: 'Marcus Reyes',
    role: 'Reputation Specialist',
    bio: 'Marcus has spent over a decade helping home-services businesses protect their online reputation and navigate Google review policy. He leads dispute strategy at ReviewShield and has personally managed review campaigns for hundreds of contractors across the US.',
    avatar: '/blog/authors/marcus-reyes.webp',
    knowsAbout: [
      'Google review policy',
      'local SEO',
      'online reputation management',
      'Google Business Profile optimization',
      'review generation for contractors',
      'fake review removal',
    ],
    credentials: [
      '10+ years in local reputation management',
      'Google Business Profile specialist',
      'Managed 500+ contractor review campaigns',
    ],
    sameAs: ['https://www.linkedin.com/in/marcus-reyes'],
    mediaMentions: [
      'Featured in Contractor Growth Network podcast (2024)',
      'Quoted in HomeAdvisor\'s Guide to Online Reputation',
    ],
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
