// @ts-expect-error Bun embedded file import
import faviconIco from '../public/favicon.ico' with { type: 'file' }
// @ts-expect-error Bun embedded file import
import faviconSvg from '../public/favicon.svg' with { type: 'file' }
import { app } from './web'
import { serveAppJs } from './assets'

// Health check endpoint
app.get('/health', (c) => {
  return c.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Serve static assets from public/
app.get('/favicon.ico', () => new Response(Bun.file(faviconIco)))
app.get('/favicon.svg', () => new Response(Bun.file(faviconSvg)))
app.get('/app.js', () => serveAppJs())

const port = Number(process.env.PORT || 3000)

if (process.env.NODE_ENV !== 'test') {
  console.log(`🚀 Track server running on http://localhost:${port}`)
}

export { app }
export default {
  port,
  fetch: app.fetch,
}
