import { ImageResponse } from 'next/og';

export const ogImageSize = { width: 1200, height: 630 };
export const ogImageContentType = 'image/png';

/**
 * Shared card for every page's social preview: same mark, same palette, same
 * layout, so a post shared cold on LinkedIn or Slack always reads as this
 * site rather than a bare link. Kept to system fonts — no font file to load
 * at build time, and Satori renders them fine at these weights.
 */
export function renderOgImage({ kicker, title }: { kicker: string; title: string }) {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '76px',
          background: '#0a0a14',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div
            style={{
              width: 30,
              height: 30,
              borderRadius: 999,
              background: 'linear-gradient(135deg, #ff8a00, #ff3cac)',
              display: 'flex',
            }}
          />
          <div style={{ display: 'flex', fontSize: 26, fontWeight: 700, letterSpacing: 2, color: '#e8e8ec', textTransform: 'uppercase' }}>
            The Arcades
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 28, maxWidth: 1000 }}>
          <div style={{ display: 'flex', fontSize: 24, fontWeight: 600, letterSpacing: 3, color: '#ff8a00', textTransform: 'uppercase' }}>
            {kicker}
          </div>
          <div style={{ display: 'flex', fontSize: 62, fontWeight: 700, lineHeight: 1.15, color: '#e8e8ec' }}>
            {title}
          </div>
        </div>
        <div style={{ display: 'flex', fontSize: 24, color: '#9a9ab0' }}>work.thearcades.me</div>
      </div>
    ),
    ogImageSize,
  );
}
