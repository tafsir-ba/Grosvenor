import { expect } from "@playwright/test";

/** Log into the admin area using env-provided credentials (never committed). */
export async function loginAdmin(page, { email, password, baseUrl }) {
    await page.goto(`${baseUrl}/admin/login`);
    await page.getByLabel("Email").fill(email);
    await page.getByLabel("Password").fill(password);
    await page.getByRole("button", { name: /Sign In/i }).click();
    await expect(page.getByRole("heading", { name: /Dashboard/i })).toBeVisible({ timeout: 30_000 });
}
