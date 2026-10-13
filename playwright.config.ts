import { defineConfig } from '@playwright/test';
import path from 'node:path';

const outputDir = path.join(process.env.TMPDIR ?? '/tmp', 'work-thearcades-playwright');

export default defineConfig({
  testDir: './tests/browser',
  testMatch: '**/*.spec.ts',
  outputDir,
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  reporter: 'line',
  use: {
    baseURL: 'http://127.0.0.1:3100',
    browserName: 'chromium',
    trace: 'off',
  },
  projects: [
    { name: 'chromium-mobile-320', use: { viewport: { width: 320, height: 720 } } },
    { name: 'chromium-mobile-390', use: { viewport: { width: 390, height: 844 } } },
    { name: 'chromium-desktop', use: { viewport: { width: 1440, height: 960 } } },
  ],
  webServer: {
    command: 'npm run dev -- --hostname 127.0.0.1 --port 3100',
    url: 'http://127.0.0.1:3100/engineering',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
