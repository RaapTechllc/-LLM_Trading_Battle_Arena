import { defineConfig, devices } from '@playwright/test';

const isProduction = process.env.TEST_ENV === 'production';
const baseURL = isProduction 
  ? process.env.PRODUCTION_URL || 'https://battlecard-arena.vercel.app'
  : 'http://localhost:3030';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? 'github' : 'html',
  use: {
    baseURL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    // Add production-specific project
    ...(isProduction ? [{
      name: 'production-firefox',
      use: { ...devices['Desktop Firefox'] },
    }] : []),
  ],

  // Only start local server for local testing
  ...(isProduction ? {} : {
    webServer: {
      command: 'npm run dev',
      url: 'http://localhost:3030',
      reuseExistingServer: !process.env.CI,
      timeout: 120 * 1000,
    },
  }),
});
