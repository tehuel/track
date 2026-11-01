// Versioned static assets: content-hashed URLs (`/app.js?v=<hash>`) force
// browsers to fetch fresh copies whenever the file changes, which keeps
// `immutable` caching safe.

// @ts-expect-error Bun embedded file import
import appJsFile from '../public/app.js' with { type: 'file' }

const appJsBytes = await Bun.file(appJsFile).arrayBuffer()
const appJsVersion = Bun.hash(new Uint8Array(appJsBytes)).toString(16)

/** Versioned URL for the client script, for use in <script src="...">. */
export const APP_JS_PATH = `/app.js?v=${appJsVersion}`

/** Serves the app script with long-lived caching (safe: the URL is versioned). */
export function serveAppJs(): Response {
  return new Response(Bun.file(appJsFile), {
    headers: {
      'Content-Type': 'application/javascript; charset=utf-8',
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  })
}
