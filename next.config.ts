import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  env: { NEXT_PUBLIC_VERCEL_ENV: process.env.VERCEL_ENV ?? 'development' },
  turbopack: {
    root: __dirname,
  },
  // Toy and Lab art moved from www.thearcades.me lives in its Vercel Blob store.
  images: {
    remotePatterns: [{ protocol: 'https', hostname: '*.public.blob.vercel-storage.com' }],
  },
  // The default résumé edition has one address: /resume (#50).
  async redirects() {
    return [{ source: '/resume/ai-builder', destination: '/resume', permanent: true }];
  },
  async rewrites() {
    return [
      ...['message-in-a-bottle', 'message-in-a-bottle-module'].map(slug => ({
        source: `/campaigns/${slug}`,
        destination: `/campaigns/${slug}/index.html`,
      })),
      // Static builder demos moved from www.thearcades.me (Nov 2026).
      { source: '/heinlein', destination: '/heinlein/index.html' },
      { source: '/reaction-stickers', destination: '/reaction-stickers/index.html' },
    ];
  },
};

export default nextConfig;
