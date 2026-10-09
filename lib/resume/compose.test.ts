import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

import { compareRolesNewestFirst, composeResume, validateCareer, validateProfile, type ResolvedResume } from './compose';
import { CAREER, PROFILES, PROFILE_IDS, resolveResume } from './index';
import type { Career, Profile } from './schema';

const rawCareer = (): Record<string, any> => JSON.parse(readFileSync(new URL('../../content/resume/career.json', import.meta.url), 'utf8'));
const rawProfile = (id: string): Record<string, any> => JSON.parse(readFileSync(new URL(`../../content/resume/profiles/${id}.json`, import.meta.url), 'utf8'));
const codes = (issues: Array<{ code: string }>) => issues.map((issue) => issue.code);

function careerWith(edit: (career: Record<string, any>) => void): ReturnType<typeof validateCareer> {
  const career = rawCareer();
  edit(career);
  return validateCareer(career);
}

function deepFreeze<T>(value: T): T {
  if (value && typeof value === 'object') {
    for (const child of Object.values(value)) deepFreeze(child);
    Object.freeze(value);
  }
  return value;
}

const section = <K extends ResolvedResume['sections'][number]['kind']>(doc: ResolvedResume, kind: K) =>
  doc.sections.find((item) => item.kind === kind) as Extract<ResolvedResume['sections'][number], { kind: K }>;

test('all four profiles resolve without errors, and only AI Builder is approved', () => {
  assert.deepEqual([...PROFILE_IDS], ['ai-builder', 'technical-program-owner', 'program-owner', 'cv']);
  for (const id of PROFILE_IDS) {
    const doc = resolveResume(id, { sourceRevision: 'test' });
    assert.equal(doc.profileId, id);
    assert.equal(doc.schemaVersion, 1);
    assert.equal(doc.sourceRevision, 'test');
    assert.match(doc.digest, /^[0-9a-f]{64}$/);
    assert.deepEqual(doc.errors, []);
    assert.equal(doc.profileStatus, id === 'ai-builder' ? 'approved' : 'draft');
    assert.equal(codes(doc.warnings).includes('draft-profile'), id !== 'ai-builder');
  }
});

test('composition is pure and deterministic', () => {
  const career = deepFreeze(structuredClone(CAREER));
  const profile = deepFreeze(structuredClone(PROFILES['cv']));
  const first = composeResume(career, profile, { sourceRevision: 'abc' });
  const second = composeResume(career, profile, { sourceRevision: 'abc' });
  assert.deepEqual(first, second);
  // The digest covers content, not the revision label.
  assert.equal(composeResume(career, profile, { sourceRevision: 'other' }).digest, first.digest);
  assert.deepEqual(career, CAREER);
});

test('one shared factual edit propagates to every edition that selects it', () => {
  const career = structuredClone(CAREER) as Career;
  const edited = career.achievements.find((item) => item.id === 'ach.gr.mvp')!;
  edited.text = 'Rescoped a delayed initiative to deliver an MVP in two months';
  for (const id of ['ai-builder', 'program-owner', 'cv'] as const) {
    const before = resolveResume(id);
    const after = composeResume(career, PROFILES[id]);
    assert.notEqual(after.digest, before.digest, id);
    const gr = section(after, 'experience').roles.find((role) => role.id === 'role.guaranteed-rate')!;
    assert(gr.items.some((item) => item.text === edited.text), id);
  }
});

test('employment stays reverse chronological whatever order a profile lists', () => {
  const profile = structuredClone(PROFILES['ai-builder']) as Profile;
  const experience = profile.sections.find((item) => item.kind === 'experience')!;
  if (experience.kind === 'experience') experience.roles.reverse();
  const doc = composeResume(CAREER, profile);
  assert.deepEqual(section(doc, 'experience').roles.map((role) => role.employer), ['ActiveCampaign', 'Allstate', 'Arity', 'WorkTango', 'Guaranteed Rate']);
  assert.deepEqual(section(resolveResume('cv'), 'experience').roles.slice(-2).map((role) => role.dates), ['2012–2015', '2009–2012']);
});

test('partial and overlapping dates follow the published ordering rule', () => {
  const roles = [
    { id: 'role.year-only', start: '2018', end: '2020' },
    { id: 'role.month', start: '2019-03', end: '2020-06' },
    { id: 'role.current', start: '2019-01', end: 'ongoing' },
    { id: 'role.overlap', start: '2017-01', end: '2020-06' },
  ];
  assert.deepEqual(roles.slice().sort(compareRolesNewestFirst).map((role) => role.id), ['role.current', 'role.month', 'role.overlap', 'role.year-only']);
});

