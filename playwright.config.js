import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  workers: 2,
  timeout: 30000,
  use: {
    baseURL: "http://127.0.0.1:4173",
    browserName: "chromium",
    launchOptions: process.env.BBP_CHROMIUM_PATH
      ? {
          executablePath: process.env.BBP_CHROMIUM_PATH,
          args: [
            "--no-sandbox",
            "--disable-gpu",
            "--disable-software-rasterizer",
          ],
        }
      : {},
    trace: "off",
    screenshot: "off",
    video: "off",
  },
  reporter: "list",
  webServer: {
    command: "npm run preview -- --port 4173 --strictPort",
    url: "http://127.0.0.1:4173",
    reuseExistingServer: false,
    timeout: 30000,
  },
});
