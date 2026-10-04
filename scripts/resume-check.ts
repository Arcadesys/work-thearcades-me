/**
 * Verify committed résumé artifacts against the current career record (#51).
 * Needs no Python: run in CI and before deploys. `--require-pdf-text` makes a
 * missing pdftotext an error instead of a note.
 */
import { checkArtifacts } from '../lib/resume/artifacts';

checkArtifacts(process.cwd(), { requirePdfText: process.argv.includes('--require-pdf-text') }).then(({ problems, notes }) => {
  for (const note of notes) console.log(`note  ${note}`);
  for (const problem of problems) console.error(`error ${problem}`);
  console.log(problems.length ? `\n${problems.length} problem(s). Run npm run resume:build, review, and commit.` : 'Résumé artifacts are current.');
  process.exitCode = problems.length ? 1 : 0;
});
