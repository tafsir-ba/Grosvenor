/** Shared env and route helpers for production smoke tests. */

export const BASE_URL = (
    process.env.SMOKE_BASE_URL ||
    process.env.PLAYWRIGHT_BASE_URL ||
    "https://grosvenorvistas.com"
).replace(/\/$/, "");

export const API_URL = (
    process.env.SMOKE_API_URL || `${BASE_URL}/api`
).replace(/\/$/, "");

/** Admin smoke is opt-in only — public smoke stays read-only by default. */
export const RUN_ADMIN = process.env.SMOKE_RUN_ADMIN === "true";

/** Write-action smoke requires explicit double confirmation. */
export const WRITE_ACTIONS = process.env.SMOKE_WRITE_ACTIONS === "true";
export const PRODUCTION_CONFIRMED = process.env.SMOKE_PRODUCTION_CONFIRMED === "true";

export const ADMIN_EMAIL = process.env.SMOKE_ADMIN_EMAIL;
export const ADMIN_PASSWORD = process.env.SMOKE_ADMIN_PASSWORD;

export function qaLeadEmail() {
    return `qa+grosvenor-smoke-${Date.now()}@example.com`;
}

export const QA_LEAD_MESSAGE = "Automated production smoke test. Safe to delete.";
