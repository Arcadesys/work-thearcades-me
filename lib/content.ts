export type Accent = 'pink' | 'orange' | 'rose' | 'amber';

export type Lane = {
  number: string;
  title: string;
  body: string;
  href: string;
  link: string;
  accent: Accent;
};

export type CaseStudy = {
  id: string;
  lane: string;
  title: string;
  body: string;
  tags: string[];
  accent: Accent;
};

export type Note = {
  title: string;
  date: string;
  body: string;
  href: string;
};

export type Comment = {
  author: string;
  avatar: string;
  when: string;
  body: string;
  canReply: boolean;
};

export const site = {
  name: 'Austen Tucker-Crowder',
  role: 'AI Builder & Evangelist',
  email: 'austen.crowder@gmail.com',
  bookingUrl: 'https://cal.com/austen-tucker-crowder/30min',
  resumeUrl: 'https://www.thearcades.me/resume',
  creativeUrl: 'https://www.thearcades.me',
  publishingUrl: 'https://freeplaypublishing.com',
  githubUrl: 'https://github.com/Arcadesys',
  blogUrl: 'https://work.thearcades.me/blog',
} as const;

export const hero = {
  eyebrow: 'AI Builder & Evangelist',
  headingBefore: 'Hi. I make ',
  headingAccent: 'useful',
  headingAfter: ' things.',
  tagline: 'Finding elegant solutions to inelegant problems for twenty years.',
  intro:
    'I build AI systems, own messy problems end to end, and help people get comfortable enough with new technology to actually use it. I’m happiest where product, engineering, communication, and a slightly unreasonable amount of curiosity overlap.',
} as const;

export const beliefs = [
  {
    title: 'Start small. Ship fast.',
    body: 'Build the smallest useful thing first, then learn from reality.',
    accent: 'pink' as Accent,
  },
  {
    title: 'Make it legible.',
    body: 'Useful beats impressive. If people can’t understand it, they can’t use it.',
    accent: 'orange' as Accent,
  },
  {
    title: 'Build for handoff.',
    body: 'Good systems should be maintainable, teachable, and bigger than one heroic person.',
    accent: 'rose' as Accent,
  },
] as const;

export const lanes: Lane[] = [
  {
    number: '01',
    title: 'Builder',
    body: 'I prototype quickly, learn from the real thing, and turn lived friction into software.',
    href: '#builder-case',
    link: 'Bunch: building the tool I needed',
    accent: 'pink',
  },
  {
    number: '02',
    title: 'Owner',
    body: 'I take responsibility for the outcome, especially when the system is complicated and the stakes are real.',
    href: '#owner-case',
    link: '$1.5B in locked loan volume',
    accent: 'orange',
  },
  {
    number: '03',
    title: 'Evangelist',
    body: 'I make new technology feel learnable, practical, and safe enough to experiment with.',
    href: '#evangelist-case',
    link: 'Turning AI curiosity into working artifacts',
    accent: 'rose',
  },
  {
    number: '04',
    title: 'Advocate',
    body: 'My north star is always “find ways to make people have fun at work,” because that correlates with high-performing teams.',
    href: '#contact',
    link: 'Let’s talk about your team',
    accent: 'amber',
  },
];

export const caseStudies: CaseStudy[] = [
  {
    id: 'builder-case',
    lane: 'Builder',
    title: 'Bunch: a continuity tool I built because I needed it',
    body: 'I started with a deeply personal usability problem and built a practical AI-assisted system around it. The point was continuity: preserving context, reducing cognitive load, and making information available at the moment it mattered.',
    tags: ['AI systems', 'Accessibility', 'Product design', 'Rapid prototyping'],
    accent: 'pink',
  },
  {
    id: 'owner-case',
    lane: 'Owner',
    title: 'Owning delivery on a platform tied to $1.5B in locked loan volume',
    body: 'At Guaranteed Rate, I acted as product owner for a data-mining tool that generated $1.5B in locked loans. The work required turning complexity into priorities, risks, trade-offs, and a path through ambiguity.',
    tags: ['Program ownership', 'Fintech', 'Delivery', 'Executive communication'],
    accent: 'orange',
  },
  {
    id: 'evangelist-case',
    lane: 'Evangelist',
    title: 'Making AI development feel safe enough to try',
    body: 'At ActiveCampaign, I design hands-on AI enablement that leaves people with working artifacts. A Cursor IDE bootcamp for non-technical staff helped participants build and judge real prototypes in the room.',
    tags: ['AI enablement', 'Agentic development', 'Teaching', 'Change leadership'],
    accent: 'rose',
  },
];

