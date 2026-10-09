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
  outputFileTracingIncludes: {
    '/api/jobs/drafting/pdf': ['./assets/fonts/*.ttf'],
  },
};

export default nextConfig;
