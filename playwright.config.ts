import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: 'e2e/specs',
  timeout: 120_000,
  retries: 0,
  workers: 1,
  fullyParallel: false,
  reporter: [['list']],
  use: {
    baseURL: 'http://localhost:8080',
    trace: 'on-first-retry',
    testIdAttribute: 'data-test'
  },
  webServer: {
    command: 'npm --prefix web-ui run serve',
    url: 'http://localhost:8080',
    reuseExistingServer: true,
    timeout: 120_000
  },
  globalSetup: require.resolve('./e2e/global-setup')
});
