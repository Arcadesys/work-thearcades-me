import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { DEFAULT_EDITION, isPublishedEdition, publishedEditions, resumeMetadata } from '@/lib/resume/editions';
import { resolveResume } from '@/lib/resume/index';

import { ResumeDocument } from '../resume-document';

// Only approved editions other than the default are prerendered. Drafts,
// unknown IDs and any other path segment are a real 404.
export const dynamicParams = false;

export function generateStaticParams() {
  return publishedEditions().filter((id) => id !== DEFAULT_EDITION).map((profile) => ({ profile }));
}

export async function generateMetadata({ params }: PageProps<'/resume/[profile]'>): Promise<Metadata> {
  const { profile } = await params;
  return isPublishedEdition(profile) && profile !== DEFAULT_EDITION ? resumeMetadata(resolveResume(profile)) : {};
}

export default async function ResumeEditionPage({ params }: PageProps<'/resume/[profile]'>) {
  const { profile } = await params;
  if (!isPublishedEdition(profile) || profile === DEFAULT_EDITION) notFound();
  return <ResumeDocument doc={resolveResume(profile)} />;
}
