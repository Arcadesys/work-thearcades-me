/**
 * Pure résumé composer (#48): career record + editorial profile → resolved
 * document. No network, no LLM, no scoring, no truncation. Inputs are never
 * mutated, and identical inputs always resolve to identical output.
 */
import { createHash } from 'node:crypto';

import {
  SCHEMA_VERSION, careerSchema, profileSchema,
  type AchievementRef, type Career, type CareerRole, type Profile, type ProfileId,
} from './schema';

export type Issue = { level: 'error' | 'warning'; code: string; path: string; message: string };

export type ResolvedItem = { id: string; text: string };
export type ResolvedRole = {
  id: string; employer: string; location?: string; title: string; scope?: string;
  start: string; end: string; dates: string; evidence?: { href: string; label: string }; items: ResolvedItem[];
};
export type ResolvedListing = { id: string; title: string; venue?: string; date?: string; url?: string };
type Section<K extends string, Body> = { kind: K; title: string } & Body;
export type ResolvedSection =
  | Section<'experience', { roles: ResolvedRole[] }>
  | Section<'earlier', { roles: ResolvedRole[] }>
  | Section<'highlights', { items: Array<ResolvedItem & { achievementId: string }> }>
  | Section<'projects', { items: Array<{ id: string; name: string; description: string; proofHref: string; proofLabel: string }> }>
  | Section<'skills', { groups: Array<{ id: string; label: string; skills: string }> }>
  | Section<'education', { items: ResolvedItem[] }>
  | Section<'publications', { items: ResolvedListing[] }>
  | Section<'talks', { items: ResolvedListing[] }>
  | Section<'community', { items: Array<{ id: string; organization: string; title: string; location?: string; description: string }> }>;

/** Headings used when a profile does not override them. */
export const DEFAULT_SECTION_TITLES: Record<ResolvedSection['kind'], string> = {
  experience: 'Experience',
  earlier: 'Earlier Experience',
  highlights: 'Highlights',
  projects: 'Selected Projects',
  skills: 'Skills',
  education: 'Education & Certifications',
  publications: 'Publications',
  talks: 'Talks & Training',
  community: 'Community & Volunteer Work',
};

export type ResolvedResume = {
  profileId: ProfileId;
  profileLabel: string;
  profileStatus: 'draft' | 'approved';
  schemaVersion: number;
  sourceRevision: string;
  /** sha256 of the resolved content (everything except sourceRevision, digest and issues). */
  digest: string;
  identity: Career['identity'];
  headline: string;
  summary: string;
  /** Meta description and contact call to action for this edition. */
  page: { description: string; cta: string; pitch: string };
  sections: ResolvedSection[];
  warnings: Issue[];
  errors: Issue[];
};

const error = (code: string, path: string, message: string): Issue => ({ level: 'error', code, path, message });
const warning = (code: string, path: string, message: string): Issue => ({ level: 'warning', code, path, message });

function zodIssues(prefix: string, result: { error?: { issues: Array<{ path: PropertyKey[]; message: string }> } }): Issue[] {
  return (result.error?.issues ?? []).map((issue) => error('schema', [prefix, ...issue.path.map(String)].join('.'), issue.message));
}

/**
 * Sort key for a partial date. A year-only date sorts before every month of that
 * year (month 0), and `ongoing` is newer than any date. This is the published
 * ordering rule for partial and overlapping dates.
 */
export function dateKey(value: string): number {
  if (value === 'ongoing') return Number.POSITIVE_INFINITY;
  const [year, month] = value.split('-').map(Number);
  return year * 100 + (month ?? 0);
}

/** Reverse chronological: latest end first, then latest start, then ID for a stable tie-break. */
export function compareRolesNewestFirst(a: Pick<CareerRole, 'id' | 'start' | 'end'>, b: Pick<CareerRole, 'id' | 'start' | 'end'>): number {
  return dateKey(b.end) - dateKey(a.end) || dateKey(b.start) - dateKey(a.start) || a.id.localeCompare(b.id);
}

