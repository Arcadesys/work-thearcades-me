/**
 * Which editions a record change affects (#53). Used by the editorial workflow
 * to present every affected edition before proposing a change.
 */
import { PROFILE_IDS, PROFILES, resolveResume, type ProfileId } from './index';

/** Editions whose resolved document includes the record, in profile order. */
export function editionsUsing(recordId: string): ProfileId[] {
  if (recordId === 'identity' || recordId.startsWith('identity.')) return [...PROFILE_IDS];
  return PROFILE_IDS.filter((id) => {
    const profile = PROFILES[id];
    if (profile.headlineId === recordId || profile.summaryId === recordId) return true;
    const doc = resolveResume(id);
    return doc.sections.some((section) => {
      const records: Array<{ id: string; achievementId?: string; items?: Array<{ id: string }> }> =
        'roles' in section ? section.roles : 'groups' in section ? section.groups : section.items;
      return records.some((record) => record.id === recordId || record.achievementId === recordId
        || record.id.startsWith(`${recordId}#`)
        || record.items?.some((item) => item.id === recordId || item.id.startsWith(`${recordId}#`)));
    });
  });
}
