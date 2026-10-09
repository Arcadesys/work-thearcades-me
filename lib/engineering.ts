export type EngineeringLink = {
  label: string;
  href: string;
  note?: string;
};

export type ArchitectureLayer = {
  label: string;
  description: string;
};

export type EngineeringStory = {
  title: string;
  theme: string;
  anchorLine?: string;
  narrativeBeats: readonly string[];
  evidence: readonly EngineeringLink[];
};

const repository = 'https://github.com/Arcadesys/bunch';
const source = (path: string) => `${repository}/blob/main/${path}`;
const pullRequest = (number: number) => `${repository}/pull/${number}`;

/**
 * Public, source-linked copy for the Bunch engineering tour.
 *
 * This is intentionally a record of merged implementation evidence, not a
 * claim that a particular hosted deployment has been accepted or is available.
 */
export const engineeringTour = {
  title: 'The engineering behind Bunch',
  description:
    'How Austen Tucker-Crowder built and operates Bunch: one private state model, two interfaces, and explicit rules for AI-assisted action.',
  thesis:
    'Bunch looks like a continuity app. Underneath, it asks a harder question: how do you let AI act on private, durable state without giving the model god mode?',
  framing:
    'I built Bunch as AI-native software: ChatGPT, Codex, and a web app can work with the same private records, through one set of rules I can test and operate.',

  architecture: {
    headline: 'Two interfaces. One set of rules.',
    diagram: {
      label: 'Bunch architecture',
      interfaces: [
        {
          label: 'ChatGPT / Codex',
          description: 'AI clients enter through MCP tools.',
        },
        {
          label: 'Web app',
          description: 'Browser interactions enter through REST routes.',
        },
      ] satisfies readonly ArchitectureLayer[],
      transports: ['MCP', 'REST'],
      contracts: {
        label: 'typed domain contracts',
        description: 'Shared definitions keep stored records, API routes, and tool schemas aligned.',
      } satisfies ArchitectureLayer,
      service: {
        label: 'SystemService',
        description: 'The shared transactional service owns mutation rules for both interfaces.',
      } satisfies ArchitectureLayer,
      dependencies: [
        {
          label: 'PostgreSQL',
          description: 'Durable, owner-scoped records and activity history.',
        },
        {
          label: 'private media',
          description: 'Owner-authorized storage that does not expose image bytes to the model.',
        },
        {
          label: 'AI providers',
          description: 'Explicit generation jobs with accounting and bounded retries.',
        },
      ] satisfies readonly ArchitectureLayer[],
      safeguards: ['versions', 'retries', 'audit', 'cost controls'],
      connections: [
        'ChatGPT and Codex use MCP while the web app uses REST.',
        'Both interfaces pass typed domain contracts into SystemService instead of implementing separate business rules.',
        'SystemService applies the same version, retry, audit, privacy, and cost boundaries before reaching PostgreSQL, private media, or AI providers.',
      ],
    },
    proseEquivalent:
      'ChatGPT and Codex use MCP; the web app uses REST. Both pass typed domain contracts into SystemService. SystemService applies the same rules before accessing PostgreSQL, private media, or AI providers. Version checks, retry safety, audit events, and cost controls apply beneath both interfaces.',
    evidence: [
      {
        label: 'Read ARCHITECTURE.md',
        href: source('ARCHITECTURE.md'),
        note: 'The source explanation of the layers, shared service, and write rules.',
      },
    ] satisfies readonly EngineeringLink[],
  },

  stories: [
    {
      title: 'Oh shit, web ChatGPT doesn’t work the way I hoped.',
      theme: 'change the architecture when reality disproves the plan.',
      narrativeBeats: [
        'The original assumption was that a custom GPT could be the integration surface Bunch needed. The platform did not work that way in practice.',
        'I investigated the available paths instead of preserving the original plan. The custom GPT route could not provide the durable, private integration surface the product required.',
        'I changed the architecture: the web app and MCP became two front doors onto the same records, typed contracts, and SystemService rules.',
      ],
      evidence: [
        { label: 'Shared-service architecture', href: source('ARCHITECTURE.md') },
        { label: 'Typed domain contracts', href: `${repository}/tree/main/src/domain` },
        { label: 'SystemService', href: source('src/server/system-service.ts') },
      ],
    },
    {
      title: 'I felt like a fish out of water wiring up MCP.',
      theme: 'learn unfamiliar infrastructure by shipping through it.',
      narrativeBeats: [
        'MCP was unfamiliar infrastructure. The first implementation encoded assumptions that looked reasonable locally.',
        'Real ChatGPT behavior exposed the gaps: discovery probes, OAuth handoff, anonymous transport checks, and resource audiences all had sharper protocol boundaries than the first pass expected.',
        'I debugged those boundaries directly and turned each failure into compatibility behavior, regression coverage, hosted verification, or installation guidance.',
      ],
      evidence: [
        { label: 'PR #68: discovery probes', href: pullRequest(68) },
        { label: 'PR #70: discovery fallback', href: pullRequest(70) },
        { label: 'PR #71: OAuth handoff', href: pullRequest(71) },
        { label: 'PR #74: connection probes', href: pullRequest(74) },
        { label: 'PR #75: OAuth audiences', href: pullRequest(75) },
        { label: 'Hosted MCP verification', href: source('docs/verification/hosted-demo.md') },
      ],
    },
    {
      title: 'Then I got brave enough to ask for alpha users.',
      anchorLine:
        'The moment I invited alpha users, Bunch stopped being software I could explain away and became software I had to operate.',
      theme: 'shipping to humans changes the engineering.',
      narrativeBeats: [
        'A personal tool can survive rough edges that other people should never have to interpret. Inviting alpha users made ownership, authentication, destructive actions, onboarding, cost, and accessibility operating concerns.',
        'The pilot work tightened owner isolation and browser/API boundaries, added explicit capacity controls, and made AI usage and spend visible and bounded.',
        'Acceptance moved beyond “the code exists” to deterministic tests, accessible browser checks, packaging, onboarding, and separately reported production verification.',
      ],
      evidence: [
        { label: 'PR #81: auth boundaries', href: pullRequest(81) },
        { label: 'PR #82: pilot capacity', href: pullRequest(82) },
        { label: 'PR #77: AI spend controls', href: pullRequest(77) },
        { label: 'PR #65: image allowances and repair', href: pullRequest(65) },
        { label: 'Interactive-demo browser verification', href: source('docs/verification/interactive-public-demo.md') },
      ],
    },
  ] satisfies readonly EngineeringStory[],

  agentWorkflow: {
    mainPoint:
      'I don’t use agents as autocomplete. I use them as implementation collaborators inside explicit boundaries.',
    steps: [
      'Problem',
      'Explicit constraints',
      'Agent implementation',
      'Deterministic tests / evals',
      'Production verification',
      'Ratchet the specification',
    ],
    humanWork: [
      'defining invariants',
      'decomposing the problem',
      'deciding what evidence counts',
      'reviewing plausible-but-wrong implementations',
      'tightening the specification after failures',
    ],
  },

  productionEvidence: {
    heading: 'What the evidence can and cannot establish',
    body:
      'The linked pull requests document merged changes and their recorded checks. They do not, by themselves, establish a current production deployment, a successful authenticated connection, or an outcome for any person using Bunch.',
    chips: [
      'MCP tools',
      'OAuth',
      'PostgreSQL',
      'optimistic concurrency',
      'idempotent writes',
      'private media boundaries',
      'AI spend controls',
      'Playwright acceptance tests',
      'plugin packaging',
      'accessible mobile layouts',
    ],
    evidence: [
      { label: 'PR #77: staged AI spend controls', href: pullRequest(77) },
      { label: 'PR #81: auth boundaries', href: pullRequest(81) },
      { label: 'PR #82: pilot capacity', href: pullRequest(82) },
    ] satisfies readonly EngineeringLink[],
  },

  digDeeper: [
    { label: 'ARCHITECTURE.md', href: source('ARCHITECTURE.md') },
    { label: 'PR #77: staged AI spend controls', href: pullRequest(77) },
    { label: 'docs/demo-install.md', href: source('docs/demo-install.md') },
    { label: 'Bunch repository', href: repository },
    { label: 'MCP/OAuth repair history', href: pullRequest(71) },
    { label: 'Browser and accessibility boundary tests', href: pullRequest(81) },
  ] satisfies readonly EngineeringLink[],
} as const;

export type EngineeringTour = typeof engineeringTour;
