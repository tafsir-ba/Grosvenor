import { test, expect } from "@playwright/test";

const MOCK_LEAD = {
    _id: "lead-mock-001",
    first_name: "Jane",
    last_name: "Buyer",
    email: "jane.buyer@example.com",
    phone: "+18761234567",
    message: "This is a long enquiry message that should appear in full inside the lead detail drawer without being truncated in the UI.",
    consent: true,
    project: "Grosvenor Vistas",
    lead_type: "general_contact",
    status: "new",
    notes: "",
    source_page: "/contact",
    source_url: "https://example.com/contact",
    source_unit: "A101",
    source_building: "Heliconia",
    collection: "Signature Residences",
    crm_synced: false,
    crm_reference: null,
    created_at: "2026-07-09T10:00:00",
    updated_at: "2026-07-09T10:00:00",
};

async function seedAdminSession(page) {
    await page.addInitScript(() => {
        localStorage.setItem("gv_admin_token", "playwright-test-token");
    });
    await page.route("**/api/auth/me", (route) =>
        route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify({ email: "admin@test.com", role: "admin" }),
        }),
    );
}

test.describe("Admin leads UI (mocked API)", () => {
    test.beforeEach(async ({ page }) => {
        await seedAdminSession(page);
    });

    test("shows error state with retry when leads API fails", async ({ page }) => {
        await page.route("**/api/admin/leads**", (route) =>
            route.fulfill({ status: 500, body: "Server error" }),
        );

        await page.goto("/admin/leads");
        await expect(page.getByTestId("leads-error")).toBeVisible();
        await expect(page.getByTestId("leads-retry")).toBeVisible();
        await expect(page.getByText("No leads yet.")).not.toBeVisible();
    });

    test("opens detail sheet with full message on row click", async ({ page }) => {
        await page.route("**/api/admin/leads**", (route) =>
            route.fulfill({
                status: 200,
                contentType: "application/json",
                body: JSON.stringify({
                    items: [MOCK_LEAD],
                    total: 1,
                    limit: 50,
                    offset: 0,
                }),
            }),
        );

        await page.goto("/admin/leads");
        await expect(page.getByTestId("lead-row-lead-mock-001")).toBeVisible();
        await page.getByTestId("lead-row-lead-mock-001").click();
        await expect(page.getByTestId("lead-detail-sheet")).toBeVisible();
        await expect(page.getByText(MOCK_LEAD.message)).toBeVisible();
    });

    test("saves notes via PATCH and updates UI", async ({ page }) => {
        let patchedNotes = "";

        await page.route("**/api/admin/leads**", async (route) => {
            const method = route.request().method();
            if (method === "GET") {
                return route.fulfill({
                    status: 200,
                    contentType: "application/json",
                    body: JSON.stringify({
                        items: [{ ...MOCK_LEAD, notes: patchedNotes }],
                        total: 1,
                        limit: 50,
                        offset: 0,
                    }),
                });
            }
            if (method === "PATCH") {
                const body = await route.request().postDataJSON();
                patchedNotes = body.notes;
                return route.fulfill({
                    status: 200,
                    contentType: "application/json",
                    body: JSON.stringify({ ...MOCK_LEAD, notes: patchedNotes }),
                });
            }
            return route.abort();
        });

        await page.goto("/admin/leads");
        await page.getByTestId("lead-row-lead-mock-001").click();
        await page.getByTestId("lead-detail-notes").fill("Call back on Monday");

        const patchPromise = page.waitForRequest((req) =>
            req.method() === "PATCH" && req.url().includes("/api/admin/leads/lead-mock-001"),
        );
        await page.getByTestId("lead-detail-notes-save").click();
        await patchPromise;
        await expect(page.getByTestId("lead-detail-notes")).toHaveValue("Call back on Monday");
    });

    test("status change sends PATCH while select is busy", async ({ page }) => {
        await page.route("**/api/admin/leads**", async (route) => {
            const method = route.request().method();
            if (method === "GET") {
                return route.fulfill({
                    status: 200,
                    contentType: "application/json",
                    body: JSON.stringify({
                        items: [MOCK_LEAD],
                        total: 1,
                        limit: 50,
                        offset: 0,
                    }),
                });
            }
            if (method === "PATCH") {
                await new Promise((r) => setTimeout(r, 800));
                const body = await route.request().postDataJSON();
                return route.fulfill({
                    status: 200,
                    contentType: "application/json",
                    body: JSON.stringify({ ...MOCK_LEAD, ...body }),
                });
            }
            return route.abort();
        });

        await page.goto("/admin/leads");
        await page.getByTestId("lead-status-lead-mock-001").click();
        const patchRequest = page.waitForRequest((req) =>
            req.method() === "PATCH" && req.url().includes("/api/admin/leads/lead-mock-001"),
        );
        await page.getByRole("option", { name: "Contacted" }).click();
        const request = await patchRequest;
        expect(await request.postDataJSON()).toMatchObject({ status: "contacted" });
    });

    test("table remains scrollable at 1366x768", async ({ page }) => {
        await page.setViewportSize({ width: 1366, height: 768 });
        const items = Array.from({ length: 50 }, (_, i) => ({
            ...MOCK_LEAD,
            _id: `lead-mock-${i}`,
            email: `lead${i}@example.com`,
        }));

        await page.route("**/api/admin/leads**", (route) =>
            route.fulfill({
                status: 200,
                contentType: "application/json",
                body: JSON.stringify({ items, total: 50, limit: 50, offset: 0 }),
            }),
        );

        await page.goto("/admin/leads");
        await expect(page.getByTestId("leads-table-wrap")).toBeVisible();
        const canScroll = await page.evaluate(() => {
            const tableWrap = document.querySelector('[data-testid="leads-table-wrap"]');
            return !!(tableWrap && tableWrap.scrollHeight > tableWrap.clientHeight);
        });
        expect(canScroll).toBeTruthy();
    });
});

