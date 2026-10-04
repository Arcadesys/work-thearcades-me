import type { Metadata } from 'next';

import { DEFAULT_EDITION, resumeMetadata } from '@/lib/resume/editions';
import { resolveResume } from '@/lib/resume/index';

import { ResumeDocument } from './resume-document';

// /resume is the AI Builder edition and its canonical URL; /resume/ai-builder
// redirects here so the default edition has exactly one address.
const doc = resolveResume(DEFAULT_EDITION);

export const metadata: Metadata = resumeMetadata(doc);

export default function ResumePage() {
  return <ResumeDocument doc={doc} />;
}
