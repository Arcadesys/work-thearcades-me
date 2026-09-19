import { renderOgImage, ogImageContentType, ogImageSize } from '@/lib/og';

export const alt = 'Austen Tucker-Crowder — AI engineering and enablement';
export const size = ogImageSize;
export const contentType = ogImageContentType;

export default function Image() {
  return renderOgImage({
    kicker: 'AI engineering & enablement',
    title: 'Build the first useful version',
  });
}
