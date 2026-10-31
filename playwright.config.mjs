import { test, expect } from "@playwright/test";
export default {
  testDir: "./tests",
  timeout: 60000,
  workers: 1,
  use: {
    baseURL: "http://127.0.0.1:3012",
    headless: true,
    launchOptions: { channel: "chrome" },
    viewport: { width: 1440, height: 1000 },
  },
  reporter: [["list"], ["html", { open: "never" }]],
};
