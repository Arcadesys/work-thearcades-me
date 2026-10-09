// Compatibility adapter (#48). Career facts now live in content/resume/career.json
// and editorial selections in content/resume/profiles/*.json, validated and
// resolved by lib/resume/. These exports keep their previous names and exact
// values (see lib/resume/legacy-parity.fixture.json) until consumers migrate.
// The complete claim arrays stay stable: the private truth-review workflow
// seeds positional IDs from them.
import { CAREER, DEFAULT_PROFILE_ID, resolveResume } from './resume/index';
import type { ResolvedSection } from './resume/compose';

export interface ResumeProfile {
  name: string;
  titleLine: string;
  location: string;
  email: string;
  site: string;
  siteUrl: string;
  github: string;
  githubUrl: string;
}

export interface ResumeAccomplishment {
  text: string;
  /** An on-site artifact that backs the claim. Only set where one truly exists. */
  proofHref?: string;
}

export interface ResumeRole {
  company: string;
  location: string;
  title: string;
  dates: string;
  bullets: string[];
}

export interface ResumeEarlierRole {
  org: string;
  role: string;
  dates: string;
}

export interface ResumeSkillGroup {
  label: string;
  skills: string;
}

export interface ResumeBuild {
  name: string;
  description: string;
  proofHref: string;
  proofLabel: string;
}

const hiring = resolveResume(DEFAULT_PROFILE_ID);
const section = <K extends ResolvedSection['kind']>(kind: K) => {
  const found = hiring.sections.find((item) => item.kind === kind);
  if (!found) throw new Error(`The ${DEFAULT_PROFILE_ID} profile has no ${kind} section`);
  return found as Extract<ResolvedSection, { kind: K }>;
};

const primaryRoles = CAREER.roles.filter((role) => role.tier === 'primary');
const achievementsById = new Map(CAREER.achievements.map((item) => [item.id, item]));

const { identity } = hiring;
export const RESUME_PROFILE: ResumeProfile = {
  name: identity.name,
  titleLine: hiring.headline,
  location: identity.location,
  email: identity.email,
  site: identity.site,
  siteUrl: identity.siteUrl,
  github: identity.github,
  githubUrl: identity.githubUrl,
};

export const RESUME_SUMMARY = hiring.summary;

/** Every achievement with an approved highlight wording, in career order. */
export const RESUME_ACCOMPLISHMENTS: ResumeAccomplishment[] = primaryRoles.flatMap((role) => role.achievementIds
  .map((id) => achievementsById.get(id)?.variants?.highlight)
  .filter((text): text is string => Boolean(text))
  .map((text) => ({ text })));

export const RESUME_EXPERIENCE: ResumeRole[] = primaryRoles.map((role) => ({
  company: role.employer,
  location: role.location ?? '',
  title: role.title,
  dates: role.sourceDates,
  bullets: role.achievementIds.map((id) => achievementsById.get(id)!.text),
}));

export const RESUME_HIRING_EXPERIENCE: ResumeRole[] = section('experience').roles.map((role) => ({
  company: role.employer,
  location: role.location ?? '',
  title: role.title,
  dates: role.dates,
  bullets: role.items.map((item) => item.text),
}));

/** Public implementation evidence from lib/engineering.ts and lib/content.ts. */
export const RESUME_BUILDS: ResumeBuild[] = section('projects').items.map(({ name, description, proofHref, proofLabel }) => ({ name, description, proofHref, proofLabel }));

export const RESUME_EARLIER: ResumeEarlierRole[] = CAREER.roles
  .filter((role) => role.tier === 'earlier')
  .map((role) => ({ org: role.employer, role: role.title, dates: role.sourceDates }));

export const RESUME_SKILLS: ResumeSkillGroup[] = CAREER.skills.map(({ label, skills }) => ({ label, skills }));

/** The hiring edition reuses the same group objects so identity checks keep working. */
export const RESUME_HIRING_SKILLS: ResumeSkillGroup[] = section('skills').groups
  .map((group) => RESUME_SKILLS[CAREER.skills.findIndex((item) => item.id === group.id)]);

export const RESUME_EDUCATION: string[] = [...CAREER.education, ...CAREER.certifications].map((item) => item.text);

export const RESUME_CANONICAL_PATH = '/resume';
export const RESUME_PDF_PATH = '/resume.pdf';

export const RESUME_DESCRIPTION =
  'Hands-on AI builder with product and program leadership experience: working systems, MCP tools, evaluations, '
  + 'and 16+ years delivering customer-focused software.';

const community = CAREER.community[0];
export const RESUME_COMMUNITY = {
  organization: community.organization,
  title: community.title,
  location: community.location ?? '',
  description: community.description,
} as const;
