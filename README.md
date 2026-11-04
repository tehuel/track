# track

Aplicación de seguimiento personal simple, construida con Bun, Hono, SQLite, HTMX y Bootstrap.

Diseñado para correr en un servidor personal o homelab.

---

## Inicio rápido

### Con binario

Descargar el ejecutable para Linux desde [Releases](https://github.com/tehuel/track/releases) y ejecutar:

```bash
./track
```

La aplicación inicia en `http://localhost:3000` y crea la base de datos en `./track.db`.

El puerto y la ubicación de la base de datos se pueden configurar mediante variables de entorno:

```bash
PORT=8080 DB_PATH=/ruta/track.db ./track
```

| Variable | Predeterminado | Descripción |
|---|---|---|
| `PORT` | `3000` | Puerto HTTP. |
| `DB_PATH` | `track.db` | Ruta del archivo SQLite. |
| `DB_WAL` | `false` | Activa el modo WAL de SQLite (`true`/`1`). Mejora la concurrencia, pero crea los archivos `track.db-wal` y `track.db-shm` junto a la base. |

### Con Docker

```bash
docker run -d \
  --name track \
  --restart unless-stopped \
  -p 3000:3000 \
  -v "$PWD/data:/data" \
  ghcr.io/tehuel/track:latest
```

O con Docker Compose:

```yaml
services:
  track:
    image: ghcr.io/tehuel/track:latest
    container_name: track
    restart: unless-stopped
    ports:
      - "3000:3000"
    volumes:
      - ./data:/data
```

---

## Desarrollo local

Requiere [Bun](https://bun.sh/).

```bash
bun install    # Instalar dependencias
bun dev        # Iniciar en modo desarrollo
bun test       # Correr tests
bun run build  # Compilar el binario
```

Bootstrap y HTMX se declaran como dependencias de desarrollo y Bun los embebe
automáticamente al compilar; no es necesario descargar ni copiar assets
manualmente.

## Releases

Cada merge a `main` que pase los tests crea automáticamente el siguiente
release PR con los cambios de versión. Al mergear ese PR, `release-please`
calcula la siguiente versión según Conventional Commits, actualiza
`package.json` y `CHANGELOG.md`, crea el tag y la GitHub Release. El workflow
publica además los binarios y las etiquetas correspondientes (`1.1.1`, `1.1`,
`latest`) en GitHub Container Registry.

Usá estos prefijos en los commits:

```text
fix: corregir cálculo       # PATCH
feat: agregar funcionalidad # MINOR
feat!: cambiar API          # MAJOR
```

También se puede indicar un cambio incompatible con `BREAKING CHANGE:` en el
footer del commit. Los merges normales sólo preparan o actualizan el release
PR; no publican una versión directamente.

---

## Nota sobre usuarios

La aplicación no cuenta con registro de usuarios, contraseñas ni inicio de sesión. Está pensada para uso personal.

Para exponer la aplicación a internet, se recomienda hacerlo a través de una red privada como **Tailscale**, o agregar autenticación previa mediante **Cloudflare Access** o un proxy inverso con contraseña.
