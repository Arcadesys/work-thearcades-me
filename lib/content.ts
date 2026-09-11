export type CaseStudy = {
  id: string;
  lane: string;
  title: string;
  body: string;
  tags: string[];
};

export const site = {
  name: 'Austen Tucker-Crowder',
  email: 'austen.crowder@gmail.com',
  bookingUrl: 'https://cal.com/austen-tucker-crowder/30min',
  resumeUrl: 'https://www.thearcades.me/resume',
  creativeUrl: 'https://www.thearcades.me',
  publishingUrl: 'https://freeplaypublishing.com',
  githubUrl: 'https://github.com/Arcadesys',
} as const;

export const lanes = [
  {
    number: '01',
    title: 'Builder',
    body: 'I prototype quickly, learn from the real thing, and turn lived friction into software.',
    href: '#builder-case',
    link: 'Bunch: building the tool I needed',
  },
  {
    number: '02',
    title: 'Owner',
    body: 'I take responsibility for the outcome, especially when the system is complicated and the stakes are real.',
    href: '#owner-case',
    link: '$1.5B in locked loan volume',
  },
  {
    number: '03',
    title: 'Evangelist',
    body: 'I make new technology feel learnable, practical, and safe enough to experiment with.',
    href: '#evangelist-case',
    link: 'Turning AI curiosity into working artifacts',
  },
] as const;

export const caseStudies: CaseStudy[] = [
  {
    id: 'builder-case',
    lane: 'Builder',
    title: 'Bunch: a continuity tool I built because I needed it',
    body: 'I started with a deeply personal usability problem and built a practical AI-assisted system around it. The point was continuity: preserving context, reducing cognitive load, and making information available at the moment it mattered.',
    tags: ['AI systems', 'Accessibility', 'Product design', 'Rapid prototyping'],
  },
  {
    id: 'owner-case',
    lane: 'Owner',
    title: 'Owning delivery on a platform tied to $1.5B in locked loan volume',
    body: 'At Guaranteed Rate, I acted as product owner for a data-mining tool that generated $1.5B in locked loans. The work required turning complexity into priorities, risks, trade-offs, and a path through ambiguity.',
    tags: ['Program ownership', 'Fintech', 'Delivery', 'Executive communication'],
  },
  {
    id: 'evangelist-case',
    lane: 'Evangelist',
    title: 'Making AI development feel safe enough to try',
    body: 'At ActiveCampaign, I design hands-on AI enablement that leaves people with working artifacts. A Cursor IDE bootcamp for non-technical staff helped participants build and judge real prototypes in the room.',
    tags: ['AI enablement', 'Agentic development', 'Teaching', 'Change leadership'],
  },
];

export const notes = [
  {
    title: 'Bunch',
    date: 'September 9, 2026',
    body: 'A build note about an MCP-first private companion for continuity, context, and usable handoffs.',
    href: 'https://www.thearcades.me/projects/bunch/bunch',
  },
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
] as const;
