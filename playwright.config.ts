import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  outputDir: "./e2e/test-results",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: "html",
  use: {
    baseURL: "http://localhost:5173",
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  globalSetup: "./e2e/global-setup.ts",
  globalTeardown: "./e2e/global-teardown.ts",
  webServer: [
    {
      command: "bun run dev",
      url: "http://127.0.0.1:3001/api/health",
      cwd: "./backend",
      env: { NODE_ENV: "test" },
      reuseExistingServer: false,
    },
    {
      command: "bun run dev",
      url: "http://localhost:5173",
      cwd: "./frontend",
      env: { BACKEND_PORT: "3001" },
      reuseExistingServer: false,
    },
  ],
});