/** Compares only at the precision both dates share, so `2015` → `2015-03` is valid. */
function startsAfterEnd(start: string, end: string): boolean {
  if (end === 'ongoing') return false;
  const precision = Math.min(start.length, end.length);
  return start.slice(0, precision) > end.slice(0, precision);
}

/** Structural and cross-reference checks for the career record. */
export function validateCareer(raw: unknown): { career?: Career; issues: Issue[] } {
  const parsed = careerSchema.safeParse(raw);
  if (!parsed.success) return { issues: zodIssues('career', parsed) };
  const career = parsed.data;
  const issues: Issue[] = [];

  const seen = new Set<string>();
  const collections = ['headlines', 'summaries', 'roles', 'achievements', 'projects', 'skills', 'education', 'certifications', 'publications', 'talks', 'community'] as const;
  for (const name of collections) {
    for (const record of career[name] as Array<{ id: string }>) {
      if (seen.has(record.id)) issues.push(error('duplicate-id', `career.${name}.${record.id}`, `Duplicate ID ${record.id}`));
      seen.add(record.id);
    }
  }

  const achievements = new Map(career.achievements.map((item) => [item.id, item]));
  const owner = new Map<string, string>();
  for (const role of career.roles) {
    const path = `career.roles.${role.id}`;
    if (startsAfterEnd(role.start, role.end)) issues.push(error('invalid-date-range', path, `${role.id} starts after it ends`));
    const years = [role.start.slice(0, 4), role.end === 'ongoing' ? 'Present' : role.end.slice(0, 4)];
    if (!years.every((part) => role.sourceDates.includes(part))) {
      issues.push(error('source-dates-mismatch', path, `sourceDates "${role.sourceDates}" does not match ${role.start}–${role.end}`));
    }
    for (const achievementId of role.achievementIds) {
      if (!achievements.has(achievementId)) issues.push(error('unknown-reference', path, `Unknown achievement ${achievementId}`));
      else if (owner.has(achievementId)) issues.push(error('shared-achievement', path, `${achievementId} already belongs to ${owner.get(achievementId)}`));
      else owner.set(achievementId, role.id);
    }
  }
  for (const item of career.achievements) {
    const path = `career.achievements.${item.id}`;
    if (!owner.has(item.id)) issues.push(error('orphan-achievement', path, `${item.id} belongs to no role`));
    const wordings = [item.text, ...Object.values(item.variants ?? {})];
    for (const phrase of item.metric?.phrases ?? []) {
      for (const wording of wordings) {
        if (!wording.includes(phrase)) issues.push(error('qualifier-dropped', path, `A wording of ${item.id} drops "${phrase}"`));
      }
    }
  }
  for (const record of [...career.education.map((e) => ({ ...e, name: e.institution })), ...career.certifications]) {
    if (!record.text.includes(record.name)) issues.push(error('source-text-mismatch', `career.${record.id}`, `${record.id} text does not name ${record.name}`));
  }
  return issues.some((issue) => issue.level === 'error') ? { issues } : { career, issues };
}

export function validateProfile(raw: unknown): { profile?: Profile; issues: Issue[] } {
  const parsed = profileSchema.safeParse(raw);
  return parsed.success ? { profile: parsed.data, issues: [] } : { issues: zodIssues('profile', parsed) };
}

const refId = (ref: AchievementRef) => (typeof ref === 'string' ? ref : ref.id);
const refVariant = (ref: AchievementRef) => (typeof ref === 'string' ? undefined : ref.variant);

