import { renderOgImage, ogImageContentType, ogImageSize } from '@/lib/og';

export const alt = 'Career Coach in a Bottle: The Layoff Triage Skill';
export const size = ogImageSize;
export const contentType = ogImageContentType;

export default function Image() {
  return renderOgImage({ kicker: 'Free download', title: 'Career Coach in a Bottle' });
}
