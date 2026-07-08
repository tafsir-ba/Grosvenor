// @ts-check
const { defineConfig, devices } = require("@playwright/test");

const baseURL = (
    process.env.SMOKE_BASE_URL ||
    process.env.PLAYWRIGHT_BASE_URL ||
    "https://grosvenorvistas.com"
).replace(/\/$/, "");

/** @type {import('@playwright/test').PlaywrightTestConfig} */
module.exports = defineConfig({
    testDir: "./e2e",
    timeout: 90_000,
    expect: { timeout: 20_000 },
    fullyParallel: false,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 1 : 0,
    workers: 1,
    reporter: [
        ["list"],
        ["html", { open: "never", outputFolder: "playwright-report" }],
    ],
    use: {
        baseURL,
        trace: "on-first-retry",
        screenshot: "only-on-failure",
        video: "off",
    },
    projects: [
        {
            name: "chromium-desktop",
            use: { ...devices["Desktop Chrome"] },
        },
        {
            name: "webkit-mobile",
            use: { ...devices["iPhone 13"] },
        },
    ],
});
