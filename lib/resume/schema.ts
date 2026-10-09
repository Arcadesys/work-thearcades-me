/**
 * Career record and editorial profile schemas (#48).
 *
 * Every object is strict: unknown keys fail validation. That is how private
 * notes stay out of public content and how profiles are kept from overriding
 * employment facts. Schema checks are structural; they are not fact-checking.
 */
import { z } from 'zod';

export const SCHEMA_VERSION = 1;

export const PROFILE_IDS = ['ai-builder', 'technical-program-owner', 'program-owner', 'cv'] as const;
export type ProfileId = (typeof PROFILE_IDS)[number];

const id = z.string().regex(/^[a-z][a-z0-9-]*(\.[a-z0-9-]+)+$/, 'IDs are dotted lowercase, e.g. role.arity');
const text = z.string().trim().min(1);

/** A year (`2015`) or year and month (`2015-11`). Precision is never invented. */
export const partialDate = z.string().regex(/^(19[5-9]\d|20\d\d)(-(0[1-9]|1[0-2]))?$/, 'Use YYYY or YYYY-MM');
/** An end date, or the literal `ongoing`, which is the explicit approval of current status. */
const endDate = z.union([partialDate, z.literal('ongoing')]);

/** https URLs, mailto links, or site-relative paths. Anything else is unsafe. */
export const safeLink = z.string().refine(
  (value) => /^https:\/\/[^\s]+$/.test(value) || /^mailto:[^\s@]+@[^\s@]+$/.test(value) || /^\/(?!\/)[^\s]*$/.test(value),
  'Links must be https:, mailto:, or a site-relative path',
);

const provenance = z.strictObject({
  source: text,
  review: z.enum(['unreviewed', 'reviewed', 'flagged']),
  url: safeLink.optional(),
  note: text.optional(),
});

const metric = z.strictObject({
  from: text.optional(),
  to: text,
  denominator: text,
  approximate: z.boolean(),
  /** led: the person drove it; contributed: shared credit; associated: an outcome tied to the work, not caused by the person. */
  attribution: z.enum(['led', 'contributed', 'associated']),
  qualifiers: z.array(text),
  /** Phrases every wording of the claim must keep, so qualifiers cannot be edited away. */
  phrases: z.array(text).min(1),
});

const role = z.strictObject({
  id,
  employer: text,
  location: text.optional(),
  /** Employment title as stated by the source. Positioning lives in headlines. */
  title: text,
  /** Optional explanatory scope, kept apart from the title. */
  scope: text.optional(),
  start: partialDate,
  end: endDate,
  /** Source wording of the dates, kept verbatim for display parity. */
  sourceDates: text,
  tier: z.enum(['primary', 'earlier']).default('primary'),
  /** Optional public evidence for the role as a whole, such as a case study. */
  evidence: z.strictObject({ href: safeLink, label: text }).optional(),
  achievementIds: z.array(id),
  provenance,
});

const achievement = z.strictObject({
  id,
  text,
  /** Approved alternative wordings, chosen by profiles by name. */
  variants: z.record(z.string().regex(/^[a-z][a-z-]*$/), text).optional(),
  metric: metric.optional(),
  provenance,
});

export const careerSchema = z.strictObject({
  schemaVersion: z.literal(SCHEMA_VERSION),
  identity: z.strictObject({
    name: text,
    location: text,
    email: z.email(),
    site: text,
    siteUrl: safeLink,
    github: text,
    githubUrl: safeLink,
  }),
  headlines: z.array(z.strictObject({ id, text, provenance })).min(1),
  summaries: z.array(z.strictObject({ id, text, provenance })).min(1),
  roles: z.array(role).min(1),
  achievements: z.array(achievement),
  projects: z.array(z.strictObject({ id, name: text, description: text, proofHref: safeLink, proofLabel: text, provenance })),
  skills: z.array(z.strictObject({ id, label: text, skills: text })),
  education: z.array(z.strictObject({ id, text, institution: text, start: partialDate.optional(), end: endDate.optional(), provenance })),
  certifications: z.array(z.strictObject({ id, text, name: text, start: partialDate.optional(), end: endDate.optional(), provenance })),
  publications: z.array(z.strictObject({ id, title: text, venue: text.optional(), date: partialDate.optional(), url: safeLink.optional(), provenance })),
  talks: z.array(z.strictObject({ id, title: text, venue: text.optional(), date: partialDate.optional(), url: safeLink.optional(), provenance })),
  community: z.array(z.strictObject({ id, organization: text, title: text, location: text.optional(), description: text, provenance })),
});

export type Career = z.infer<typeof careerSchema>;
export type CareerRole = Career['roles'][number];
export type CareerAchievement = Career['achievements'][number];

/** A selected achievement: a bare ID uses the default wording; an object names an approved variant. */
const achievementRef = z.union([id, z.strictObject({ id, variant: z.string().regex(/^[a-z][a-z-]*$/) })]);

/** An optional heading override; every renderer uses the resolved heading. */
const title = text.max(60).optional();
const idList = <K extends string>(kind: K) => z.strictObject({ kind: z.literal(kind), title, ids: z.array(id) });

export const profileSchema = z.strictObject({
  id: z.enum(PROFILE_IDS),
  label: text,
  /** draft profiles are fixtures awaiting editorial review; only approved ones are published. */
  status: z.enum(['draft', 'approved']),
  headlineId: id,
  summaryId: id,
  /** Edition-specific page copy: meta description and the contact call to action. */
  page: z.strictObject({ description: text.max(200), cta: text.max(60), pitch: text }),
  sections: z.array(z.discriminatedUnion('kind', [
    z.strictObject({
      kind: z.literal('experience'),
      title,
      // A role reference may only select achievements. Titles, dates, and
      // employers are immutable facts of the career record.
      roles: z.array(z.strictObject({ roleId: id, achievements: z.array(achievementRef) })),
    }),
    z.strictObject({ kind: z.literal('highlights'), title, items: z.array(achievementRef) }),
    idList('earlier'),
    idList('projects'),
    idList('skills'),
    idList('education'),
    idList('publications'),
    idList('talks'),
    idList('community'),
  ])).min(1),
});

export type Profile = z.infer<typeof profileSchema>;
export type AchievementRef = z.infer<typeof achievementRef>;
