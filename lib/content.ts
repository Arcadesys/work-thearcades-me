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

export type CaseLink = {
  label: string;
  href: string;
  /** Controls emphasis without making a page component special-case a study. */
  emphasis?: 'primary' | 'secondary' | 'quiet';
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
  /** Search-facing title when the visible editorial heading is more expressive. */
  seoTitle?: string;
  body: string;
  tags: string[];
  /** Public primary-source links, displayed on the full case-study page. */
  links?: CaseLink[];
  /** A quiet contextual link that sits beneath the home-page case story. */
  homeSupplementaryLink?: CaseLink;
  blogTags?: string[];
  accent: Accent;
  image?: CaseImage;
  star?: Star;
  /** The closing lesson the writeup lands on. */
  principle?: string;
  /** Fast, inspectable proof for skeptical readers. */
  evidence?: {
    heading: string;
    items: Array<{ label: string; value: string }>;
    note?: string;
  };
  /** Technical/product detail that sits outside the narrative story. */
  buildNotes?: Array<{
    heading: string;
    paragraphs: string[];
  }>;
};

export const STAR_PARTS = [
  { key: 'situation', label: 'The problem' },
  { key: 'task', label: 'What I owned' },
  { key: 'action', label: 'What I did' },
  { key: 'result', label: 'What changed' },
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
  role: 'AI Enablement Leader Who Builds',
  email: 'austen@thearcades.me',
  bookingUrl: 'https://cal.com/austen-tucker-crowder/30min',
  resumeUrl: '/resume',
  creativeUrl: 'https://www.thearcades.me',
  publishingUrl: 'https://freeplaypublishing.com',
  githubUrl: 'https://github.com/Arcadesys',
  linkedinUrl: 'https://www.linkedin.com/in/austen-tucker-0968a914',
  blogUrl: 'https://work.thearcades.me/blog',
} as const;

export const hero = {
  eyebrow: 'AI enablement leader · hands-on builder · product-minded engineer',
  headingBefore: 'Hi. I make ',
  headingAccent: 'useful',
  headingAfter: ' things.',
  authorship: 'Everything you see here was conceived, built, written, and shipped by me. I use AI heavily as part of my toolchain; I own the product decisions, architecture, judgment, iteration, and delivery.',
  evidence: 'Helped raise agentic-coding adoption from roughly 2% to 43% of merge requests',
  intro:
    'I lead AI adoption across engineering, product, and leadership, and I build the tools that make it stick: working prototypes, MCP-enabled operating artifacts, evaluation prompts, and learning experiences people can own. I’m looking for AI enablement and transformation leadership roles where building is part of the job, plus focused consulting.',
} as const;

export const workWithMe = {
  title: 'Build the first useful version',
  description: 'AI enablement and workflow consulting from Austen Tucker-Crowder: practical prototypes, useful AI workflows, and team handoff for organizations with a concrete problem to solve.',
  intro: 'I take on focused consulting for organizations with a messy workflow, a half-formed product idea, or an AI capability that needs to become real. A first engagement produces a working prototype or workflow, a way to evaluate it with the people who will use it, and clear next-step decisions your team can own.',
  roleLabel: 'Talk about an AI enablement role',
  consultingTitle: 'Focused consulting engagements',
  consultingIntro: 'For consulting, I scope around a concrete outcome rather than selling a vague bucket of hours.',
  bookingLabel: 'Discuss a project',
  services: [
    {
      id: 'first-useful-version',
      title: 'Build the first useful version',
      body: 'Turn an idea, recurring headache, or broken workflow into something real enough to use and learn from.',
      includes: ['Working prototype or small application', 'Explicit acceptance criteria', 'Handoff notes and next-step decisions'],
      detail: 'The point is not a polished monument. It is a useful first version that exposes what should happen next.',
      exampleSlug: 'bunch',
    },
    {
      id: 'ai-workflow',
      title: 'Put AI to work on a real task',
      body: 'Take one meaningful workflow and make AI useful inside it without pretending generated output is automatically trustworthy.',
      includes: ['Workflow design and implementation', 'A way to inspect or check results', 'Practical documentation for the people using it'],
      detail: 'The deliverable is an approach your team can try, evaluate, and improve rather than a demo that only works while I am in the room.',
      exampleSlug: 'ai-enablement',
    },
    {
      id: 'team-ownership',
      title: 'Help the team take ownership',
      body: 'When a useful pattern exists, I help turn it into something other people can operate, teach, and extend.',
      includes: ['Hands-on training', 'Worked examples', 'Ownership and handoff plan'],
      detail: 'Good systems should survive contact with the people who inherit them.',
      exampleSlug: 'ai-enablement',
    },
  ],
  firstStep: {
    title: 'How this works',
    steps: [
      'We identify the concrete problem and the person who needs it solved.',
      'I propose a bounded first outcome, acceptance criteria, and estimate.',
      'We build, test, and decide what deserves to exist next.',
    ],
  },
  pricing: {
    title: 'Scope before spectacle',
    body: 'Pricing depends on scope. Sliding-scale options are available, especially for individuals, artists, and small community organizations. We define what success means before committing to a larger build.',
    welcome: 'Small nonprofits and LGBTQ organizations are especially welcome.',
  },
  closing: 'Bring an idea, a recurring headache, or a system that needs to become legible.',
} as const;

