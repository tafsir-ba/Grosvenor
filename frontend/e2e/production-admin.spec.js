import { test, expect } from "@playwright/test";
import {
    BASE_URL,
    RUN_ADMIN,
    ADMIN_EMAIL,
    ADMIN_PASSWORD,
} from "./helpers/routes";
import { attachFailureListeners } from "./helpers/smokeFailures";
import { loginAdmin } from "./helpers/adminAuth";

test.describe("Production admin smoke (opt-in)", () => {
    test.skip(!RUN_ADMIN, "Set SMOKE_RUN_ADMIN=true to run admin smoke tests");
    test.skip(
        !ADMIN_EMAIL || !ADMIN_PASSWORD,
        "Set SMOKE_ADMIN_EMAIL and SMOKE_ADMIN_PASSWORD to run admin smoke tests"
    );

    let failures;

    test.beforeEach(async ({ page }) => {
        failures = attachFailureListeners(page, {
            onWarn: (msg) => console.warn("[smoke warn]", msg),
        });
    });

    test.afterEach(async () => {
        failures?.assertNoCriticalFailures();
    });

    test("admin can log in and view dashboard", async ({ page }) => {
        await loginAdmin(page, {
            email: ADMIN_EMAIL,
            password: ADMIN_PASSWORD,
            baseUrl: BASE_URL,
        });
        await expect(page.getByTestId("admin-dashboard")).toBeVisible();
        await expect(page.getByRole("heading", { name: /Dashboard/i })).toBeVisible();
    });

    test("admin can open units and leads (read-only)", async ({ page }) => {
        await loginAdmin(page, {
            email: ADMIN_EMAIL,
            password: ADMIN_PASSWORD,
            baseUrl: BASE_URL,
        });

        await page.getByRole("link", { name: /^Units$/i }).click();
        await expect(page).toHaveURL(/\/admin\/units/);

        await page.getByRole("link", { name: /^Leads$/i }).click();
        await expect(page).toHaveURL(/\/admin\/leads/);
    });
});
