import { caseStudies, caseStudyBySlug, site } from '@/lib/content';
import { notFound } from 'next/navigation';
import { renderOgImage, ogImageContentType, ogImageSize } from '@/lib/og';
import { SOCIAL_CARD_ID, socialCardAlt } from '@/lib/site-metadata';

export function generateStaticParams() {
  return caseStudies.map((study) => ({ slug: study.slug }));
}

// One card per study. generateImageMetadata lets its alt text name the study.
export function generateImageMetadata({ params }: { params: { slug: string } }) {
  const study = caseStudyBySlug(params.slug);
  return [{
    id: SOCIAL_CARD_ID,
    alt: socialCardAlt('Case study', study?.title ?? site.name),
    size: ogImageSize,
    contentType: ogImageContentType,
  }];
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const study = caseStudyBySlug(slug);
  if (!study) notFound();
  return renderOgImage({
    kicker: 'Case study',
    // The HTML metadata retains the full author-qualified title. The card uses
    // the study title alone so the longest case study still leaves room for its mark.
    title: study.title,
  });
}
