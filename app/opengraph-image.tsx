import { renderOgImage, ogImageContentType, ogImageSize } from '@/lib/og';

export const alt = 'Austen Tucker-Crowder — Hands-on AI builder';
export const size = ogImageSize;
export const contentType = ogImageContentType;

export default function Image() {
  return renderOgImage({
    kicker: 'Hands-on AI builder',
    title: 'I turn ideas into working systems.',
  });
}
