# Production Hardening — TaskFlow

This document lists **necessary changes** to move TaskFlow from a working MVP deployment ([deployment guide](./deployment.md)) to a setup that is **fully production-grade**.

Use it as a checklist. Items are ordered roughly by impact: fix misconfiguration and security first, then reliability and operations.

> **Baseline:** Split deploy (Vercel frontend + hosted Express API + managed Postgres) is the correct architecture. The gaps below are about **configuration, security defaults, and operability** — not replacing that model.

---

## Summary checklist

| # | Area | Priority | Status |
| - | ---- | -------- | ------ |
| 1 | [Proxy misconfiguration guard](#1-proxy-misconfiguration-guard) | **High** | ☐ |
| 2 | [Resilient Vercel middleware](#2-resilient-vercel-middleware) | **High** | ☐ |
| 3 | [Explicit cookie policy](#3-explicit-cookie-policy) | **High** | ☐ |
| 4 | [Restrict CORS origins](#4-restrict-cors-origins) | **High** | ☐ |
| 5 | [Rate limiting on auth and API](#5-rate-limiting-on-auth-and-api) | **High** | ☐ |
| 6 | [Environment separation (prod / preview / staging)](#6-environment-separation-prod--preview--staging) | **Medium** | ☐ |
| 7 | [Migration and deploy pipeline](#7-migration-and-deploy-pipeline) | **Medium** | ☐ |
| 8 | [Observability and alerting](#8-observability-and-alerting) | **Medium** | ☐ |
| 9 | [Database backups and recovery](#9-database-backups-and-recovery) | **Medium** | ☐ |
| 10 | [Secrets and access hygiene](#10-secrets-and-access-hygiene) | **Medium** | ☐ |
| 11 | [Disable or protect non-prod surfaces](#11-disable-or-protect-non-prod-surfaces) | **Low** | ☐ |
| 12 | [Performance and proxy overhead](#12-performance-and-proxy-overhead) | **Low** | ☐ |

---

## 1. Proxy misconfiguration guard

### Problem

If `BACKEND_PROXY_URL` is not set on Vercel, `frontend/middleware.ts` falls through to the static rewrite in `frontend/vercel.json`, which still points at the placeholder `YOUR_BACKEND_URL`. The SPA loads but **all API calls fail** with no clear signal to operators.

### Necessary changes

**Option A — Fail fast in middleware (recommended)**

In `frontend/middleware.ts`, when `VERCEL_ENV === 'production'` (or always for `/api` requests), return `502` with a clear JSON body if `BACKEND_PROXY_URL` is missing — do not fall through to the placeholder rewrite.

**Option B — Remove the placeholder rewrite**

Delete the `/api` rewrite from `frontend/vercel.json` and rely entirely on middleware + `BACKEND_PROXY_URL`. Misconfiguration then fails loudly instead of proxying to a fake host.

**Option C — Deploy-time validation**

Add a CI step (GitHub Action) that fails the build/deploy if `BACKEND_PROXY_URL` is unset for production, or if `vercel.json` still contains `YOUR_BACKEND_URL`.

### Verify

- Deploy without `BACKEND_PROXY_URL` → build or `/api/health` should fail visibly, not return SPA HTML.
- Deploy with `BACKEND_PROXY_URL` set → `/api/health` returns backend JSON.

---

## 2. Resilient Vercel middleware

### Problem

`frontend/middleware.ts` is a thin pass-through: no timeout, no error handling, no logging. If the backend is down, slow, or returns an error, users get opaque failures and you have no edge-level visibility.

### Necessary changes

| Change | Why |
| ------ | --- |
| Wrap `fetch` in `try/catch` | Return `502 Bad Gateway` with a stable error shape when the backend is unreachable |
| Add a request timeout (e.g. 10–30s via `AbortSignal.timeout`) | Prevent hung requests tying up the edge worker |
| Log proxy failures (method, path, status, latency) | Debug production issues; Vercel supports edge logs |
| Optionally forward `X-Forwarded-For` / `X-Forwarded-Proto` | Helps backend audit logs behind a proxy |
| Do not forward sensitive hop-by-hop headers beyond `host` cleanup | Avoid leaking internal headers |

### Example shape (implementation guide)

```typescript
try {
  const response = await fetch(target, {
    signal: AbortSignal.timeout(15_000),
    // ...
  });
  return response;
} catch {
  return Response.json(
    { error: "API temporarily unavailable" },
    { status: 502 },
  );
}
```

### Verify

- Stop the backend → `/api/health` returns `502` JSON, not a browser network error or HTML.
- Restore backend → proxy works again without redeploying the frontend.

---

## 3. Explicit cookie policy

### Problem

Auth cookies are set in `backend/src/modules/auth/controllers/auth.controller.ts` with `httpOnly` and `secure` (via `backend/src/shared/config/index.ts`) but **no explicit `sameSite`**. Browsers default behavior can vary; cross-site and CSRF posture should be intentional.

### Necessary changes

1. Add `sameSite` to `config.cookie` in `backend/src/shared/config/index.ts`:
   - **`'lax'`** — recommended when using same-origin `/api` proxy (Vercel → backend).
   - **`'strict'`** — stricter; only if you never need top-level navigations to carry the cookie.
   - **`'none'`** — only if using direct cross-origin `VITE_API_URL`; requires `secure: true`.

2. Use the config value in both `setAuthCookie` and `clearAuthCookie` in `auth.controller.ts` (clearCookie options must match set options).

3. Document the chosen policy in `backend/.env.example` if driven by env (e.g. `COOKIE_SAME_SITE=lax`).

### Verify

- Login in production → DevTools → Application → Cookies shows `authToken` with `HttpOnly`, `Secure`, and expected `SameSite`.
- Logout clears the cookie with matching attributes.

---

## 4. Restrict CORS origins

### Problem

`backend/src/app.ts` uses `cors({ origin: true, credentials: true })`, which reflects **any** request `Origin`. That is acceptable when the browser only talks same-origin via `/api`, but becomes a liability if you switch to direct `VITE_API_URL` or expose the API publicly.

### Necessary changes

1. Add `CORS_ORIGIN` (or `CORS_ORIGINS` comma-separated) to `backend/src/shared/config/index.ts` and `backend/.env.example`.

2. Replace `origin: true` with an allowlist:

   ```typescript
   cors({
     origin: config.cors.origins, // e.g. ['https://your-app.vercel.app']
     credentials: true,
   })
   ```

3. Set production values to your Vercel production URL (and preview URL pattern if using direct API calls).

4. Keep `origin: true` only in local development if desired.

### Verify

- Request from allowed frontend origin → succeeds with credentials.
- Request from random origin → CORS blocked in browser (when using direct API mode).
- Same-origin `/api` proxy → CORS preflight rarely applies; still lock down for defense in depth.

---

## 5. Rate limiting on auth and API

### Problem

`express-rate-limit` is listed in `backend/package.json` but **not applied** to routes. Login, register, and the general API are vulnerable to brute-force and abuse.

### Necessary changes

1. Create `backend/src/shared/middlewares/rateLimit.ts` (or similar) with at least two limiters:
   - **Auth limiter** — strict (e.g. 10–20 requests / 15 min per IP) on `POST /auth/login` and `POST /auth/register`.
   - **General API limiter** — moderate (e.g. 100–300 requests / 15 min per IP) on authenticated routes.

2. Wire limiters in:
   - `backend/src/modules/auth/routes/auth.routes.ts` — auth limiter on login/register.
   - `backend/src/app.ts` — general limiter after parsers, before routers (or per-router).

3. Return `429` with a consistent error body (match existing error handler shape).

4. If running multiple backend instances, use a shared store (Redis) instead of in-memory limits.

5. Document limits in README or OpenAPI if you expose public API docs.

### Verify

- Burst login attempts → `429` after threshold.
- Normal usage → unaffected.

---

## 6. Environment separation (prod / preview / staging)

### Problem

Vercel preview deployments share the same repo but may inherit wrong env vars. A preview frontend pointing at **production** database or API causes data leaks and hard-to-debug bugs.

### Necessary changes

| Environment | Frontend (Vercel) | Backend | Database |
| ----------- | ----------------- | ------- | -------- |
| **Production** | `BACKEND_PROXY_URL` → prod API | Prod service | Prod Postgres |
| **Preview** | Separate `BACKEND_PROXY_URL` → staging API, or disable previews | Staging API | Staging Postgres (never prod) |
| **Local** | Vite proxy / Docker | Local / Docker | Local / Docker |

1. In Vercel → Environment Variables, scope `BACKEND_PROXY_URL` per environment (Production vs Preview).
2. Use a dedicated staging backend + DB; never point preview at production `DATABASE_URL`.
3. Optionally disable Vercel preview deploys for PRs until staging exists.
4. Use different `JWT_SECRET` per environment so tokens are not interchangeable.

### Verify

- Open a preview URL → network tab shows `/api` hitting staging backend, not production.
- Prod credentials do not work against staging JWT (different secret).

---

## 7. Migration and deploy pipeline

### Problem

Migrations run manually or via a one-line start command (`npm run migrate && npm start`). In production you need a **repeatable, ordered, observable** migration step.

### Necessary changes

1. **Single migration path:** Always use `npm run migrate` (node-pg-migrate) in deploy — never apply SQL by hand in prod except emergencies.

2. **Release phase:** Run migrations **before** traffic switches to the new backend version (Render “pre-deploy”, Railway release command, etc.) — not only inside `start` if that races with old instances.

3. **Idempotency:** Migrations should be forward-only in prod; test `migrate:down` only in staging.

4. **Seed:** Do **not** run `seed.sql` in production (`RUN_SEED=0`). Seed is for local/demo only.

5. **CI gate:** Optional pipeline step — on PR, run `npm run build && npm run migrate` against a throwaway test DB.

### Verify

- Deploy new migration → schema updates once, app starts cleanly.
- Re-deploy same version → migrate is no-op, no errors.

---

## 8. Observability and alerting

### Problem

Winston logs exist on the backend (`requestLogger`), but there is no production playbook for **health checks, uptime alerts, or error tracking**.

### Necessary changes

| Layer | Action |
| ----- | ------ |
| **Backend** | Configure host health check on `GET /health` (already in `backend/src/app.ts`) |
| **Frontend** | Optional synthetic check: load `/` and `/api/health` via cron (Better Stack, UptimeRobot, etc.) |
| **Logs** | Ship backend logs to provider (Render/Railway logs, or Datadog/Axiom/Logtail) |
| **Errors** | Add Sentry (or similar) to backend and optionally frontend |
| **Alerts** | Alert on health check failure, 5xx spike, DB connection errors |

### Verify

- Stop backend → alert fires within configured window.
- Trigger a handled 500 → appears in error tracker with stack trace.

---

## 9. Database backups and recovery

### Problem

Managed Postgres is assumed in [deployment.md](./deployment.md), but backup retention and restore drills are not defined.

### Necessary changes

1. Enable **automated daily backups** on your Postgres provider (Neon, Supabase, Render, etc.).
2. Set retention (e.g. 7–30 days) per compliance needs.
3. Document **restore procedure** (point-in-time or snapshot restore) in runbook form.
4. Run a **restore drill** to staging at least once before calling prod “hardened”.
5. Restrict DB credentials: backend service account only; no shared admin URL in app env.

### Verify

- Restore backup to staging → app connects and reads data.
- Document RTO/RPO targets (even informal ones).

---

## 10. Secrets and access hygiene

### Problem

Production depends on `JWT_SECRET`, `DATABASE_URL`, and `BACKEND_PROXY_URL`. Leakage or weak values compromise the entire system.

### Necessary changes

| Secret | Guidance |
| ------ | -------- |
| `JWT_SECRET` | ≥ 32 random bytes; unique per environment; rotate with a planned session logout |
| `DATABASE_URL` | Never commit; scoped user with least privilege |
| `BACKEND_PROXY_URL` | Not secret, but validate HTTPS only in prod middleware |
| Vercel / host dashboards | MFA enabled; minimal team access |

1. Remove or guard `seed.sql` demo passwords in any public production deploy.
2. Enforce strong password policy in prod (`PASSWORD_*` env vars) — unlike local `.env.example` demo settings.
3. Audit `.gitignore` and deploy logs for accidental secret exposure.

### Verify

- No secrets in git history or frontend bundle (`grep -r JWT dist/` empty).
- Production register rejects weak passwords if policy enabled.

---

## 11. Disable or protect non-prod surfaces

### Problem

Swagger UI at `/api-docs` and verbose error responses may be fine locally but expose internals in production.

### Necessary changes

1. **Swagger:** Mount `/api-docs` only when `NODE_ENV !== 'production'`, or protect with auth / IP allowlist (`backend/src/app.ts`).

2. **Error handler:** Ensure production responses do not leak stack traces (confirm `errorHandler` behavior).

3. **Postman collection** in `docs/` — documentation only; not served by the app.

### Verify

- `GET https://prod-api/api-docs` → 404 or auth required.
- Client receives generic message on 500; details only in server logs.

---

## 12. Performance and proxy overhead

### Problem

With Option A (Vercel `/api` proxy), every API call goes **browser → Vercel Edge → backend**. Adds latency vs direct API calls.

### Necessary changes

This is usually **acceptable** for small and medium traffic when cookie simplicity matters. Consider changes only if latency becomes an issue:

| Approach | Trade-off |
| -------- | --------- |
| Keep `/api` proxy | Best cookie/CSRF story; +1 hop |
| Direct `VITE_API_URL` + strict CORS + `sameSite: 'none'` | Lower latency; more client/config complexity |
| Colocate frontend and API behind one domain (single nginx/reverse proxy) | Lowest hop count; you manage infra |

No code change required unless metrics show proxy latency is a bottleneck.

### Verify

- Measure p95 for `/api/health` from browser vs direct backend URL; document acceptable threshold.

---

## Recommended implementation order

1. **Week 1 (security + config):** Items 1, 3, 4, 5, 6  
2. **Week 2 (reliability):** Items 2, 7, 8  
3. **Ongoing (operations):** Items 9, 10, 11  
4. **As needed:** Item 12  

---

## Related docs

- [Deployment guide](./deployment.md) — how to deploy the split stack today  
- [RBAC implementation guide](./rbac-implementation-guide.md) — permission model (already enforced server-side; keep it that way in prod)  
- [README](../README.md) — environment variables and local setup  
