import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  env: { NEXT_PUBLIC_VERCEL_ENV: process.env.VERCEL_ENV ?? 'development' },
  turbopack: {
    root: __dirname,
  },
  // The default résumé edition has one address: /resume (#50).
  async redirects() {
    return [{ source: '/resume/ai-builder', destination: '/resume', permanent: true }];
  },
  async rewrites() {
    return ['message-in-a-bottle', 'message-in-a-bottle-module'].map(slug => ({
      source: `/campaigns/${slug}`,
      destination: `/campaigns/${slug}/index.html`,
    }));
  },
  outputFileTracingIncludes: {
    '/api/jobs/drafting/pdf': ['./assets/fonts/*.ttf'],
  },
};

export default nextConfig;
