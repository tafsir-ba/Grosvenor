import { test, expect } from "@playwright/test";
import {
    BASE_URL,
    WRITE_ACTIONS,
    PRODUCTION_CONFIRMED,
    QA_LEAD_MESSAGE,
    qaLeadEmail,
} from "./helpers/routes";
import { attachFailureListeners } from "./helpers/smokeFailures";

const canRunWrite =
    WRITE_ACTIONS && PRODUCTION_CONFIRMED;

test.describe("Production write-action smoke (explicit opt-in)", () => {
    test.skip(
        !canRunWrite,
        "Requires SMOKE_WRITE_ACTIONS=true and SMOKE_PRODUCTION_CONFIRMED=true"
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

    test("submits a tagged QA lead on the contact form", async ({ page }) => {
        const email = qaLeadEmail();

        await page.goto("/contact");
        await expect(page.getByRole("heading", { name: /Let's talk/i })).toBeVisible();

        await page.getByTestId("tab-general").click();
        await page.getByLabel("First name").fill("QA");
        await page.getByLabel("Last name").fill("Smoke");
        await page.getByLabel("Email").fill(email);
        await page.getByLabel("Message").fill(QA_LEAD_MESSAGE);
        await page.getByTestId("general-consent").click();
        await page.getByRole("button", { name: /Send Message/i }).click();

        await expect(page.getByText(/Thank you/i)).toBeVisible({ timeout: 30_000 });
    });
});