test('dates keep their precision and never become Present silently', () => {
  assert.equal(CAREER.roles.find((role) => role.id === 'role.cha')!.start, '2012');
  assert.deepEqual(codes(careerWith((c) => { delete c.roles[0].end; }).issues), ['schema']);
  assert.deepEqual(codes(careerWith((c) => { c.roles[0].end = 'Present'; }).issues), ['schema']);
  assert.deepEqual(codes(careerWith((c) => { c.roles[0].start = '2025-13'; }).issues), ['schema']);
  assert.deepEqual(codes(careerWith((c) => { c.roles[1].start = '2026-01'; }).issues), ['invalid-date-range', 'source-dates-mismatch']);
  // Year-only start with a month-precision end in the same year is valid.
  assert.deepEqual(careerWith((c) => { c.roles[1].start = '2025'; c.roles[1].sourceDates = '2025 – 02/2025'; }).issues, []);
  assert.equal(CAREER.certifications[0].end, 'ongoing');
});

test('qualified metrics keep value, denominator, approximation and attribution in every wording', () => {
  const adoption = CAREER.achievements.find((item) => item.id === 'ach.ac.adoption')!;
  assert.deepEqual(
    { from: adoption.metric?.from, to: adoption.metric?.to, denominator: adoption.metric?.denominator, approximate: adoption.metric?.approximate, attribution: adoption.metric?.attribution },
    { from: '2%', to: '43%', denominator: 'merge requests', approximate: true, attribution: 'contributed' },
  );
  for (const wording of [adoption.text, adoption.variants!.highlight]) assert.match(wording, /^Helped raise .* roughly 2% to 43% of merge requests/);

  const loan = CAREER.achievements.find((item) => item.id === 'ach.gr.loan-tool')!;
  assert.equal(loan.metric?.attribution, 'associated');
  for (const wording of [loan.text, loan.variants!.highlight]) {
    assert.match(wording, /associated with \$1\.5B in locked loan volume/);
    assert.doesNotMatch(wording, /generated|drove|produced/);
  }

  // A wording that drops a qualifier is rejected.
  const dropped = careerWith((c) => {
    c.achievements.find((item: any) => item.id === 'ach.ac.adoption').variants.highlight = 'Raised agentic-coding adoption from 2% to 43%';
  });
  assert.equal(dropped.career, undefined);
  assert.deepEqual(codes(dropped.issues), ['qualifier-dropped', 'qualifier-dropped', 'qualifier-dropped']);
});

test('the scope-label title is kept verbatim and flagged instead of guessed', () => {
  const doc = resolveResume('ai-builder');
  assert.equal(section(doc, 'experience').roles[0].title, 'Senior Program Owner | AI Enablement & Transformation');
  assert.notEqual(doc.headline, section(doc, 'experience').roles[0].title);
  assert(doc.warnings.some((issue) => issue.code === 'flagged-for-review' && issue.message.includes('role.activecampaign')));
});

test('private notes, unknown keys and unsafe links are rejected', () => {
  assert.deepEqual(codes(careerWith((c) => { c.achievements[0].privateNotes = 'from my manager'; }).issues), ['schema']);
  assert.deepEqual(codes(careerWith((c) => { c.achievements[0].provenance.private = true; }).issues), ['schema']);
  assert.deepEqual(codes(careerWith((c) => { c.projects[0].proofHref = 'javascript:alert(1)'; }).issues), ['schema']);
  assert.deepEqual(codes(careerWith((c) => { c.projects[0].proofHref = '//evil.example'; }).issues), ['schema']);
  assert.deepEqual(codes(careerWith((c) => { c.projects[0].provenance.url = 'http://insecure.example'; }).issues), ['schema']);
  // Evidence URLs are optional: most records have none, and that is valid.
  assert(CAREER.achievements.every((item) => item.provenance.url === undefined));
});

test('career cross-references are checked', () => {
  assert.deepEqual(codes(careerWith((c) => { c.skills[1].id = c.skills[0].id; }).issues), ['duplicate-id']);
  assert.deepEqual(codes(careerWith((c) => { c.roles[0].achievementIds.push('ach.missing'); }).issues), ['unknown-reference']);
  assert.deepEqual(codes(careerWith((c) => { c.roles[1].achievementIds.push('ach.ac.devin'); }).issues), ['shared-achievement']);
  assert.deepEqual(codes(careerWith((c) => { c.roles[0].achievementIds.pop(); }).issues), ['orphan-achievement']);
});

