import { Hono } from 'hono'
import { serveStatic } from 'hono/bun'
import { webRouter } from './web'

const app = new Hono()

// Health check endpoint
app.get('/health', (c) => {
  return c.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Serve static assets from public/
app.use('/favicon.ico', serveStatic({ path: './public/favicon.ico' }))
app.use('/favicon.svg', serveStatic({ path: './public/favicon.svg' }))
app.use('/static/*', serveStatic({ root: './public' }))

// Mount Web & HTMX routes
app.route('/', webRouter)

const port = Number(process.env.PORT || 3000)

console.log(`🚀 Track server running on http://localhost:${port}`)

export default {
  port,
  fetch: app.fetch,
}
