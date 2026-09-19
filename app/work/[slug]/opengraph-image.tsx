import { caseStudies, caseStudyBySlug, site } from '@/lib/content';
import { renderOgImage, ogImageContentType, ogImageSize } from '@/lib/og';

export const dynamicParams = false;
export const alt = 'Austen Tucker-Crowder case study';
export const size = ogImageSize;
export const contentType = ogImageContentType;

export function generateStaticParams() {
  return caseStudies.map((study) => ({ slug: study.slug }));
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const study = caseStudyBySlug(slug);
  return renderOgImage({
    kicker: 'Case study',
    // The HTML metadata retains the full author-qualified title. The card uses
    // the study title alone so the longest case study still leaves room for its mark.
    title: study?.title ?? site.name,
  });
}
