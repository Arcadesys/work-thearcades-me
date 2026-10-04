/**
 * List the editions that include each record ID (#53).
 *
 *   npm run resume:impact -- ach.gr.loan-tool role.arity
 */
import { editionsUsing } from '../lib/resume/impact';
import { PROFILES } from '../lib/resume/index';

const ids = process.argv.slice(2);
if (!ids.length) {
  console.error('Usage: npm run resume:impact -- <record-id> [...]');
  process.exit(2);
}
for (const id of ids) {
  const editions = editionsUsing(id);
  console.log(`${id}: ${editions.length ? editions.map((edition) => `${edition} (${PROFILES[edition].status})`).join(', ') : 'no edition uses this record'}`);
}
