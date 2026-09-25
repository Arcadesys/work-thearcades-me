import { renderOgImage, ogImageContentType, ogImageSize } from '@/lib/og';

export const alt = 'Austen Tucker-Crowder — AI enablement leader who builds';
export const size = ogImageSize;
export const contentType = ogImageContentType;

export default function Image() {
  return renderOgImage({
    kicker: 'AI enablement leader who builds',
    title: 'Adoption you can measure. Tools you can inspect.',
  });
}
