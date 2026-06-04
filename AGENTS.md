# sensor-dashboard

React 19 + TypeScript + Vite 6 + Chakra UI v3 + Zustand + TanStack React Query + React Router v7.

## Commands

| Command           | What it does                             |
| ----------------- | ---------------------------------------- |
| `npm run dev`     | Vite dev server                          |
| `npm run build`   | `tsc -b && vite build` (typecheck first) |
| `npm run lint`    | ESLint flat config on all files          |
| `npm run preview` | Vite preview of production build         |

No test framework is configured.

## Architecture

- **Auth**: JWT-based. Tokens (`access_token`, `refresh_token`) in `localStorage`. Axios interceptor auto-attaches Bearer token and refreshes on 401. Zustand store decodes JWT via `jwt-decode` — see `src/store/auth.store.ts`.
- **API**: Axios instance in `src/api/axios.ts` (baseURL from `VITE_API_URL` env, default `http://localhost:3000`). Endpoint modules in `src/api/endpoints/`.
- **Server state**: TanStack React Query hooks in `src/hooks/`. `QueryClient` configured with `retry: 1`, `staleTime: 30s`.
- **State**: Zustand stores in `src/store/` (auth, notifications, sidebar).
- **Routing**: React Router v7, `ProtectedRoute` wrapper, `AppShell` layout (sidebar + topbar).
- **Real-time**: Socket.IO WebSocket to `http://localhost:3000/notifications` — see `src/hooks/useSocketNotifications.ts`. JWT passed as `auth.token` on connect. Receives `notification` events.
- **UI**: Chakra UI v3 with `ChakraProvider value={defaultSystem}`. Toast system via `createToaster` in `src/components/ui/toaster.tsx`.
- **Forms**: Zod schemas (`src/schemas/`) + react-hook-form.

## TSConfig quirks

- `verbatimModuleSyntax: true` — type imports must use `import type { ... }` (runtime imports stay `import { ... }`).
- `erasableSyntaxOnly: true` — no enums; use const objects + type unions (e.g. `DeviceStatus` pattern in `types/`).
- `noUnusedLocals` / `noUnusedParameters` — dead code causes build errors.
- Project references: `tsconfig.app.json` (src) + `tsconfig.node.json` (vite.config.ts).

## Project structure

```
src/
  pages/         — page-level components (auth, devices, sensor-windows, ...)
  components/    — reusable: layout/, shared/, ui/, devices/, notifications/, stats/
  hooks/         — custom hooks (TanStack Query wrappers + Socket.IO)
  store/         — Zustand stores
  api/           — axios instance + endpoint modules
  types/         — TS interfaces
  schemas/       — Zod validation schemas
  utils/         — token storage, sensor metrics helpers
```

## Key patterns

- Keep pages in `src/pages/` organized by domain (auth, devices, sensor-windows, profile, notification, stat).
- Component directories mirror domain structure in `src/components/`.
- Chakra UI v3 components use the new slot/recipe API — check existing components before writing markup.
- The build pipeline runs `tsc -b` (project references) before `vite build` — type errors will fail the build.

# Project Rules & Architecture Guidelines

## Tech Stack & Standards

- We use strict TypeScript typing. NEVER use `any`.
- Frontend state must follow standard custom hook patterns.
- Backend routing must match our strict controller validation schemas.

## Code Quality Constraints

- **Zero Placeholders:** Never output `// TODO: implement later` or skip code lines. Write out the entire component or logic block cleanly.
- **Import Integrity:** Before adding or modifying an import statement, check the target file path using `@` or `grep` to ensure the file actually exists and contains that export.
- **Dry-Run Rules:** Always test your compilation loops via the terminal before declaring a feature complete. -**maintainable code Rules** always think about writing maintainable code as much as being functional
