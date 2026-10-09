import { pictureGuide } from '@/lib/guides';
import { renderOgImage, ogImageContentType, ogImageSize } from '@/lib/og';

export const alt = `${pictureGuide.title} — Austen Tucker-Crowder`;
export const size = ogImageSize;
export const contentType = ogImageContentType;

export default function Image() {
  return renderOgImage({ kicker: 'Practical image guide', title: pictureGuide.title });
}