export const outcomes = [
  {
    number: '01',
    title: 'Prototype',
    body: 'Turn an ambiguous opportunity into a working artifact people can react to.',
    accent: 'pink' as Accent,
  },
  {
    number: '02',
    title: 'Instrument',
    body: 'Define what success means and measure the behavior that matters instead of relying on vibes.',
    accent: 'orange' as Accent,
  },
  {
    number: '03',
    title: 'Operationalize',
    body: 'Build the boring-but-essential evaluation, documentation, and handoff around the useful thing.',
    accent: 'rose' as Accent,
  },
  {
    number: '04',
    title: 'Enable',
    body: 'Teach the pattern well enough that the team can keep moving without a permanent wizard in the basement.',
    accent: 'amber' as Accent,
  },
] as const;

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
    blogTags: ['bunch'],
    lane: 'Accessibility · Public interest',
    title: 'Bunch: free, open software for continuity across memory gaps',
    seoTitle: 'Building an MCP Context System: Bunch',
    body: "I built Bunch to meet a continuity need that the tools I had tried did not address: recovering working context across memory gaps. It's free and open, with the source code and data model published. The engineering problem was preserving context so the right information surfaces at the moment it matters. The accessibility problem turned out to be the same problem in a different hat.",
    tags: ['Accessibility', 'Public interest', 'AI systems', 'Rapid prototyping'],
    links: [
      { label: 'Try the interactive demo', href: 'https://system.thearcades.me/demo', emphasis: 'primary' },
      { label: 'Building with Bunch? → Technical tour', href: '/engineering', emphasis: 'secondary' },
      { label: 'View the source code', href: 'https://github.com/Arcadesys/bunch', emphasis: 'quiet' },
    ],
    homeSupplementaryLink: { label: 'Building with Bunch? → Technical tour', href: '/engineering', emphasis: 'quiet' },
    accent: 'pink',
    evidence: {
      heading: 'Proof you can inspect',
      items: [
        { label: 'Observed recovery', value: 'About 15 seconds for one real catch-up that had previously taken roughly 20 minutes to reconstruct manually.' },
        { label: 'Public implementation', value: 'Source code, setup documentation, and the data model are published.' },
        { label: 'Shared engine', value: 'The web app and MCP server operate on the same explicit records and service rules.' },
      ],
      note: 'The 15-second result is one personal observation, not a population-wide performance benchmark.',
    },
    buildNotes: [
      {
        heading: 'Under the hood',
        paragraphs: [
          'Bunch has two front doors onto the same records: a web application for browsing and editing, and an MCP server so an AI assistant can read and write under the same rules.',
          'The record model is deliberately explicit. A missing entry means nothing was recorded; the system does not infer that nobody was present. That boundary is part of the product, not an implementation footnote.',
        ],
      },
      {
        heading: 'The product insight',
        paragraphs: [
          'I started by thinking I was building identity-tracking software. The more general problem was continuity: preserve enough structured context that the next person, session, or interface can keep going.',
          'That makes the architecture productizable across different surfaces. The audience-specific language can change while the core job stays the same: maintain canonical context, track changes over time, and hand a harness the smallest useful packet of truth.',
        ],
      },
    ],
    image: {
      src: '/images/bunch-data-model.png',
      width: 1792,
      height: 2316,
      alt: 'Diagram of Bunch’s data model linking people to hosting and fronting history.',
      caption: 'Bunch’s published data model: people have pictures, hosting history, and fronting history; a return can have a catch-up with saved notes, tasks, decisions, and conversation summaries. Hosting records responsibility; fronting records presence.',
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
    title: 'Building internal tools and moving a blocked initiative forward',
    body: 'At Guaranteed Rate, I acted as product owner for a data-mining tool associated with $1.5B in locked loan volume. The work required turning complexity into priorities, risks, trade-offs, and a path through ambiguity.',
    tags: ['Program ownership', 'Fintech', 'Delivery', 'Executive communication'],
    accent: 'orange',
    evidence: {
      heading: 'Scope, separated cleanly',
      items: [
        { label: 'Technical credibility', value: 'Learned JavaScript and shipped internal tools, including a real-time lobby display of loan locks.' },
        { label: 'Program ownership', value: 'Later acted as product owner on a separate data-mining initiative associated with roughly $1.5B in locked loan volume.' },
        { label: 'Operating lesson', value: 'Small shipped artifacts created feedback and credibility faster than abstract plans.' },
      ],
      note: 'The lobby display and the $1.5B data-mining initiative were separate pieces of work. The volume figure describes the initiative’s associated locked loans, not revenue I personally generated.',
    },
    buildNotes: [
      {
        heading: 'Why this belongs in an engineering portfolio',
        paragraphs: [
          'The important part is not that I became a JavaScript expert overnight. I learned enough to cross the boundary from coordinator to builder, put a real tool in front of people, and use that artifact to improve the quality of the product conversation.',
        ],
      },
    ],
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
        'That work ultimately contributed to a data-mining tool associated with roughly **$1.5 billion in locked loan volume**. More importantly, it shaped the way I still build today: start with the smallest useful thing, get it into people’s hands quickly, and use feedback to decide what deserves to exist next.',
      ],
    },
    principle: 'Build small. Build simple. Get feedback.',
  },
  {
    id: 'evangelist-case',
    slug: 'ai-enablement',
    blogTags: ['ai-enablement'],
    lane: 'Evangelist',
    title: 'Turning AI adoption into measurable, repeatable practice',
    seoTitle: 'AI Adoption Case Study: ActiveCampaign',
    body: 'At ActiveCampaign, I led AI enablement and transformation across engineering, product, and leadership. I paired adoption goals and operating metrics with accessibility-first learning experiences that made practical experimentation possible.',
    tags: ['AI enablement', 'Agentic development', 'Teaching', 'Change leadership'],
    accent: 'rose',
    evidence: {
      heading: 'Measured transformation',
      items: [
        { label: 'Adoption', value: 'Agentic-coding adoption moved from roughly 2% to 43% of merge requests across the broader transformation work.' },
        { label: 'Enablement surface', value: 'Led a hands-on product-manager roadshow across three continents.' },
        { label: 'Behavior change', value: 'Product managers began producing prototypes of their own after the roadshow.' },
      ],
      note: 'The adoption metric reflects broader organizational work. I contributed to that result; I do not claim the training program alone caused the increase.',
    },
    buildNotes: [
      {
        heading: 'What I was actually building',
        paragraphs: [
          'The product was not a workshop. It was an operating system for adoption: goals and KPIs, practical learning experiences, visible artifacts, decision structures, and enough psychological safety for people to try the tools on real work.',
          'The repeated pattern was to pair permission to experiment with a way to inspect the result. That is how a novelty starts becoming a practice.',
        ],
      },
    ],
    star: {
      situation: [
        'ActiveCampaign had a strong push toward AI adoption, but little shared structure for how engineering, product, and leadership would learn, measure progress, and act on it.',
      ],
      task: [
        'I needed to turn that ambition into measurable, repeatable practice while lowering the barrier for product managers to try agentic development before they felt fully qualified.',
      ],
      action: [
        'I led Devin adoption with goals and KPIs, coordinated cross-pillar transformation work around outcomes and north-star metrics, and built operational artifacts for shared decisions and program visibility. I also led a March 2026 roadshow for product managers across three continents, introducing Cursor and agentic AI through accessibility-first, hands-on learning experiences.',
      ],
      result: [
        'I helped raise agentic-coding adoption from roughly **2% to 43% of merge requests** across the broader transformation work; it was still climbing at departure.',
        'Following the March 2026 roadshow, product managers began producing prototypes of their own.',
      ],
    },
    principle: 'People do not need permission to be experts. They need permission to try.',
  },
  {
    id: 'cockpit-case',
    slug: 'job-search-cockpit',
    lane: 'Builder · AI systems',
    title: 'A job-search cockpit where AI can draft but cannot invent',
    seoTitle: 'Human-in-the-Loop AI Case Study: Job-Search Cockpit',
    body: 'I built a private workspace to run my own job search: it finds leads, drafts tailored applications, and hands batches to a local MCP worker. The design problem was trust. An AI that writes applications will happily invent experience, so the model only chooses which of my reviewed résumé claims fit a role. The draft is assembled from those claims’ exact text, and nothing counts as submitted without a saved confirmation.',
    tags: ['AI systems', 'Human-in-the-loop', 'MCP', 'Privacy by design'],
    links: [
      { label: 'Read the MCP API design', href: 'https://github.com/Arcadesys/work-thearcades-me/blob/main/docs/jobs-mcp-api.md', emphasis: 'primary' },
      { label: 'Read the workspace setup notes', href: 'https://github.com/Arcadesys/work-thearcades-me/blob/main/docs/private-jobs-foundation.md', emphasis: 'secondary' },
      { label: 'View the source code', href: 'https://github.com/Arcadesys/work-thearcades-me', emphasis: 'quiet' },
    ],
    accent: 'amber',
    evidence: {
      heading: 'Guardrails you can inspect',
      items: [
        { label: 'The model selects; it does not write facts', value: 'The model returns claim IDs. Any ID that is not a reviewed claim is dropped, and the résumé variant and outreach are assembled from the exact approved claim text.' },
        { label: 'Verified postings only', value: 'Drafting requires the original posting text and a source note. Search snippets are rejected, and posting text is passed to the model as untrusted data.' },
        { label: 'No silent submissions', value: 'The MCP API has no employer submit endpoint. An item becomes submitted only with a saved confirmation receipt, and retries are idempotent.' },
        { label: 'Audit trail', value: 'Every résumé-claim edit appends an immutable version row in the same database statement that changes the claim.' },
        { label: 'Bounded spend', value: 'Each request reserves budget against a monthly cap. A failed or unmeasured provider call closes the budget rather than risking unaccounted spend.' },
        { label: 'Private by default', value: 'GitHub sign-in with an account allowlist, rechecked on every read; the workspace is noindex, excluded from the sitemap, and skipped by analytics.' },
      ],
      note: 'This describes how the system is built, not job-search outcomes. The design docs and source code are public; the leads, drafts, and résumé review data are not.',
    },
    buildNotes: [
      {
        heading: 'Under the hood',
        paragraphs: [
          'Leads arrive two ways: a daily job polls Google Alerts RSS feeds under a monthly cap, and LinkedIn alert emails can be imported on demand. Both land as unverified leads, because a feed snippet is a hint, not proof that a posting is live.',
          'A local MCP client works through batches of pursued jobs using scoped bearer tokens that are stored only as hashes, expire after 90 days, and can be revoked. The worker can move an item through queued, preparing, awaiting approval, blocked, or skipped. It cannot mark anything submitted through the status route.',
        ],
      },
      {
        heading: 'The product insight',
        paragraphs: [
          'Enabling AI in a workflow is mostly deciding where it is not allowed to decide. The model is fast at drafting. The system is built so that speed never outruns what I can stand behind.',
          'That is the same operating pattern I use for team adoption: permission to experiment, paired with a way to inspect the result.',
        ],
      },
    ],
    star: {
      situation: [
        'I started a job search and wanted AI help with the repetitive parts: finding postings, tailoring a résumé, drafting outreach. The obvious failure mode is an assistant that confidently writes experience I do not have, into documents that go to real employers under my name.',
      ],
      task: [
        'I needed a system that could move quickly without ever putting an unverified claim in front of a hiring manager, and without counting an application as sent unless it really was.',
      ],
      action: [
        'I seeded a private **résumé-truth store** from my public résumé, with every claim starting as unreviewed and carrying a source note. Drafting only runs against a verified original posting; the model assesses fit and returns the IDs of reviewed claims that apply, and the draft is built from those claims’ exact text. I added lead discovery from Google Alerts and LinkedIn alert emails, a pipeline with weekly review of kept leads, applications, replies, interviews, and offers, and a narrow MCP API so a local agent can prepare batches while I approve what goes out.',
        'The guardrails are covered by unit tests alongside the rest of the site: claim filtering, queue transitions, discovery limits, and weekly counts.',
      ],
      result: [
        'The system now runs my own search. Every generated draft is built from claims I have reviewed, with a snapshot of those claims saved alongside it, and the weekly count of applications comes only from saved submission receipts, not from what an agent says it did.',
        'I am not claiming outcomes yet. The weekly review will say whether it works; the design already says what it is allowed to do.',
      ],
    },
    principle: 'Let the AI move fast. Make it prove every claim.',
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
    {
      title: 'Unpaid work that ships.',
      body: 'Free accessibility software and nonprofit conference operations, because the through-line has always been building for people the tools ignore.',
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
  heading: 'Get the build notes.',
  body: 'I write about building AI systems in public—what worked, what broke, and what I’d do differently.',
  idleNote: 'One email a week. Unsubscribe whenever.',
} as const;

export const commentBox = {
  label: 'Leave a comment',
  placeholder: 'Thoughts, corrections, better ideas — all welcome.',
  idleNote: 'Comments are moderated. Be interesting.',
  doneNote: 'Posted — it’ll show up once I’ve had a look.',
} as const;

export const contact = {
  kicker: 'Say hello',
  heading: 'Let’s talk about AI enablement leadership or a focused project.',
  body: 'I’m seeking AI enablement and transformation leadership roles where I still build the tools, evaluations, and operating artifacts that turn adoption into practice. I also take on focused consulting projects with a concrete outcome.',
} as const;