test.describe("Brochure download UX (mocked API)", () => {
    test("FAB brochure submit opens returned file URL", async ({ page }) => {
        await page.addInitScript(() => {
            window.__openedUrls = [];
            window.open = (url) => {
                window.__openedUrls.push(url);
                const popup = {
                    closed: false,
                    location: {
                        set href(next) {
                            window.__openedUrls.push(next);
                            this._href = next;
                        },
                        get href() {
                            return this._href || "";
                        },
                    },
                };
                return popup;
            };
        });

        await page.route("**/api/downloads", (route) =>
            route.fulfill({
                status: 200,
                contentType: "application/json",
                body: JSON.stringify([
                    {
                        _id: "brochure-1",
                        type: "brochure",
                        title: "Brochure",
                        file_url: "/downloads/brochure.pdf",
                    },
                ]),
            }),
        );

        await page.route("**/api/downloads/brochure-1/access", (route) =>
            route.fulfill({
                status: 200,
                contentType: "application/json",
                body: JSON.stringify({
                    file_url: "/downloads/brochure.pdf",
                    title: "Brochure",
                }),
            }),
        );

        await page.goto("/");
        await page.getByTestId("fab-toggle").click();
        await page.getByTestId("fab-brochure").click();
        await page.getByTestId("fab-brochure-first-name").fill("Test");
        await page.getByTestId("fab-brochure-last-name").fill("User");
        await page.getByTestId("fab-brochure-email").fill("test@example.com");
        await page.getByTestId("fab-brochure-consent").click();
        await page.getByTestId("fab-brochure-submit").click();

        await expect(page.getByText("Your brochure is opening in a new tab.")).toBeVisible({ timeout: 10_000 });

        const opened = await page.evaluate(() => window.__openedUrls);
        expect(opened.some((url) => String(url).includes("brochure.pdf"))).toBeTruthy();
    });
});
