# AGENTS.md

## Cursor Cloud specific instructions

### Product
Grosvenor Vistas — a real-estate marketing site + lead-capture app. Two components in one repo:
- `backend/` — FastAPI API (all routes under `/api`), MongoDB via Motor. Entry: `server:app`.
- `frontend/` — React (CRA + CRACO) SPA. Public marketing pages + an `/admin` panel.

See `memory/ARCHITECTURE.md` and `memory/PRD.md` for domain details (Units, Leads, Downloads).

### Services (all three required to run the product end to end)
| Service | Start command | Notes |
|---|---|---|
| MongoDB | `mongod --dbpath /data/db --bind_ip 127.0.0.1 --port 27017` | Installed via apt (mongodb-org 8). No systemd in this VM, so start `mongod` manually (e.g. in tmux). `/data/db` already exists. |
| Backend API | `cd backend && . .venv/bin/activate && uvicorn server:app --host 0.0.0.0 --port 8001 --reload` | Dev command. On startup it creates indexes and seeds the admin user + 43 units from `units.csv`. |
| Frontend | `cd frontend && yarn start` | Dev server on port 3000. |

Standard scripts live in `frontend/package.json` (`start`, `build`, `test`) and `backend/requirements.txt`.

### Required env files (gitignored — not in the repo)
The app will not run without these. They persist in the VM snapshot but recreate them if missing:

`backend/.env`:
```
ENVIRONMENT=development
MONGO_URL=mongodb://127.0.0.1:27017
DB_NAME=grosvenor_dev
JWT_SECRET=dev-local-jwt-secret-not-for-production
ADMIN_EMAIL=admin@grosvenorvistas.com
ADMIN_PASSWORD=admin123
ADMIN_NAME=Admin
CORS_ORIGINS=*
EMAIL_ENABLED=false
CRM_SYNC_ENABLED=false
```

`frontend/.env`:
```
REACT_APP_BACKEND_URL=http://localhost:8001
```
`REACT_APP_BACKEND_URL` is read at dev-server start / build time; restart `yarn start` after changing it. Keep it in sync with the backend port.

### Gotchas
- `backend/core/config.py` / `core/db.py` read env at import time: missing `JWT_SECRET`, `MONGO_URL`, or `DB_NAME` crashes the app immediately. `ENVIRONMENT=production` additionally enforces a strong `ADMIN_PASSWORD` and explicit `CORS_ORIGINS` (no `*`).
- Admin login: `admin@grosvenorvistas.com` / `admin123` (from `ADMIN_*`, re-seeded on every startup).
- Email (Resend) and CRM sync are optional and disabled by default; the app logs a warning and runs fine without them.

### Lint / test / build
- Backend tests: `cd backend && . .venv/bin/activate && python -m pytest`.
  - Unit tests need no server. The integration tests in `tests/test_grosvenor_api.py` require the API running and `REACT_APP_BACKEND_URL` set (env or `frontend/.env`), plus `ADMIN_EMAIL`/`ADMIN_PASSWORD` matching the running server, e.g.:
    `REACT_APP_BACKEND_URL=http://localhost:8001 ADMIN_PASSWORD=admin123 python -m pytest`
  - Known pre-existing quirk: running the whole `test_grosvenor_api.py` at once, `TestAuthRefresh::test_refresh_requires_cookie` and `TestAdmin::test_floorplan_requires_auth` fail because the shared session-scoped `session` fixture keeps the login cookie from `admin_token`. They pass when run in isolation. Not an environment issue.
- Frontend: no standalone lint script — ESLint runs through the build. Use `yarn build` (CRACO forces `CI=false`, so warnings don't fail the build) or `yarn start`.
