/** Console/network failure filtering for production smoke tests. */

const ANALYTICS_PATTERN =
    /google-analytics|googletagmanager|doubleclick|facebook\.com|hotjar|segment\.io|clarity\.ms/i;

const FAIL_RESOURCE_TYPES = new Set(["document", "script", "stylesheet", "fetch", "xhr"]);

const WARN_ONLY_RESOURCE_TYPES = new Set(["image", "font", "media", "other"]);

function isAnalyticsUrl(url) {
    return ANALYTICS_PATTERN.test(url);
}

/**
 * Attach listeners that collect critical vs warning-only failures.
 * Returns helpers to assert at the end of each test.
 */
export function attachFailureListeners(page, { onWarn } = {}) {
    const critical = [];
    const warnings = [];

    const warn = (message) => {
        warnings.push(message);
        if (onWarn) onWarn(message);
    };

    page.on("pageerror", (error) => {
        critical.push(`pageerror: ${error.message}`);
    });

    page.on("console", (msg) => {
        if (msg.type() === "error") {
            const text = msg.text();
            if (isAnalyticsUrl(text)) {
                warn(`console error (analytics): ${text}`);
                return;
            }
            critical.push(`console error: ${text}`);
        }
    });

    page.on("requestfailed", (request) => {
        const type = request.resourceType();
        const url = request.url();
        const failure = request.failure()?.errorText || "unknown";

        // In-flight API calls are cancelled when Playwright navigates away.
        if (
            (type === "fetch" || type === "xhr") &&
            failure.includes("ERR_ABORTED")
        ) {
            return;
        }

        if (WARN_ONLY_RESOURCE_TYPES.has(type)) {
            warn(`${type} failed: ${url} (${failure})`);
            return;
        }

        if (isAnalyticsUrl(url)) {
            warn(`analytics request failed: ${url} (${failure})`);
            return;
        }

        if (FAIL_RESOURCE_TYPES.has(type)) {
            critical.push(`${type} failed: ${url} (${failure})`);
            return;
        }

        warn(`${type} failed: ${url} (${failure})`);
    });

    page.on("response", (response) => {
        const request = response.request();
        const type = request.resourceType();
        const url = response.url();

        if (response.ok()) return;
        if (WARN_ONLY_RESOURCE_TYPES.has(type)) return;
        if (isAnalyticsUrl(url)) {
            warn(`analytics HTTP ${response.status()}: ${url}`);
            return;
        }
        if (type === "fetch" || type === "xhr") {
            critical.push(`HTTP ${response.status()} on ${url}`);
        }
    });

    return {
        assertNoCriticalFailures() {
            if (critical.length) {
                throw new Error(`Smoke critical failures:\n${critical.join("\n")}`);
            }
        },
        getCritical: () => [...critical],
        getWarnings: () => [...warnings],
    };
}
