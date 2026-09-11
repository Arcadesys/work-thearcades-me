export type Accent = 'pink' | 'orange' | 'rose' | 'amber';

export type Lane = {
  number: string;
  title: string;
  body: string;
  href: string;
  link: string;
  accent: Accent;
};

export type CaseImage = {
  src: string;
  width: number;
  height: number;
  alt: string;
  caption: string;
};

/**
 * The long-form writeup behind a case study, in STAR order.
 *
 * Every part is optional and holds one entry per paragraph. The detail page
 * renders only the parts that have content, so a half-written study is a
 * shorter page rather than a broken one — nothing is stubbed or invented.
 */
export type Star = {
  situation?: string[];
  task?: string[];
  action?: string[];
  result?: string[];
};

export type CaseStudy = {
  /** Anchor target on the home page. */
  id: string;
  /** Detail page lives at `/work/<slug>`. */
  slug: string;
  lane: string;
  title: string;
  body: string;
  tags: string[];
  accent: Accent;
  image?: CaseImage;
  star?: Star;
  /** The closing lesson the writeup lands on. */
  principle?: string;
};

export const STAR_PARTS = [
  { key: 'situation', label: 'Situation' },
  { key: 'task', label: 'Task' },
  { key: 'action', label: 'Action' },
  { key: 'result', label: 'Result' },
] as const satisfies ReadonlyArray<{ key: keyof Star; label: string }>;

export function hasStar(study: CaseStudy): boolean {
  return STAR_PARTS.some((part) => (study.star?.[part.key]?.length ?? 0) > 0);
}

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
    slug: 'bunch',
    lane: 'Builder',
    title: 'Bunch: a continuity tool I built because I needed it',
    body: 'I started with a deeply personal usability problem and built a practical AI-assisted system around it. The point was continuity: preserving context, reducing cognitive load, and making information available at the moment it mattered.',
    tags: ['AI systems', 'Accessibility', 'Product design', 'Rapid prototyping'],
    accent: 'pink',
    image: {
      src: '/images/bunch-data-model.png',
      width: 1792,
      height: 2316,
      alt: 'Bunch data model: people have pictures, hosting history, and fronting history; a return can have a catch-up with saved notes, tasks, decisions, and conversation summaries.',
      caption: 'Bunch’s published data model. Hosting records responsibility; fronting records presence.',
    },
    star: {
      situation: [
        'I have spent years trying to accommodate a practical problem created by dissociative amnesia while maintaining a demanding professional career. Earlier tools helped me track who was fronting, but they were much better at looking inward than helping me recover what had happened in the outside world.',
      ],
      task: [
        'I needed a way to restore working context quickly enough that memory gaps did not become missed decisions, repeated conversations, or degraded judgment at work.',
      ],
      action: [
        'I experimented first with community tools like PluralKit and Simply Plural, then began building small applications against their APIs. That process taught me both API integration and the limits of identity tracking alone. Later, while working deeply with AI context management, I reframed the problem: the interface was not the important part. **Continuity of context was.** I began building Bunch as an accessibility harness designed around that idea.',
      ],
      result: [
        'During one weekend, another alter was continuously fronting and I had little usable memory of what had happened. Instead of spending roughly 20 minutes asking people and reconstructing events manually, Bunch gave me a summary of everything I had worked on since I was last present in about **15 seconds**.',
        'That changed the problem from *“How do I keep track of who I am?”* to *“How do I make sure the next version of me can keep going?”*',
      ],
    },
    principle: 'The interface is not the moat. Continuity is.',
  },
  {
    id: 'owner-case',
    slug: 'guaranteed-rate',
    lane: 'Owner',
    title: 'Owning delivery on a platform tied to $1.5B in locked loan volume',
    body: 'At Guaranteed Rate, I acted as product owner for a data-mining tool that generated $1.5B in locked loans. The work required turning complexity into priorities, risks, trade-offs, and a path through ambiguity.',
    tags: ['Program ownership', 'Fintech', 'Delivery', 'Executive communication'],
    accent: 'orange',
    star: {
      situation: [
        'I joined Guaranteed Rate in a high-pressure, engineering-driven culture where credibility came from shipping. I had been hired to help keep teams moving, but early on I was told pretty directly that I was not worth listening to because I could not code.',
      ],
      task: [
        'I needed to earn enough technical credibility to be effective with engineers, while still doing the coordination and program work I had been hired to do.',
      ],
      action: [
        'I learned JavaScript and web development through a very practical apprenticeship with senior engineers. I built internal tools, including a lobby application that visualized loan locks happening in real time, which helped establish that I could build as well as coordinate.',
        'Later, when a major initiative was blocked through the normal engineering leadership path, I helped find an executive route to get the work approved and moving.',
      ],
      result: [
        'That work ultimately contributed to an initiative tied to roughly **$1.5 billion** in business value. More importantly, it shaped the way I still build today: start with the smallest useful thing, get it into people’s hands quickly, and use feedback to decide what deserves to exist next.',
      ],
    },
    principle: 'Build small. Build simple. Get feedback.',
  },
  {
    id: 'evangelist-case',
    slug: 'ai-enablement',
    lane: 'Evangelist',
    title: 'Making AI development feel safe enough to try',
    body: 'At ActiveCampaign, I design hands-on AI enablement that leaves people with working artifacts. A Cursor IDE bootcamp for non-technical staff helped participants build and judge real prototypes in the room.',
    tags: ['AI enablement', 'Agentic development', 'Teaching', 'Change leadership'],
    accent: 'rose',
    star: {
      situation: [
        'The company had a strong push toward AI adoption, but very little structure around how people were supposed to learn. There was no real curriculum, and more importantly, there was no safe space to experiment, fail, and admit that something had not worked.',
      ],
      task: [
        'I wanted to lower the barrier enough that product managers would actually try agentic development instead of waiting until they felt fully qualified.',
      ],
      action: [
        'Without waiting for a formal program, I built and ran a practical training session for product managers focused on basic Cursor usage and early agentic development patterns. The emphasis was not on mastery. It was on making the first attempt feel normal, useful, and low-risk.',
      ],
      result: [
        'After the session, the behavior changed quickly. People who had been hesitant to experiment started building prototypes of their own. Requests for engineering access increased, and AI went from something people were being told to adopt into something they were actively using to make things.',
      ],
    },
    principle: 'People do not need permission to be experts. They need permission to try.',
  },
];

export function caseStudyBySlug(slug: string): CaseStudy | undefined {
  return caseStudies.find((study) => study.slug === slug);
}

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