/** Resolve a profile against a validated career record. */
export function composeResume(career: Career, profile: Profile, options: { sourceRevision?: string } = {}): ResolvedResume {
  const errors: Issue[] = [];
  const warnings: Issue[] = [];
  const roles = new Map(career.roles.map((item) => [item.id, item]));
  const achievements = new Map(career.achievements.map((item) => [item.id, item]));
  const ownerOf = new Map(career.roles.flatMap((item) => item.achievementIds.map((achievementId) => [achievementId, item.id] as const)));
  const byId = <T extends { id: string }>(items: T[]) => new Map(items.map((item) => [item.id, item]));
  const lookups = {
    projects: byId(career.projects),
    skills: byId(career.skills),
    education: byId([...career.education, ...career.certifications]),
    publications: byId(career.publications),
    talks: byId(career.talks),
    community: byId(career.community),
  };

  const headline = career.headlines.find((item) => item.id === profile.headlineId);
  const summary = career.summaries.find((item) => item.id === profile.summaryId);
  if (!headline) errors.push(error('unknown-reference', 'profile.headlineId', `Unknown headline ${profile.headlineId}`));
  if (!summary) errors.push(error('unknown-reference', 'profile.summaryId', `Unknown summary ${profile.summaryId}`));
  if (profile.status === 'draft') warnings.push(warning('draft-profile', 'profile.status', `${profile.id} is a draft fixture and must not be published`));

  const flagged = new Set<string>();
  const noteFlag = (record: { id: string; provenance?: { review: string; note?: string } }, path: string) => {
    if (record.provenance?.review === 'flagged' && !flagged.has(record.id)) {
      flagged.add(record.id);
      warnings.push(warning('flagged-for-review', path, `${record.id} is flagged for review${record.provenance.note ? `: ${record.provenance.note}` : ''}`));
    }
  };

  const usedTexts = new Map<string, string>();
  const resolveAchievement = (ref: AchievementRef, path: string, expectedRole?: string): (ResolvedItem & { achievementId: string }) | undefined => {
    const achievementId = refId(ref);
    const variant = refVariant(ref);
    const item = achievements.get(achievementId);
    if (!item) { errors.push(error('unknown-reference', path, `Unknown achievement ${achievementId}`)); return undefined; }
    if (expectedRole && ownerOf.get(achievementId) !== expectedRole) {
      errors.push(error('wrong-role', path, `${achievementId} belongs to ${ownerOf.get(achievementId)}, not ${expectedRole}`));
      return undefined;
    }
    const wording = variant ? item.variants?.[variant] : item.text;
    if (wording === undefined) { errors.push(error('unknown-variant', path, `${achievementId} has no approved "${variant}" wording`)); return undefined; }
    noteFlag(item, path);
    if (usedTexts.has(wording)) {
      warnings.push(warning('duplicate-text-suppressed', path, `${achievementId} repeats the exact text already used by ${usedTexts.get(wording)}`));
      return undefined;
    }
    usedTexts.set(wording, achievementId);
    return { id: variant ? `${achievementId}#${variant}` : achievementId, achievementId, text: wording };
  };

  const resolveRole = (role: CareerRole, items: ResolvedItem[]): ResolvedRole => ({
    id: role.id, employer: role.employer, ...(role.location ? { location: role.location } : {}),
    title: role.title, ...(role.scope ? { scope: role.scope } : {}),
    start: role.start, end: role.end, dates: role.sourceDates, ...(role.evidence ? { evidence: { ...role.evidence } } : {}), items,
  });

  const sections: ResolvedSection[] = [];
  const kinds = new Set<string>();
  for (const [index, section] of profile.sections.entries()) {
    const path = `profile.sections.${index}`;
    const title = section.title ?? DEFAULT_SECTION_TITLES[section.kind];
    if (kinds.has(section.kind)) errors.push(error('duplicate-section', path, `Section ${section.kind} appears twice`));
    kinds.add(section.kind);

    if (section.kind === 'experience') {
      const seenRoles = new Set<string>();
      const resolved: Array<[CareerRole, ResolvedItem[]]> = [];
      for (const [roleIndex, ref] of section.roles.entries()) {
        const rolePath = `${path}.roles.${roleIndex}`;
        const role = roles.get(ref.roleId);
        if (!role) { errors.push(error('unknown-reference', rolePath, `Unknown role ${ref.roleId}`)); continue; }
        if (seenRoles.has(role.id)) { errors.push(error('duplicate-reference', rolePath, `Role ${role.id} is listed twice`)); continue; }
        seenRoles.add(role.id);
        noteFlag(role, rolePath);
        const seenItems = new Set<string>();
        const items: ResolvedItem[] = [];
        for (const [itemIndex, itemRef] of ref.achievements.entries()) {
          const key = `${refId(itemRef)}#${refVariant(itemRef) ?? ''}`;
          if (seenItems.has(key)) { errors.push(error('duplicate-reference', `${rolePath}.achievements.${itemIndex}`, `${refId(itemRef)} is selected twice`)); continue; }
          seenItems.add(key);
          const item = resolveAchievement(itemRef, `${rolePath}.achievements.${itemIndex}`, role.id);
          if (item) items.push({ id: item.id, text: item.text });
        }
        resolved.push([role, items]);
      }
      // Employment is always reverse chronological, whatever order the profile lists.
      resolved.sort(([a], [b]) => compareRolesNewestFirst(a, b));
      sections.push({ kind: 'experience', title, roles: resolved.map(([role, items]) => resolveRole(role, items)) });
    } else if (section.kind === 'highlights') {
      const items = section.items
        .map((ref, itemIndex) => resolveAchievement(ref, `${path}.items.${itemIndex}`))
        .filter((item): item is ResolvedItem & { achievementId: string } => Boolean(item));
      sections.push({ kind: 'highlights', title, items });
    } else {
      const seenIds = new Set<string>();
      const picked: Array<{ id: string }> = [];
      for (const [itemIndex, recordId] of section.ids.entries()) {
        const itemPath = `${path}.ids.${itemIndex}`;
        if (seenIds.has(recordId)) { errors.push(error('duplicate-reference', itemPath, `${recordId} is listed twice`)); continue; }
        seenIds.add(recordId);
        const record = section.kind === 'earlier' ? roles.get(recordId) : lookups[section.kind].get(recordId);
        if (!record) { errors.push(error('unknown-reference', itemPath, `Unknown ${section.kind} record ${recordId}`)); continue; }
        noteFlag(record as { id: string; provenance?: { review: string; note?: string } }, itemPath);
        picked.push(record);
      }
      if (section.kind === 'earlier') {
        const earlier = (picked as CareerRole[]).slice().sort(compareRolesNewestFirst).map((role) => resolveRole(role, []));
        sections.push({ kind: 'earlier', title, roles: earlier });
      } else if (section.kind === 'projects') {
        sections.push({ kind: 'projects', title, items: (picked as Career['projects']).map(({ id, name, description, proofHref, proofLabel }) => ({ id, name, description, proofHref, proofLabel })) });
      } else if (section.kind === 'skills') {
        sections.push({ kind: 'skills', title, groups: (picked as Career['skills']).map(({ id, label, skills }) => ({ id, label, skills })) });
      } else if (section.kind === 'education') {
        sections.push({ kind: 'education', title, items: (picked as Array<{ id: string; text: string }>).map(({ id, text }) => ({ id, text })) });
      } else if (section.kind === 'community') {
        sections.push({ kind: 'community', title, items: (picked as Career['community']).map(({ id, organization, title, location, description }) => ({ id, organization, title, ...(location ? { location } : {}), description })) });
      } else {
        sections.push({ kind: section.kind, title, items: (picked as Career['publications']).map(({ id, title, venue, date, url }) => ({ id, title, ...(venue ? { venue } : {}), ...(date ? { date } : {}), ...(url ? { url } : {}) })) });
      }
    }
  }

  const content = {
    schemaVersion: SCHEMA_VERSION,
    profileId: profile.id,
    identity: { ...career.identity },
    headline: headline?.text ?? '',
    summary: summary?.text ?? '',
    page: { ...profile.page },
    sections: errors.length ? [] : sections,
  };
  return {
    profileId: profile.id,
    profileLabel: profile.label,
    profileStatus: profile.status,
    schemaVersion: SCHEMA_VERSION,
    sourceRevision: options.sourceRevision ?? 'unversioned',
    digest: createHash('sha256').update(JSON.stringify(content)).digest('hex'),
    identity: content.identity,
    headline: content.headline,
    summary: content.summary,
    page: content.page,
    sections: content.sections,
    warnings,
    errors,
  };
}
