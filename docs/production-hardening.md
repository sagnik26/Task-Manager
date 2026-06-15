# Production Hardening — TaskFlow

Checklist to move from MVP ([deployment guide](./deployment.md)) to production-grade. Security and config first, then reliability and ops.

> **Baseline:** Vercel + hosted Express + managed Postgres ([README architecture](../README.md#-architecture)). These items fix **config, security defaults, and operability** — not the deploy model.

RBAC stays server-side ([RBAC guide](./rbac-implementation-guide.md)); do not weaken `authorize(...)` checks.

---

## Summary checklist

| # | Area | Priority | Status |
| - | ---- | -------- | ------ |
| 1 | [Proxy misconfiguration guard](#1-proxy-misconfiguration-guard) | **High** | ☐ |
| 2 | [Resilient Vercel middleware](#2-resilient-vercel-middleware) | **High** | ☐ |
| 3 | [Explicit cookie policy](#3-explicit-cookie-policy) | **High** | ☐ |
| 4 | [Restrict CORS origins](#4-restrict-cors-origins) | **High** | ☐ |
| 5 | [Rate limiting on auth and API](#5-rate-limiting-on-auth-and-api) | **High** | ☐ |
| 7 | [Migration and deploy pipeline](#7-migration-and-deploy-pipeline) | **Medium** | ☐ |
| 8 | [Observability and alerting](#8-observability-and-alerting) | **Medium** | ☐ |
| 9 | [Database backups and recovery](#9-database-backups-and-recovery) | **Medium** | ☐ |

---

## 1. Proxy misconfiguration guard

**Problem:** Missing `BACKEND_PROXY_URL` on Vercel falls through to `vercel.json` placeholder `YOUR_BACKEND_URL` — SPA loads, API fails silently.

**Changes (pick one or combine):**
- **A (recommended):** In `frontend/middleware.ts`, return `502` JSON if `BACKEND_PROXY_URL` is unset in production.
- **B:** Remove `/api` rewrite from `frontend/vercel.json`; rely on middleware only.
- **C:** CI fails deploy if `BACKEND_PROXY_URL` is missing or `vercel.json` still has the placeholder.

**Verify:** Without env → visible failure on `/api/health`. With env → backend JSON.

---

## 2. Resilient Vercel middleware

**Problem:** `frontend/middleware.ts` has no timeout, error handling, or logging — backend outages produce opaque failures.

**Changes:**
- `try/catch` on `fetch` → `502` JSON when backend unreachable
- Timeout via `AbortSignal.timeout` (10–30s)
- Log failures (method, path, status, latency)
- Forward `X-Forwarded-For` / `X-Forwarded-Proto` optionally; strip sensitive hop-by-hop headers

**Verify:** Backend down → `502` JSON. Backend up → proxy works without redeploy.

---

## 3. Explicit cookie policy

**Problem:** Auth cookies in `auth.controller.ts` set `httpOnly`/`secure` but no explicit `sameSite`.

**Changes:**
1. Add `sameSite` to `config.cookie` (`'lax'` for `/api` proxy; `'none'` only for direct cross-origin API).
2. Use in both `setAuthCookie` and `clearAuthCookie` (matching options).
3. Document in `backend/.env.example` (e.g. `COOKIE_SAME_SITE=lax`).

**Verify:** Cookie shows `HttpOnly`, `Secure`, `SameSite`; logout clears with same attrs.

---

## 4. Restrict CORS origins

**Problem:** `cors({ origin: true })` in `backend/src/app.ts` reflects any `Origin` — risky if API is exposed directly.

**Changes:**
1. Add `CORS_ORIGIN(S)` to config and `.env.example`.
2. Replace `origin: true` with allowlist (e.g. `['https://your-app.vercel.app']`).
3. Keep `origin: true` in local dev only.

**Verify:** Allowed origin works; random origin blocked (direct API mode).

---

## 5. Rate limiting on auth and API

**Problem:** No limits on login, register, or API — brute-force and abuse risk.

**Changes:**
1. Add `rateLimit.ts` with **auth limiter** (10–20 / 15 min on login/register) and **API limiter** (100–300 / 15 min).
2. Wire in `auth.routes.ts` and `backend/src/app.ts`.
3. Return `429` with consistent error shape.
4. Use Redis store if multiple instances.

**Verify:** Burst login → `429`. Normal use unaffected.

---

## 7. Migration and deploy pipeline

**Problem:** Migrations run ad hoc via `npm run migrate && npm start` — not repeatable or observable in prod.

**Changes:**
1. Always `npm run migrate` in deploy; no manual SQL in prod.
2. Run migrations **before** traffic switch (pre-deploy / release command).
3. Forward-only in prod; test `migrate:down` in staging only.
4. No `seed.sql` in prod (`RUN_SEED=0`).
5. Optional CI: `build && migrate` against throwaway DB on PR.

**Verify:** New migration applies once; re-deploy same version is no-op.

---

## 8. Observability and alerting

**Problem:** Winston logs exist but no health checks, alerts, or error tracking playbook.

**Changes:**
| Layer | Action |
| ----- | ------ |
| Backend | Health check on `GET /health` |
| Frontend | Synthetic cron on `/` + `/api/health` |
| Logs | Ship to host or Axiom/Datadog/etc. |
| Errors | Sentry on backend (optional frontend) |
| Alerts | Health failure, 5xx spike, DB errors |

**Verify:** Backend stop → alert fires. 500 → appears in error tracker.

---

## 9. Database backups and recovery

**Problem:** Managed Postgres assumed ([deployment.md](./deployment.md)) but no backup/restore plan.

**Changes:**
1. Enable daily automated backups (Neon, Supabase, Render, etc.).
2. Set retention (7–30 days).
3. Document restore procedure in a runbook.
4. Run one restore drill to staging.
5. Least-privilege DB credentials only.

**Verify:** Restore to staging works; document RTO/RPO.

---

## Recommended implementation order

1. **Week 1:** Items 1, 3, 4, 5
2. **Week 2:** Items 2, 7, 8
3. **Ongoing:** Item 9

---

## Related docs

- [Deployment guide](./deployment.md)
- [RBAC implementation guide](./rbac-implementation-guide.md)
- [README](../README.md) — [architecture](../README.md#-architecture), [env vars](../README.md#environment-variables)
