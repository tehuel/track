// Versioned static assets: content-hashed URLs (`/app.js?v=<hash>`) force
// browsers to fetch fresh copies whenever the file changes, which keeps
// `immutable` caching safe.

// @ts-expect-error Bun embedded file import
import appJsFile from '../public/app.js' with { type: 'file' }
// @ts-expect-error Bun embedded file import
import themeJsFile from '../public/theme.js' with { type: 'file' }
// @ts-expect-error Bun embedded file import
import bootstrapCssFile from 'bootstrap/dist/css/bootstrap.min.css' with { type: 'file' }
// @ts-expect-error Bun embedded file import
import bootstrapJsFile from 'bootstrap/dist/js/bootstrap.min.js' with { type: 'file' }
// @ts-expect-error Bun embedded file import
import htmxJsFile from 'htmx.org/dist/htmx.min.js' with { type: 'file' }

const appJsBytes = await Bun.file(appJsFile).arrayBuffer()
const appJsVersion = Bun.hash(new Uint8Array(appJsBytes)).toString(16)

/** Versioned URL for the client script, for use in <script src="...">. */
export const APP_JS_PATH = `/app.js?v=${appJsVersion}`
export const THEME_JS_PATH = '/theme.js'
export const BOOTSTRAP_CSS_PATH = '/vendor/bootstrap.min.css'
export const BOOTSTRAP_JS_PATH = '/vendor/bootstrap.min.js'
export const HTMX_JS_PATH = '/vendor/htmx.min.js'

/** Serves the app script with long-lived caching (safe: the URL is versioned). */
export function serveAppJs(): Response {
  return serveAsset(appJsFile, 'application/javascript; charset=utf-8')
}

export function serveThemeJs(): Response {
  return serveAsset(themeJsFile, 'application/javascript; charset=utf-8')
}

function serveAsset(file: string, contentType: string): Response {
  return new Response(Bun.file(file), {
    headers: {
      'Content-Type': contentType,
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  })
}

export function serveVendorAsset(path: string): Response {
  switch (path) {
    case BOOTSTRAP_CSS_PATH:
      return serveAsset(bootstrapCssFile, 'text/css; charset=utf-8')
    case BOOTSTRAP_JS_PATH:
      return serveAsset(bootstrapJsFile, 'application/javascript; charset=utf-8')
    case HTMX_JS_PATH:
      return serveAsset(htmxJsFile, 'application/javascript; charset=utf-8')
    default:
      return new Response('Not found', { status: 404 })
  }
}
