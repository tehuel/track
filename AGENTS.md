# Tracker — Agent Guidelines

Self-hosted, lightweight personal tracker application built with **Bun**, **Hono**, **SQLite (`bun:sqlite`)**, **HTMX**, and **Bootstrap 5**.

For developer setup, Docker commands, and API documentation, see [README.md](README.md).

## Core Architecture & Engineering Rules

### 1. Single-Tenant Perimeter Authentication
- **Zero In-App Auth**: The application does not manage users, passwords, sessions, or JWTs.
- **Perimeter Delegation**: Access control is handled externally at the network boundary (Tailscale, Cloudflare Tunnel Access, Authelia, or reverse proxy basic auth).

### 2. Backend Architecture (2-Layer Pattern)
- **HTTP / Routing Layer (`src/web.tsx`)**: Hono router handling request parameters, form parsing, and HTTP/HTMX responses.
  - Server-rendered HTML pages and HTMX partial routes.
- **Data Access Layer (`src/db.ts`)**: Pure TypeScript functions executing native SQLite prepared queries (`db.query(...)`).
  - Connection singleton with Write-Ahead Logging (WAL) and foreign keys enabled.
  - Uses `:memory:` SQLite automatically when `NODE_ENV === 'test'`.
- **Views (`src/views/`)**: Server-rendered Hono JSX components (`layout.tsx`, `dashboard.tsx`, `detail.tsx`, `components/`).
- **Entrypoint (`src/index.ts`)**: Initializes Hono server, health endpoints, static asset handlers, and exports default Bun server configuration.

### 3. Hypermedia & Frontend Architecture (HTMX + Bootstrap 5)
- **Zero Client Bundlers**: No Vite, Webpack, or heavy node-based SPA build pipelines.
- **HTMX Dynamic Swaps**:
  - Habit check-in and inline value logging swap the individual card in-place (`hx-target="#tracker-card-:id"`).
  - Search filter performs debounced live partial replacement (`hx-trigger="keyup changed delay:200ms"`).
  - Event and tracker deletion refresh views cleanly via `hx-delete` + `HX-Location`.
- **Zero Custom CSS**: Styled exclusively with vanilla Bootstrap 5 and Bootstrap Icons.

### 4. Testing & Verification Philosophy
- **Automated Tests**: Unit and integration tests written for Bun Test (`bun test`) located in `test/`.
  - Database queries tested against `:memory:` SQLite instances (`test/db.test.ts`).
  - Web UI & HTMX partials tested via `app.request()` (`test/web.test.ts`).
- **Strict Typing**: Full TypeScript coverage verified with `bun run typecheck` (`tsc --noEmit`).

---

## Project Structure

- `src/` — Server codebase:
  - `index.ts` — Main server entrypoint.
  - `db.ts` — Native SQLite connection, slug generation, and typed database queries.
  - `web.tsx` — Web page and HTMX route handlers.
  - `views/` — Hono JSX view templates.
  - `types.ts` — Centralized TypeScript interfaces.
- `public/` — Static assets (favicons, icons).
- `test/` — Bun test suite (`db.test.ts`, `web.test.ts`).
- `Dockerfile` & `docker-compose.yml` — Containerization and self-hosting configuration.
