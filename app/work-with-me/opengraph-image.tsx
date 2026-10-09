import { workWithMe } from '@/lib/content';
import { renderOgImage, ogImageContentType, ogImageSize } from '@/lib/og';

export const alt = 'Build the first useful version — Austen Tucker-Crowder';
export const size = ogImageSize;
export const contentType = ogImageContentType;

export default function Image() {
  return renderOgImage({ kicker: 'Work with Austen', title: workWithMe.title });
}
