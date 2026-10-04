/**
 * Print one resolved résumé edition as JSON (#48).
 *
 *   npm run resume:compile -- ai-builder
 *   npm run resume:compile -- cv --revision "$(git rev-parse HEAD)"
 */
import { PROFILE_IDS, resolveResume, type ProfileId } from '../lib/resume/index';

const [profileId = 'ai-builder', ...rest] = process.argv.slice(2);
if (!(PROFILE_IDS as readonly string[]).includes(profileId)) {
  console.error(`Unknown profile "${profileId}". Use one of: ${PROFILE_IDS.join(', ')}`);
  process.exit(2);
}
const revisionFlag = rest.indexOf('--revision');
const sourceRevision = revisionFlag >= 0 ? rest[revisionFlag + 1] : undefined;
const resolved = resolveResume(profileId as ProfileId, { sourceRevision });
for (const issue of resolved.warnings) console.error(`warning ${issue.code} ${issue.path}: ${issue.message}`);
console.log(JSON.stringify(resolved, null, 2));
