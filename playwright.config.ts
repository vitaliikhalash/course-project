import { loadEnvConfig } from '@next/env';
import { defineConfig, devices } from '@playwright/test';

loadEnvConfig(process.cwd());

export default defineConfig({
  testDir: 'src/tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:3000',
    trace: 'retain-on-failure',
    video: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'setup',
      testMatch: /.*(?:[.-]setup)\.ts/,
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'guest',
      testIgnore: [
        /.*(?:[.-]setup)\.ts/,
        /.*(?:[.-]user)\.spec\.ts/,
        /.*(?:[.-]admin)\.spec\.ts/,
        /.*(?:[.-]owner)\.spec\.ts/,
      ],
      use: { ...devices['Desktop Chrome'] },
      dependencies: ['setup'],
    },
    {
      name: 'user',
      testMatch: /.*(?:[.-]user)\.spec\.ts/,
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'src/tests/e2e/.auth/user.json',
      },
      dependencies: ['setup'],
    },
    {
      name: 'admin',
      testMatch: /.*(?:[.-]admin)\.spec\.ts/,
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'src/tests/e2e/.auth/admin.json',
      },
      dependencies: ['setup'],
    },
    {
      name: 'owner',
      testMatch: /.*(?:[.-]owner)\.spec\.ts/,
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'src/tests/e2e/.auth/owner.json',
      },
      dependencies: ['setup'],
    },
  ],
});
