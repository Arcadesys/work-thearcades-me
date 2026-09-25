import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  env: { NEXT_PUBLIC_VERCEL_ENV: process.env.VERCEL_ENV ?? 'development' },
  turbopack: {
    root: __dirname,
  },
  outputFileTracingIncludes: {
    '/api/jobs/drafting/pdf': ['./assets/fonts/*.ttf'],
  },
};

export default nextConfig;