test('profiles cannot override employment facts or reference what does not exist', () => {
  const profile = rawProfile('ai-builder');
  profile.sections[0].roles[0].title = 'VP of AI';
  assert.deepEqual(codes(validateProfile(profile).issues), ['schema']);
  const withText = rawProfile('ai-builder');
  withText.sections[0].roles[0].achievements[0] = { id: 'ach.ac.adoption', text: 'Single-handedly drove adoption to 43%' };
  assert.deepEqual(codes(validateProfile(withText).issues), ['schema']);
  assert.deepEqual(codes(validateProfile({ ...rawProfile('ai-builder'), id: 'cto' }).issues), ['schema']);

  const compose = (edit: (p: Record<string, any>) => void) => {
    const raw = rawProfile('ai-builder');
    edit(raw);
    return codes(composeResume(CAREER, validateProfile(raw).profile!).errors);
  };
  assert.deepEqual(compose((p) => { p.sections[0].roles[0].achievements.push('ach.missing'); }), ['unknown-reference']);
  assert.deepEqual(compose((p) => { p.sections[0].roles[0].achievements.push('ach.arity.planning'); }), ['wrong-role']);
  assert.deepEqual(compose((p) => { p.sections[0].roles[0].achievements.push({ id: 'ach.ac.enablement', variant: 'highlight' }); }), ['unknown-variant']);
  assert.deepEqual(compose((p) => { p.sections[0].roles[0].achievements.push('ach.ac.devin'); }), ['duplicate-reference']);
  assert.deepEqual(compose((p) => { p.sections[0].roles.push({ roleId: 'role.arity', achievements: [] }); }), ['duplicate-reference']);
  assert.deepEqual(compose((p) => { p.sections[3].ids.push('skills.missing'); }), ['unknown-reference']);
  assert.deepEqual(compose((p) => { p.sections.push({ kind: 'skills', ids: [] }); }), ['duplicate-section']);
  assert.deepEqual(compose((p) => { p.headlineId = 'headline.missing'; }), ['unknown-reference']);
  // A profile with errors resolves to no sections at all, never a partial document.
  const raw = rawProfile('ai-builder');
  raw.summaryId = 'summary.missing';
  assert.deepEqual(composeResume(CAREER, validateProfile(raw).profile!).sections, []);
});

test('exact duplicate text is suppressed, while highlight/detail pairs remain', () => {
  const tpo = resolveResume('technical-program-owner');
  assert(section(tpo, 'highlights').items.some((item) => item.achievementId === 'ach.ac.adoption'));
  // The roadshow's highlight wording is identical to its detail wording.
  const profile = structuredClone(PROFILES['technical-program-owner']) as Profile;
  const highlights = profile.sections.find((item) => item.kind === 'highlights')!;
  if (highlights.kind === 'highlights') highlights.items.push({ id: 'ach.ac.roadshow', variant: 'highlight' }, 'ach.ac.roadshow');
  const doc = composeResume(CAREER, profile);
  assert.deepEqual(doc.errors, []);
  assert.equal(section(doc, 'highlights').items.filter((item) => item.achievementId === 'ach.ac.roadshow').length, 1);
  assert(doc.warnings.some((issue) => issue.code === 'duplicate-text-suppressed'));
  // Adoption appears as a highlight and, in other profiles, as a detail bullet with different text.
  const adoption = CAREER.achievements.find((item) => item.id === 'ach.ac.adoption')!;
  assert.notEqual(adoption.text, adoption.variants!.highlight);
});

test('no content is truncated: the full CV carries every achievement and skill group', () => {
  const doc = resolveResume('cv');
  const items = section(doc, 'experience').roles.flatMap((role) => role.items.map((item) => item.id));
  assert.deepEqual(items.slice().sort(), CAREER.achievements.map((item) => item.id).sort());
  assert.equal(section(doc, 'skills').groups.length, CAREER.skills.length);
  assert.deepEqual(section(doc, 'publications').items, []);
  assert.deepEqual(section(doc, 'talks').items, []);
});

test('the published example matches what the compiler produces', () => {
  const example = JSON.parse(readFileSync(new URL('../../docs/resume-document-example.json', import.meta.url), 'utf8'));
  assert.deepEqual(example, resolveResume('ai-builder', { sourceRevision: 'example' }));
});
