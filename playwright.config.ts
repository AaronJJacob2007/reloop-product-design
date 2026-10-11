import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "./tests/browser",
  timeout: 30000,
  fullyParallel: false,
  workers: 1,
  reporter: "list",
  use: {
    baseURL: process.env.RELOOP_BASE_URL || "http://127.0.0.1:4173",
    headless: true,
    channel: "msedge",
    viewport: { width: 1440, height: 1000 },
  },
  outputDir: "test-results/browser",
});
