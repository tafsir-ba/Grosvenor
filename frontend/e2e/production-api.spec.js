import { test, expect } from "@playwright/test";
import { API_URL } from "./helpers/routes";

test.describe("Production API smoke (read-only)", () => {
    test("GET /api health", async ({ request }) => {
        const response = await request.get(`${API_URL}/`);
        expect(response.ok()).toBeTruthy();
        const body = await response.json();
        expect(body.status).toBe("ok");
    });

    test("GET /api/units returns inventory", async ({ request }) => {
        const response = await request.get(`${API_URL}/units`);
        expect(response.ok()).toBeTruthy();
        const units = await response.json();
        expect(Array.isArray(units)).toBeTruthy();
        expect(units.length).toBeGreaterThan(0);
        expect(units[0]).toHaveProperty("slug");
    });

    test("GET /api/content/faq and /api/content/amenities", async ({ request }) => {
        const faq = await request.get(`${API_URL}/content/faq`);
        expect(faq.ok()).toBeTruthy();
        const faqItems = await faq.json();
        expect(faqItems.length).toBeGreaterThan(0);
        expect(faqItems[0]).toHaveProperty("q");

        const amenities = await request.get(`${API_URL}/content/amenities`);
        expect(amenities.ok()).toBeTruthy();
        const categories = await amenities.json();
        expect(categories.length).toBeGreaterThan(0);
        expect(categories[0]).toHaveProperty("items");
    });

    test("GET /api/downloads metadata", async ({ request }) => {
        const response = await request.get(`${API_URL}/downloads`);
        expect(response.ok()).toBeTruthy();
        const downloads = await response.json();
        expect(Array.isArray(downloads)).toBeTruthy();
    });
});
