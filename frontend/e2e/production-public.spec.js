import { test, expect } from "@playwright/test";
import { BASE_URL } from "./helpers/routes";
import { attachFailureListeners } from "./helpers/smokeFailures";

test.describe("Production public smoke (read-only)", () => {
    let failures;

    test.beforeEach(async ({ page }) => {
        failures = attachFailureListeners(page, {
            onWarn: (msg) => console.warn("[smoke warn]", msg),
        });
    });

    test.afterEach(async () => {
        failures?.assertNoCriticalFailures();
    });

    test("homepage renders hero and primary navigation", async ({ page }) => {
        await page.goto("/");
        await expect(page.getByRole("heading", { level: 1, name: /Elevate Your View/i })).toBeVisible();
        await expect(page.getByRole("link", { name: /Book a Visit/i }).first()).toBeVisible();
        await expect(page.getByRole("link", { name: /Explore Residences/i }).first()).toBeVisible();
    });

    test("residences list loads and opens first available unit detail", async ({ page }) => {
        await page.goto("/residences");
        await expect(page.getByRole("heading", { name: /Find your space/i })).toBeVisible();

        const count = page.getByTestId("residence-count");
        await expect(count).not.toHaveText(/Loading/i, { timeout: 45_000 });

        const firstUnit = page.locator('[data-testid^="unit-card-"]').first();
        await expect(firstUnit).toBeVisible({ timeout: 45_000 });

        const testId = await firstUnit.getAttribute("data-testid");
        const slug = testId?.replace("unit-card-", "") || "";
        expect(slug.length).toBeGreaterThan(0);

        await firstUnit.click();
        await expect(page).toHaveURL(new RegExp(`/residences/${slug.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`));
        await expect(page.getByTestId("unit-detail-page")).toBeVisible();
        await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    });

    test("key marketing pages respond without errors", async ({ page }) => {
        const pages = [
            { path: "/the-development", heading: /Grosvenor Vistas/i },
            { path: "/amenities", heading: /Live well/i },
            { path: "/mortgage", heading: /Financing made simple/i },
            { path: "/faq", heading: /Good to know/i },
            { path: "/contact", heading: /Let's talk/i },
        ];

        for (const entry of pages) {
            await page.goto(entry.path, { waitUntil: "domcontentloaded" });
            await expect(page.getByRole("heading", { name: entry.heading }).first()).toBeVisible();
        }
    });

    test("public API-backed content endpoints are reachable from the browser", async ({ page }) => {
        await page.goto("/faq");
        await expect(page.getByTestId("faq-accordion")).toBeVisible({ timeout: 30_000 });
        await expect(page.getByRole("button", { name: /Where is Grosvenor Vistas/i })).toBeVisible();
    });
});
