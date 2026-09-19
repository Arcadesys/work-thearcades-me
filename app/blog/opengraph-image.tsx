import { renderOgImage, ogImageContentType, ogImageSize } from '@/lib/og';

export const alt = 'Build logs and essays about AI, engineering, and making useful things.';
export const size = ogImageSize;
export const contentType = ogImageContentType;

export default function Image() {
  return renderOgImage({ kicker: 'Build logs & essays', title: 'AI engineering, accessibility, and useful things' });
}
