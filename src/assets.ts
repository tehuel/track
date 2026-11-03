// Versioned static assets: content-hashed URLs (`/app.js?v=<hash>`) force
// browsers to fetch fresh copies whenever the file changes, which keeps
// `immutable` caching safe.

// @ts-expect-error Bun embedded file import
import appJsFile from '../public/app.js' with { type: 'file' }
// @ts-expect-error Bun embedded file import
import bootstrapCssFile from '../public/vendor/bootstrap.min.css' with { type: 'file' }
// @ts-expect-error Bun embedded file import
import bootstrapJsFile from '../public/vendor/bootstrap.min.js' with { type: 'file' }
// @ts-expect-error Bun embedded file import
import htmxJsFile from '../public/vendor/htmx.min.js' with { type: 'file' }

const appJsBytes = await Bun.file(appJsFile).arrayBuffer()
const appJsVersion = Bun.hash(new Uint8Array(appJsBytes)).toString(16)

/** Versioned URL for the client script, for use in <script src="...">. */
export const APP_JS_PATH = `/app.js?v=${appJsVersion}`
export const BOOTSTRAP_CSS_PATH = '/vendor/bootstrap.min.css'
export const BOOTSTRAP_JS_PATH = '/vendor/bootstrap.min.js'
export const HTMX_JS_PATH = '/vendor/htmx.min.js'

/** Serves the app script with long-lived caching (safe: the URL is versioned). */
export function serveAppJs(): Response {
  return new Response(Bun.file(appJsFile), {
    headers: {
      'Content-Type': 'application/javascript; charset=utf-8',
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  })
}

function serveAsset(file: string, contentType: string): Response {
  return new Response(Bun.file(file), {
    headers: {
      'Content-Type': contentType,
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  })
}

export function serveBootstrapCss(): Response {
  return serveAsset(bootstrapCssFile, 'text/css; charset=utf-8')
}

export function serveBootstrapJs(): Response {
  return serveAsset(bootstrapJsFile, 'application/javascript; charset=utf-8')
}

export function serveHtmxJs(): Response {
  return serveAsset(htmxJsFile, 'application/javascript; charset=utf-8')
}
