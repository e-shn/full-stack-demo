import { defineConfig } from '@playwright/test';

const baseURL = process.env.BASE_URL || 'http://localhost:3000';

export default defineConfig({
  testDir: './tests',
  fullyParallel: false,
  workers: 4,
  reporter: [['html']],
  webServer: process.env.CI ? undefined : {
    command: 'npm run start',
    url: `${baseURL}/health`,
    reuseExistingServer: true,
    timeout: 60_000,
  },
  use: {
    baseURL,
    trace: 'on-first-retry',  // E10: view with `npx playwright show-trace`
    // headless: false,       // uncomment to watch tests run in the browser
  },
});
