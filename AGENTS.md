# Tracker — Agent Guidelines

Self-hosted, lightweight personal tracker application built with **Bun**, **Hono**, **SQLite (`bun:sqlite`)**, **HTMX**, and **Bootstrap 5**.

For developer setup, Docker commands, and API documentation, see [README.md](README.md).

## Core Architecture & Engineering Rules

### 1. Single-Tenant Perimeter Authentication
- **Zero In-App Auth**: The application does not manage users, passwords, sessions, or JWTs.
- **Perimeter Delegation**: Access control is handled externally at the network boundary (Tailscale, Cloudflare Tunnel Access, Authelia, or reverse proxy basic auth).

### 2. Backend Architecture (2-Layer Pattern)
- **HTTP / Routing Layer (`src/web.tsx`, `src/api.ts`)**: Hono sub-routers handling request parameters, form parsing, validation, and HTTP responses.
  - `src/web.tsx`: Server-rendered HTML and HTMX partial routes.
  - `src/api.ts`: Headless REST JSON API routes mounted at `/api/*`.
- **Data Access Layer (`src/db.ts`)**: Pure TypeScript functions executing native SQLite prepared queries (`db.query(...)`).
  - Connection singleton with Write-Ahead Logging (WAL) and foreign keys enabled.
  - Testable with in-memory SQLite via `createDatabase(':memory:')` and `setDb(...)`.
- **Validation Layer (`src/schemas.ts`)**: Strict Zod schemas validating tracker creation and event logging.
- **Views (`src/views/`)**: Server-rendered Hono JSX components (`layout.tsx`, `dashboard.tsx`, `detail.tsx`, `log-entry.tsx`, `components/`).
- **Internationalization (`src/i18n.ts`)**: English and Argentine Spanish translations resolved via `track_lang` cookie or `?lang=en|es` query parameter.
- **Entrypoint (`src/index.ts`)**: Initializes Hono server, health endpoints, static asset handlers, and exports default Bun server configuration.

### 3. Hypermedia & Frontend Architecture (HTMX + Bootstrap 5)
- **Zero Client Bundlers**: No Vite, Webpack, or heavy node-based SPA build pipelines.
- **HTMX Dynamic Swaps**:
  - Habit check-in and inline value logging swap the individual card in-place (`hx-target="#tracker-card-:id"`).
  - Search filter performs debounced live partial replacement (`hx-trigger="keyup changed delay:200ms"`).
  - Event deletion removes list items asynchronously (`hx-delete` + `hx-swap="outerHTML"`).
- **Zero Custom CSS**: Styled exclusively with vanilla Bootstrap 5 and Bootstrap Icons.

### 4. Testing & Verification Philosophy
- **Automated Tests**: Unit and integration tests written for Bun Test (`bun test`) located in `test/`.
  - Database queries tested against `:memory:` SQLite instances (`test/db.test.ts`).
  - REST API endpoints tested via `app.request()` (`test/api.test.ts`).
  - Web UI & HTMX partials tested via `app.request()` (`test/web.test.ts`).
- **Strict Typing**: Full TypeScript coverage verified with `bun run typecheck` (`tsc --noEmit`).

---

## Project Structure

- `src/` — Server codebase:
  - `index.ts` — Main server entrypoint.
  - `db.ts` — Native SQLite connection and typed database queries.
  - `web.tsx` — Web page and HTMX route handlers.
  - `api.ts` — Headless JSON REST API router.
  - `views/` — Hono JSX view templates.
  - `i18n.ts` — Server-side translations (`en`, `es`).
  - `slug.ts` — Slug generation and collision handling.
  - `schemas.ts` — Zod schemas.
  - `types.ts` — Centralized TypeScript interfaces.
- `public/` — Static assets (favicons, icons).
- `test/` — Bun test suite (`db.test.ts`, `api.test.ts`, `web.test.ts`).
- `schema.sql` — SQLite DDL schema.
- `bruno/` — Bruno API collection.
- `Dockerfile` & `docker-compose.yml` — Containerization and self-hosting configuration.
