# TaskFlow Frontend

React + TypeScript + Vite application for the TaskFlow project management UI.

## Repository structure

Every feature module uses the **same folder layout**. Route files under `pages/` are thin shells that mount screens from `modules/`. Domain-specific API calls, types, and UI live inside the owning module—not in global `api/` or `types/` folders.

```
frontend/
├── public/
├── tests/
├── src/
│   ├── main.tsx
│   ├── index.css
│   ├── app/
│   │   └── App.tsx                 # routes → pages/*
│   ├── pages/                      # thin route shells only
│   │   ├── auth/
│   │   ├── projects/
│   │   ├── tasks/
│   │   └── users/
│   ├── modules/                    # feature domains (identical skeleton)
│   │   ├── auth/
│   │   ├── projects/
│   │   ├── tasks/
│   │   └── users/
│   └── shared/                     # cross-cutting concerns only
│       ├── http/
│       ├── types/                  # generic API envelope types
│       ├── utils/
│       ├── theme/
│       ├── ui/
│       ├── layouts/
│       ├── permissions/
│       └── providers/
├── vite.config.ts                  # `@` → `src`
└── tsconfig.app.json
```

### Module skeleton (same for every feature)

```
modules/<feature>/
├── index.ts          # public barrel exports
├── api/              # HTTP + query-keys.ts
├── types/
├── schemas/
├── hooks/
├── components/
├── screens/          # full page UI (used by pages/*)
├── utils/
├── constants/
└── context/
```

| Module     | Screens                         | Notes                                      |
|------------|---------------------------------|--------------------------------------------|
| `auth`     | Login, Register                 | owns session `context/` + zustand store    |
| `projects` | Projects list, Project detail   | composes task UI on project detail         |
| `tasks`    | My tasks                        | kanban, filters, modals in `components/`   |
| `users`    | Users list                      |                                            |

### Client state vs server state

Not every module needs a Zustand store or React context. Modules share the same **folder** layout (`context/` exists everywhere), but only **auth** fills `context/` with a real provider because it owns **global session state**. The other modules load **server data** through TanStack Query and keep short-lived UI state in component `useState`.

| Module     | Primary state        | Where it lives | Why |
|------------|----------------------|----------------|-----|
| `auth`     | **Client**           | `context/auth.store.ts` (Zustand, persisted) + `context/AuthContext.tsx` (React provider) | Session (`user`, `permissions`) is global, survives refresh, and must be readable outside React (e.g. axios 401 handler clears the store). Context exposes actions (`login`, `logout`, `bootstrap`) and `isBootstrapped`. Login/register **form** fields use local `useState` in `hooks/useLoginForm` and `hooks/useRegisterForm`. |
| `projects` | **Server**           | `hooks/useProjects`, `hooks/useCreateProject` + queries in screens | Projects, stats, and members come from the API. React Query caches and invalidates them (`api/query-keys.ts`). **Ephemeral UI** (create-project modal in `AppShell`, filter/sort panels, open modals) stays in local `useState` on screens/components. |
| `tasks`    | **Server**           | `hooks/useMyTasks` + task queries/mutations in `ProjectDetailScreen` | Tasks are server-owned records. List/create/update/delete go through React Query. **Ephemeral UI** (modal drafts, filter/sort draft state, panel open/close) uses local `useState` in components and screens. |
| `users`    | **Server**           | `hooks/useUsers` | User directory is read from the API; no global client cache beyond React Query. |

**Rule of thumb**

- **Client state (store / context)** — data or behavior needed **across the whole app**, **after navigation**, or **outside React**. Only auth qualifies today.
- **Server state (React Query)** — data that **lives on the backend** (projects, tasks, users). Fetched via `modules/*/api/`, cached with query keys, updated with mutations + `invalidateQueries`.
- **Local state (`useState`)** — **UI-only** and **short-lived** (form inputs before submit, which modal is open, filter panel drafts). Stays in hooks, components, or screens; not in a global store.

`context/index.ts` under `projects`, `tasks`, and `users` is a structural placeholder. Add a real provider there only when a module gains **global client-owned** state that React Query cannot represent (e.g. a cross-route WebSocket or app-wide draft).

### Import rules

```
pages/*     →  @/modules/* , @/shared/*
modules/*   →  @/shared/* , @/modules/* (barrel only)
shared/*    →  @/shared/* , @/modules/auth (layouts/permissions only)
```

Use the `@/` path alias (maps to `src/`) instead of deep relative imports.

### Example thin page

```tsx
// pages/projects/ProjectDetailPage.tsx
import { useParams } from "react-router-dom";
import { ProjectDetailScreen } from "@/modules/projects";

export function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  if (!id) return null;
  return <ProjectDetailScreen projectId={id} />;
}
```

## Development

```bash
npm install
npm run dev
```

## Scripts

| Command        | Description              |
|----------------|--------------------------|
| `npm run dev`  | Start Vite dev server    |
| `npm run build`| Production build         |
| `npm test`     | Run Vitest unit tests    |
| `npm run lint` | ESLint                   |

## Stack

- React 19 + React Router
- TanStack Query
- Zustand (auth session persistence)
- Zod (form validation)
- Axios (`shared/http/client.ts`)
