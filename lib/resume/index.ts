/**
 * Loads the public career record and the four editorial profiles, validating
 * them at import time. Invalid content throws, so it fails tests and the build
 * instead of shipping.
 */
import careerJson from '../../content/resume/career.json';
import aiBuilder from '../../content/resume/profiles/ai-builder.json';
import cv from '../../content/resume/profiles/cv.json';
import programOwner from '../../content/resume/profiles/program-owner.json';
import technicalProgramOwner from '../../content/resume/profiles/technical-program-owner.json';

import { composeResume, validateCareer, validateProfile, type Issue, type ResolvedResume } from './compose';
import { PROFILE_IDS, type Career, type Profile, type ProfileId } from './schema';

function fail(what: string, issues: Issue[]): never {
  throw new Error(`Invalid ${what}:\n${issues.map((issue) => `  ${issue.path}: ${issue.message}`).join('\n')}`);
}

function loadCareer(): Career {
  const { career, issues } = validateCareer(careerJson);
  return career ?? fail('content/resume/career.json', issues);
}

function loadProfile(raw: unknown, expected: ProfileId): Profile {
  const { profile, issues } = validateProfile(raw);
  if (!profile) fail(`content/resume/profiles/${expected}.json`, issues);
  if (profile.id !== expected) fail(`content/resume/profiles/${expected}.json`, [{ level: 'error', code: 'profile-id', path: 'profile.id', message: `id ${profile.id} does not match the file name` }]);
  return profile;
}

export const CAREER: Career = loadCareer();

export const PROFILES: Record<ProfileId, Profile> = {
  'ai-builder': loadProfile(aiBuilder, 'ai-builder'),
  'technical-program-owner': loadProfile(technicalProgramOwner, 'technical-program-owner'),
  'program-owner': loadProfile(programOwner, 'program-owner'),
  cv: loadProfile(cv, 'cv'),
};

export const DEFAULT_PROFILE_ID: ProfileId = 'ai-builder';

/** Resolve one edition. Throws if the profile has broken references. */
export function resolveResume(profileId: ProfileId, options: { sourceRevision?: string } = {}): ResolvedResume {
  const resolved = composeResume(CAREER, PROFILES[profileId], options);
  if (resolved.errors.length) fail(`profile ${profileId}`, resolved.errors);
  return resolved;
}

export { PROFILE_IDS };
export type { ProfileId, ResolvedResume };
