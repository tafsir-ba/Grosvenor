# Production smoke tests

Read-only Playwright checks against the live Grosvenor Vistas site (default: `https://grosvenorvistas.com`). Admin login and write actions are **opt-in only**.

## Install

From `frontend/`:

```bash
yarn install
yarn playwright:install --with-deps
```

For CI/Linux runners that only need Chromium:

```bash
npx playwright install --with-deps chromium
```

Browser binaries may already exist on a developer machine; use `yarn playwright:install` when tests fail with a missing-browser error.

## Environment variables

| Variable | Required | Default | Purpose |
|----------|----------|---------|---------|
| `SMOKE_BASE_URL` | No | `https://grosvenorvistas.com` | Site origin for browser tests |
| `SMOKE_API_URL` | No | `{SMOKE_BASE_URL}/api` | API origin for read-only API smoke |
| `SMOKE_RUN_ADMIN` | For admin smoke | unset (`false`) | Set to `true` to run admin login tests |
| `SMOKE_ADMIN_EMAIL` | For admin smoke | — | Admin email (never commit) |
| `SMOKE_ADMIN_PASSWORD` | For admin smoke | — | Admin password (never commit) |
| `SMOKE_WRITE_ACTIONS` | For write smoke | unset (`false`) | Set to `true` to allow form submissions |
| `SMOKE_PRODUCTION_CONFIRMED` | For write smoke | unset (`false`) | Second confirmation for production writes |

**Never commit credentials, traces, or reports containing secrets.**

## Scripts

| Command | What it runs |
|---------|----------------|
| `yarn smoke:production` | Public read-only smoke (Chromium desktop) |
| `yarn smoke:production:quick` | Same as above (alias) |
| `yarn smoke:production:headed` | Public smoke with visible browser |
| `yarn smoke:production:api` | Read-only API smoke |
| `yarn smoke:production:admin` | Admin login + read-only admin pages (`SMOKE_RUN_ADMIN=true`) |
| `yarn smoke:production:write` | Tagged QA lead submission (requires both write flags) |
| `yarn smoke:production:full` | All specs, all Playwright projects (desktop + mobile) |

### Examples

**Default public smoke (recommended for CI):**

```bash
yarn smoke:production
```

**Admin smoke (credentials via env — do not commit):**

```bash
SMOKE_RUN_ADMIN=true \
SMOKE_ADMIN_EMAIL="admin@grosvenorvistas.com" \
SMOKE_ADMIN_PASSWORD="<password>" \
yarn smoke:production:admin
```

**Write-action smoke (creates a real lead tagged for cleanup):**

```bash
SMOKE_WRITE_ACTIONS=true \
SMOKE_PRODUCTION_CONFIRMED=true \
yarn smoke:production:write
```

Write tests use emails like `qa+grosvenor-smoke-<timestamp>@example.com` and the message `Automated production smoke test. Safe to delete.` **Do not auto-delete production data** unless explicitly approved; remove QA leads manually in admin when needed.

**Against a staging URL:**

```bash
SMOKE_BASE_URL="https://staging.example.com" yarn smoke:production
```

## Suite layout

```text
frontend/e2e/
  helpers/
    routes.js          # URLs + env flags
    smokeFailures.js   # Critical vs warning-only network/console failures
    adminAuth.js       # Shared admin login helper
  production-public.spec.js   # Read-only public journeys (default)
  production-admin.spec.js    # Opt-in admin login/navigation
  production-write.spec.js    # Opt-in tagged lead submission
  production-api.spec.js      # Read-only API checks
```

## Failure policy

The suite **fails** on document/script/stylesheet/XHR/fetch failures and page exceptions.

It **warns but does not fail** on optional asset issues (images, fonts, media) and common analytics/tracking hosts.

## Selectors

Tests prefer user-visible roles and labels (`getByRole`, `getByLabel`). `data-testid` is used only where it is stable and already present in the app (e.g. `unit-card-*`, `unit-detail-page`, `admin-dashboard`).

Unit detail navigation discovers the first visible unit card on `/residences` instead of hardcoding a slug.