export const ownerStat = {
  value: '$1.5B',
  label: 'locked loan volume',
} as const;

export const evangelistTakeaways = {
  heading: 'What people leave with',
  items: [
    'A working prototype they built themselves',
    'The judgment to tell good output from bad',
    'Permission to experiment on real work',
  ],
} as const;

export const quote = {
  text: 'Text isn’t just a medium for me. It’s an instrument I’ve spent thirty years learning to play.',
  attribution: 'Writing, editing, layout, publishing, product, and now AI.',
} as const;

export const about = {
  heading: 'A few things about me.',
  lede: 'I’ve spent my career moving between disciplines that are usually treated as separate. That turns out to be very useful in a text-first AI world.',
  facts: [
    {
      title: '16+ years delivering customer-focused software solutions.',
      body: 'AI transformation leadership, program management, agile coaching, and practical building.',
    },
    {
      title: 'Twenty years of published writing under several names.',
      body: 'Novels, short fiction, poetry, essays, and the occasional live performance.',
    },
    {
      title: 'I care about tools that survive contact with actual humans.',
      body: 'Accessibility, legibility, and adoption are product requirements, not garnish.',
    },
  ],
} as const;

export const featuredNote = {
  badge: 'Latest',
  date: 'September 9, 2026',
  kind: 'Build log',
  title: 'Bunch',
  body: 'A build note about an MCP-first private companion for continuity, context, and usable handoffs.',
  href: 'https://www.thearcades.me/projects/bunch/bunch',
} as const;

export const comments: Comment[] = [
  {
    author: 'Max',
    avatar: '/images/avatars/max.jpeg',
    when: '2 days ago',
    body: 'The hosting-versus-fronting split is the part I keep coming back to. Most tools collapse those into one field and then can’t answer either question.',
    canReply: false,
  },
  {
    author: 'Lucy',
    avatar: '/images/avatars/lucy.jpeg',
    when: '4 days ago',
    body: 'Did you consider shipping the catch-up summaries as a digest instead of on-demand? Curious how often you actually read them cold.',
    canReply: true,
  },
];

export const commentCount = 3;

export const notes: Note[] = [
  {
    title: 'The Stepladder',
    date: 'August 6, 2026',
    body: 'On discontinuity, the pace of technological change, and a different relationship with the machine.',
    href: 'https://www.thearcades.me/projects/the-singularity-log/the-stepladder',
  },
  {
    title: 'My Brain Was Built for This',
    date: 'July 2, 2026',
    body: 'A note about access, tools, and what it means to build for the way your brain actually works.',
    href: 'https://www.thearcades.me/projects/arcade-blog/my-brain-was-built-for-this',
  },
];

export const newsletter = {
  kicker: 'The newsletter',
  heading: 'Build notes, delivered to your mailbox.',
  body: 'I write about building AI systems in public — what worked, what broke, and what I’d do differently. Roughly monthly, no drip sequences, unsubscribe whenever.',
  idleNote: 'Sent with Postmark. Your address stays with me.',
  doneNote: 'Thanks — check your inbox to confirm.',
} as const;

export const commentBox = {
  label: 'Leave a comment',
  placeholder: 'Thoughts, corrections, better ideas — all welcome.',
  idleNote: 'Comments are moderated. Be interesting.',
  doneNote: 'Posted — it’ll show up once I’ve had a look.',
} as const;

export const contact = {
  kicker: 'Say hello',
  headingBefore: 'If you’ve got an inelegant problem, I’m ',
  headingAccent: 'interested',
  headingAfter: '.',
  body: 'I’m looking for work where AI, product thinking, communication, and practical building all belong in the same room.',
} as const;
