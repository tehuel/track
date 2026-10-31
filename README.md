# track

Lightweight, self-hosted personal tracker built with **Bun**, **Hono**, **SQLite (`bun:sqlite`)**, **HTMX**, and **Bootstrap 5**.

Designed to be run in a local Docker Compose environment or homelab, with authentication delegated to your network perimeter (Tailscale, Cloudflare Tunnel Access, Authelia, or reverse proxy basic auth).

---

## Features

- **Zero Auth / Single-Tenant Simplicity**: No users table, passwords, or permission tokens inside the app. Protected at the network perimeter.
- **Hypermedia-Driven (HTMX)**:
  - Instant live search and filtering.
  - One-click habit check-ins and inline numeric/text logging with dynamic card updates.
  - Chronological event history with fast event deletion.
- **Responsive Bootstrap 5 UI**:
  - Dark / light theme with automatic system preference detection.
  - Clean card dashboard and dedicated single-track detail views.
- **Dual Interface**:
  - Full server-rendered web UI for browsers.
  - Headless REST JSON API (`/api/*`) for scripts, shortcuts, and Bruno test collections.
- **Fast Local SQLite**:
  - Powered by Bun's native SQLite driver (`bun:sqlite`) with Write-Ahead Logging (WAL) enabled.
  - Single database file mounted on a persistent Docker volume (`/data/tracker.db`).

---

## Tech Stack

- **Runtime**: [Bun](https://bun.sh/)
- **Web Framework**: [Hono](https://hono.dev/) with Hono JSX
- **Database**: Native SQLite (`bun:sqlite`)
- **Frontend**: [HTMX](https://htmx.org/) v2 & [Bootstrap 5](https://getbootstrap.com/) v5.3
- **Validation**: [Zod](https://zod.dev/)
- **Testing**: Bun Test (`bun test`)

---

## Quick Start (Local Development)

### 1. Install Dependencies
```bash
bun install
```

### 2. Run the Development Server
```bash
bun dev
```

The application will start on `http://localhost:3000`. The SQLite database will be created automatically at `./tracker.db`.

### 3. Run Tests & Typecheck
```bash
bun test
bun run typecheck
```

---

## Running with Docker Compose

To run `track` as a persistent containerized service:

```bash
docker compose up -d
```

- Web UI & API available at: `http://localhost:3000`
- SQLite database stored on host at: `./data/tracker.db`

To view logs:
```bash
docker compose logs -f
```

To stop:
```bash
docker compose down
```

---

## Delegating Authentication (Perimeter Auth)

Because `track` has zero internal user concepts, authentication should be handled at your perimeter or reverse proxy. Recommended options:

1. **Tailscale (Simplest & Most Secure)**:
   Keep the container bound to your host or private network, and access it exclusively over Tailscale from your personal devices.
2. **Cloudflare Tunnel + Cloudflare Access**:
   Route your domain to the container using `cloudflared`, and configure a Cloudflare Access policy (e.g. Google Login, GitHub Login, or One-Time PIN) in the Cloudflare Zero Trust dashboard.
3. **Caddy / Nginx Reverse Proxy with Basic Auth**:
   Put a reverse proxy in front of the container requiring HTTP Basic Auth or forward auth (e.g. Authelia, Authentik).

---

## REST JSON API Reference

All endpoints return standard JSON.

### Health
- `GET /api/health` — Service health check.

### Trackers (`/api/trackers`)
- `GET /api/trackers` — List all trackers.
- `POST /api/trackers` — Create a tracker (`{ name, type?, description?, id? }`).
- `GET /api/trackers/:id` — Get single tracker by ID.
- `DELETE /api/trackers/:id` — Delete tracker and cascading events.

### Events (`/api/trackers/:id/events`)
- `GET /api/trackers/:id/events?limit=50` — List events chronologically descending.
- `POST /api/trackers/:id/events` — Log event (`{ value?, note?, timestamp? }`).
- `DELETE /api/trackers/:id/events/:eventId` — Delete a logged event.

---

## Testing with Bruno

A complete Bruno collection is available in `bruno/`:
1. Open Bruno and select `Open Collection`, choosing the `bruno/` directory.
2. Select the `local` environment (`http://localhost:3000/api`).
3. Run requests directly (no auth tokens needed!).
