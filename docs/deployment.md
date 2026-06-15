# Deployment Guide — TaskFlow

TaskFlow is deployed as a **split stack**:

| Component | Host | Role |
| --------- | ---- | ---- |
| Frontend (`frontend/`) | **Vercel** | Next.js App Router, `/api` proxy to backend |
| Backend (`backend/`) | **Railway** | Express API (Docker), runs migrations on deploy |
| Database | **Supabase** | Managed PostgreSQL 16 |

For architecture, request flow, and database design, see the [README Architecture section](../README.md#-architecture). For local setup, see [Getting Started](../README.md#-getting-started).

The browser calls the **Vercel origin** at `/api/...`. Next.js middleware forwards those requests to the Railway backend (same pattern as Docker locally).

**Deploy in this order:** Supabase → Railway → Vercel.

### Production URLs

| Service | URL |
| ------- | --- |
| **Backend API (Railway)** | https://task-manager-production-8310.up.railway.app |
| **Health check** | https://task-manager-production-8310.up.railway.app/health |
| **Swagger UI** | https://task-manager-production-8310.up.railway.app/api-docs |
| **Frontend (Vercel)** | Set `BACKEND_PROXY_URL` on Vercel to the Railway URL above (no trailing slash) |

---

## 1. Supabase (database)

### Create the project

1. Sign in at [supabase.com](https://supabase.com) and create a new project.
2. Choose a region close to your Railway service.
3. Save the database password — Supabase shows it once at creation.

### Get connection details

Open **Project Settings → Database → Connection string**.

You need values for **both** migration tooling and the runtime pool:

| Variable | Where to find it |
| -------- | ---------------- |
| `DATABASE_URL` | **Connection string → URI** (used by `npm run migrate` and seed) |
| `POSTGRES_HOST` | Host from the connection panel |
| `POSTGRES_PORT` | Port (`5432` direct, or `6543` for pooler) |
| `POSTGRES_DB` | Usually `postgres` |
| `POSTGRES_USER` | Usually `postgres` or `postgres.<project-ref>` with pooler |
| `POSTGRES_PASSWORD` | Your database password |

**Recommended for Railway:** use the **Transaction pooler** connection string (port `6543`). Railway’s outbound traffic to Supabase may require IPv6 — `backend/railway.json` already sets `ipv6EgressEnabled: true`.

Append `?sslmode=require` to `DATABASE_URL` if Supabase does not include SSL params by default.

Example (replace with your project values):

```bash
DATABASE_URL=postgresql://postgres.xxxxx:YOUR_PASSWORD@aws-0-ap-south-1.pooler.supabase.com:6543/postgres?sslmode=require

POSTGRES_HOST=aws-0-ap-south-1.pooler.supabase.com
POSTGRES_PORT=6543
POSTGRES_DB=postgres
POSTGRES_USER=postgres.xxxxx
POSTGRES_PASSWORD=YOUR_PASSWORD
```

### Run migrations (first time)

From your machine, with Supabase credentials in the environment:

```bash
cd backend
npm ci
export DATABASE_URL="postgresql://..."   # Supabase URI
npm run migrate
```

Optional demo data (not for production):

```bash
psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f seed.sql
```

Test credentials after seed: see [README](../README.md#test-credentials-after-seed).

### Verify

In Supabase **Table Editor**, confirm tables exist: `tenants`, `users`, `projects`, `project_members`, `tasks`.

---

## 2. Railway (backend API)

### Create the service

1. Sign in at [railway.app](https://railway.app) and create a project from this GitHub repo.
2. Add a service for the backend.
3. In **Settings → Config file**, set the path to `backend/railway.json`.

The config file tells Railway to:

- Build from `backend/Dockerfile`
- Enable **IPv6 egress** (needed for Supabase from Railway)
- Watch only `/backend/**` for redeploys

### Environment variables

Set these in **Railway → Service → Variables** (not in `railway.json`):

| Variable | Required | Value |
| -------- | -------- | ----- |
| `DATABASE_URL` | **Yes** | Supabase URI (same as above) |
| `POSTGRES_HOST` | **Yes** | Supabase host |
| `POSTGRES_PORT` | **Yes** | `6543` (pooler) or `5432` (direct) |
| `POSTGRES_DB` | **Yes** | Usually `postgres` |
| `POSTGRES_USER` | **Yes** | Supabase user |
| `POSTGRES_PASSWORD` | **Yes** | Supabase password |
| `JWT_SECRET` | **Yes** | Long random string (≥ 32 chars) |
| `NODE_ENV` | **Yes** | `production` |
| `RUN_SEED` | **Yes** | `0` in production |
| `PORT` | No | Railway injects this automatically |

See `backend/.env.example` and the [README environment variables](../README.md#environment-variables) section for optional vars (`JWT_EXPIRES_IN`, password policy, etc.).

### Deploy

Push to the connected branch. Railway builds the Docker image and runs `backend/scripts/entrypoint.sh`, which:

1. Runs `npm run migrate` against Supabase
2. Skips seed when `RUN_SEED=0`
3. Starts `node dist/server.js`

### Public URL

Production backend:

**https://task-manager-production-8310.up.railway.app**

Set this as `BACKEND_PROXY_URL` on Vercel (no trailing slash).

If you need to generate or change the domain: Railway → **Settings → Networking** → public domain.

### Verify

```bash
curl https://task-manager-production-8310.up.railway.app/health
```

You should get a JSON health payload. Check Railway deploy logs if migrations fail or the service crashes on start.

---

## 3. Vercel (frontend)

### Create the project

1. Import the repo at [vercel.com](https://vercel.com).
2. Set **Root Directory** to `frontend`.
3. Vercel auto-detects Next.js — no custom `vercel.json` required.

### Connect to Railway

The axios client uses `NEXT_PUBLIC_API_URL` when set, otherwise **`/api`** (see `frontend/src/shared/http/client.ts`).

**Recommended — proxy via `/api` (same-origin cookies)**

1. In Vercel → **Project → Settings → Environment Variables**, add:

   | Name | Value | Environments |
   | ---- | ----- | ------------ |
   | `BACKEND_PROXY_URL` | `https://task-manager-production-8310.up.railway.app` | Production, Preview |

   No trailing slash.

2. `frontend/src/middleware.ts` proxies `/api/*` to `BACKEND_PROXY_URL` (strips the `/api` prefix).

3. Leave `NEXT_PUBLIC_API_URL` unset so the browser keeps calling `/api` on the Vercel origin.

**Alternative — direct Railway URL**

Set `NEXT_PUBLIC_API_URL` to your Railway domain at build time. The browser calls the backend directly; you must configure CORS and cookie `SameSite` carefully. See [Production hardening](./production-hardening.md).

### Deploy

Push to your default branch or run:

```bash
cd frontend
vercel --prod
```

### Verify

1. Open the Vercel deployment URL.
2. Log in with seed credentials if you ran `seed.sql` on Supabase.
3. In DevTools → Network, confirm requests go to `/api/auth/login` (not directly to Railway).
4. Confirm RBAC: admin sees Create project; developer does not.

---

## 4. Production architecture

```mermaid
flowchart LR
    Browser["Browser"]
    Vercel["Vercel<br/>Next.js + /api proxy"]
    Railway["Railway<br/>Express API"]
    Supabase[("Supabase<br/>PostgreSQL")]

    Browser -->|"HTTPS"| Vercel
    Vercel -->|"/api/*"| Railway
    Railway -->|"SQL (pooler)"| Supabase
```

This mirrors the local stack (Next.js `/api` proxy → backend → Postgres) described in the [README](../README.md#-architecture).

---

## 5. Environment summary

| Platform | Key variables |
| -------- | ------------- |
| **Supabase** | Connection URI, host, port, user, password (source of truth for DB) |
| **Railway** | `DATABASE_URL`, `POSTGRES_*`, `JWT_SECRET`, `NODE_ENV=production`, `RUN_SEED=0` |
| **Vercel** | `BACKEND_PROXY_URL=https://task-manager-production-8310.up.railway.app` |

---

## 6. Troubleshooting

| Symptom | Likely cause | Fix |
| ------- | ------------ | --- |
| Railway crash on deploy | Missing `JWT_SECRET` | Set in Railway variables |
| `ECONNREFUSED` / DB timeout | Wrong Supabase host or port | Use pooler URI; confirm `POSTGRES_*` match Supabase panel |
| Railway cannot reach Supabase | IPv4-only egress | Confirm `ipv6EgressEnabled: true` in `backend/railway.json` |
| SSL / connection errors | Supabase requires TLS | Add `?sslmode=require` to `DATABASE_URL` |
| Migrations fail | Wrong `DATABASE_URL` | Run `npm run migrate` locally with the same URI to debug |
| `/api/...` returns HTML or 404 | Vercel proxy not set | Set `BACKEND_PROXY_URL=https://task-manager-production-8310.up.railway.app` on Vercel |
| Login works locally, fails in prod | Railway unreachable | `curl https://task-manager-production-8310.up.railway.app/health` |
| 401 after login | Cookie not sent cross-origin | Use `/api` proxy on Vercel (do not set `NEXT_PUBLIC_API_URL`) |
| 403 on admin actions | Expected RBAC | Use admin account; see [RBAC guide](./rbac-implementation-guide.md) |
| Empty tables | Migrations not run | Check Railway deploy logs for migrate step |

For full local setup, see the [README](../README.md#-getting-started).

For production hardening beyond a working deploy, see [Production hardening](./production-hardening.md).

For permission model and admin vs developer behaviour, see [RBAC implementation guide](./rbac-implementation-guide.md).
