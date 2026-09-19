import { renderOgImage, ogImageContentType, ogImageSize } from '@/lib/og';
import { RESUME_PROFILE } from '@/lib/resume';

export const alt = 'Résumé — Austen Tucker-Crowder';
export const size = ogImageSize;
export const contentType = ogImageContentType;

export default function Image() {
  return renderOgImage({ kicker: 'Résumé', title: RESUME_PROFILE.name });
}
