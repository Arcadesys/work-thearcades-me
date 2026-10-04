import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import { cpSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';

import {
  COMPAT_PDF_PATH, MANIFEST_PATH, PUBLIC_DIR,
  absoluteLink, artifactBaseName, checkArtifacts, documentFacts, missingFacts, pdfToText, renderPlainText, sha256,
} from './artifacts';
import { PROFILE_IDS, resolveResume } from './index';

const hasRenderer = spawnSync(process.env.PYTHON ?? 'python3', ['-c', 'import reportlab']).status === 0;
const hasPdfToText = spawnSync('pdftotext', ['-v']).error === undefined;

test('committed artifacts match the current career record', async () => {
  const { problems } = await checkArtifacts();
  assert.deepEqual(problems, []);
});

test('artifact names are descriptive and allowlisted', () => {
  assert.deepEqual(PROFILE_IDS.map((id) => artifactBaseName(id, 'Austen Tucker-Crowder')), [
    'Austen-Tucker-Crowder-AI-Builder',
    'Austen-Tucker-Crowder-Technical-Program-Owner',
    'Austen-Tucker-Crowder-Program-Owner',
    'Austen-Tucker-Crowder-CV',
  ]);
  assert.throws(() => artifactBaseName('../../etc/passwd' as never, 'x'));
});

test('links leave the renderer only as https or mailto', () => {
  assert.equal(absoluteLink('/engineering', 'https://work.thearcades.me'), 'https://work.thearcades.me/engineering');
  assert.equal(absoluteLink('mailto:a@b.co', 'https://x'), 'mailto:a@b.co');
  for (const bad of ['javascript:alert(1)', 'http://insecure.example', '//evil.example', 'data:text/html,hi']) {
    assert.throws(() => absoluteLink(bad, 'https://work.thearcades.me'), bad);
  }
});

test('plain text keeps reading order, every fact, Unicode, and omits empty sections', () => {
  for (const id of PROFILE_IDS) {
    const doc = resolveResume(id);
    const text = renderPlainText(doc);
    for (const fact of documentFacts(doc)) assert(text.includes(fact), `${id} text missing "${fact}"`);
    const headings = doc.sections.map((section) => section.title).filter((heading) => text.includes(`\n${heading}\n`));
    assert.deepEqual(headings, [...headings].sort((a, b) => text.indexOf(`\n${a}\n`) - text.indexOf(`\n${b}\n`)), `${id} section order`);
  }
  const cv = renderPlainText(resolveResume('cv'));
  assert(!cv.includes('\nPublications\n') && !cv.includes('\nTalks & Training\n'), 'empty optional sections are omitted');
  assert(cv.includes('06/2025–09/2026'), 'en dash preserved');
  assert(cv.includes('ActiveCampaign — Senior Program Owner'));
});

test('the check catches stale, tampered, and unpublished artifacts', async () => {
  const root = mkdtempSync(join(tmpdir(), 'resume-check-'));
  try {
    const copy = () => {
      rmSync(join(root, 'public'), { recursive: true, force: true });
      mkdirSync(join(root, PUBLIC_DIR), { recursive: true });
      cpSync(PUBLIC_DIR, join(root, PUBLIC_DIR), { recursive: true });
      cpSync(COMPAT_PDF_PATH, join(root, COMPAT_PDF_PATH));
    };
    const manifest = JSON.parse(readFileSync(MANIFEST_PATH, 'utf8'));
    const textPath = manifest.editions[0].text.path;

    copy();
    assert.deepEqual((await checkArtifacts(root)).problems, []);

    writeFileSync(join(root, textPath), readFileSync(textPath, 'utf8').replace('Helped raise', 'Single-handedly raised'));
    assert.match((await checkArtifacts(root)).problems.join('\n'), /does not match its manifest hash[\s\S]*is stale/);

    copy();
    writeFileSync(join(root, COMPAT_PDF_PATH), 'not the current PDF');
    assert.match((await checkArtifacts(root)).problems.join('\n'), /public\/resume\.pdf is not the current ai-builder PDF/);

    copy();
    writeFileSync(join(root, PUBLIC_DIR, 'Austen-Tucker-Crowder-CV.pdf'), 'draft');
    assert.match((await checkArtifacts(root)).problems.join('\n'), /Unexpected file public\/resume\/Austen-Tucker-Crowder-CV\.pdf/);

    copy();
    manifest.editions[0].contentDigest = '0'.repeat(64);
    writeFileSync(join(root, MANIFEST_PATH), JSON.stringify(manifest));
    assert.match((await checkArtifacts(root)).problems.join('\n'), /content changed since the artifacts were built/);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test('PDF text parity reports missing facts', { skip: !hasPdfToText && 'pdftotext not installed' }, () => {
  const doc = resolveResume('ai-builder');
  const manifest = JSON.parse(readFileSync(MANIFEST_PATH, 'utf8'));
  const extracted = pdfToText(manifest.editions[0].pdf.path)!;
  assert.deepEqual(missingFacts(doc, extracted), []);
  assert.deepEqual(missingFacts(doc, extracted.replace('Langfuse evaluation', 'evaluation')).length, 1);
});

test('the PDF renderer escapes markup, keeps Unicode, drops empty sections, and refuses unsafe links', { skip: !(hasRenderer && hasPdfToText) && 'reportlab or pdftotext not installed' }, () => {
  const dir = mkdtempSync(join(tmpdir(), 'resume-render-'));
  try {
    const doc = structuredClone(resolveResume('cv')) as ReturnType<typeof resolveResume>;
    doc.summary = 'Tags stay text: <b>bold</b> <script>alert(1)</script> & “quotes” — done…';
    const input = join(dir, 'doc.json');
    const output = join(dir, 'doc.pdf');
    writeFileSync(input, JSON.stringify(doc));
    execFileSync(process.env.PYTHON ?? 'python3', ['scripts/generate-resume-pdf.py', input, output]);
    const text = pdfToText(output)!;
    assert(text.replace(/\s+/g, ' ').includes('Tags stay text: <b>bold</b> <script>alert(1)</script> & “quotes” — done…'));
    assert(!/Publications|Talks & Training/.test(text));

    const projects = doc.sections.find((section) => section.kind === 'projects');
    if (projects?.kind === 'projects') projects.items[0].proofHref = 'javascript:alert(1)';
    writeFileSync(input, JSON.stringify(doc));
    const unsafe = spawnSync(process.env.PYTHON ?? 'python3', ['scripts/generate-resume-pdf.py', input, join(dir, 'unsafe.pdf')], { encoding: 'utf8' });
    assert.notEqual(unsafe.status, 0);
    assert.match(unsafe.stderr, /Refusing unsafe link/);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('a failed build exits non-zero and leaves published artifacts untouched', () => {
  const before = [MANIFEST_PATH, COMPAT_PDF_PATH].map((path) => sha256(readFileSync(path)));
  const result = spawnSync(process.execPath, ['--import', 'tsx', 'scripts/resume-build.ts', 'ai-builder'], {
    encoding: 'utf8', env: { ...process.env, PYTHON: '/bin/false' },
  });
  assert.equal(result.status, 1, result.stderr);
  assert.match(result.stderr, /Nothing was published/);
  assert.deepEqual([MANIFEST_PATH, COMPAT_PDF_PATH].map((path) => sha256(readFileSync(path))), before);
});

test('unsupported profiles are rejected before anything runs', () => {
  const result = spawnSync(process.execPath, ['--import', 'tsx', 'scripts/resume-build.ts', '../secrets'], { encoding: 'utf8' });
  assert.equal(result.status, 2);
  assert.match(result.stderr, /Unknown profile/);
});
