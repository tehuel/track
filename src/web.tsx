import { Hono } from 'hono'
import {
  listTrackers,
  getTrackerById,
  createTracker,
  updateTracker,
  deleteTracker,
  generateUniqueSlug,
  listEventsByTracker,
  createEvent,
  deleteEvent,
} from './db'
import { parseTrackerColor, type TrackerType } from './types'
import { DashboardPage, TrackersGrid, TrackerCard } from './views/dashboard'
import { DetailPage } from './views/detail'

export const app = new Hono()

// GET / - Dashboard & Search (supports ?q= query param)
app.get('/', (c) => {
  const rawQ = c.req.query('q') || ''
  const q = rawQ.toLowerCase().trim()
  const all = listTrackers()
  const filtered = q
    ? all.filter(
        (t) =>
          t.name.toLowerCase().includes(q) ||
          (t.description && t.description.toLowerCase().includes(q))
      )
    : all

  // If HTMX requested just the grid partial, return TrackersGrid with clean URL push
  if (c.req.header('HX-Target') === 'trackers-grid') {
    c.header('HX-Push-Url', q ? `/?q=${encodeURIComponent(rawQ.trim())}` : '/')
    return c.html(<TrackersGrid trackers={filtered} />)
  }

  return c.html(<DashboardPage trackers={filtered} query={rawQ.trim()} />)
})

// POST /track - Create new track
app.post('/track', async (c) => {
  const body = await c.req.parseBody()
  const name = String(body['name'] || '').trim()
  if (!name) {
    return c.redirect('/')
  }

  createTracker({
    id: generateUniqueSlug(name),
    name,
    type: (String(body['type'] || 'habit') as TrackerType) || 'habit',
    description: body['description'] ? String(body['description']).trim() : null,
    color: parseTrackerColor(body['color']),
  })
  return c.redirect('/')
})

// POST /track/:id/edit - Update track details
app.post('/track/:id/edit', async (c) => {
  const id = c.req.param('id')
  const tracker = getTrackerById(id)
  if (!tracker) {
    return c.redirect('/')
  }

  const body = await c.req.parseBody()
  const name = String(body['name'] || '').trim() || tracker.name

  updateTracker(id, {
    name,
    description: body['description'] ? String(body['description']).trim() : null,
    color: parseTrackerColor(body['color']),
  })
  return c.redirect(`/track/${id}`)
})

// GET /track/:id - Single track detail
app.get('/track/:id', (c) => {
  const id = c.req.param('id')
  const tracker = getTrackerById(id)
  if (!tracker) {
    return c.redirect('/')
  }

  const events = listEventsByTracker(id, 100)
  return c.html(<DetailPage tracker={tracker} events={events} />)
})

// POST /track/:id - Log event (quick check-in from dashboard or modal from detail)
app.post('/track/:id', async (c) => {
  const id = c.req.param('id')
  const tracker = getTrackerById(id)
  if (!tracker) {
    return c.redirect('/')
  }

  const body = await c.req.parseBody()
  const parsedVal = parseFloat(String(body['value'] ?? ''))
  const value = Number.isNaN(parsedVal) ? null : parsedVal
  const note = String(body['note'] || '').trim() || null
  const parsedDate = body['timestamp'] ? new Date(String(body['timestamp'])) : null
  const timestamp =
    parsedDate && !Number.isNaN(parsedDate.getTime())
      ? parsedDate.toISOString()
      : new Date().toISOString()

  createEvent({
    id: crypto.randomUUID(),
    tracker_id: id,
    value,
    note,
    timestamp,
  })

  // If HTMX requested card update from dashboard, return the card
  if (c.req.header('HX-Target') === `tracker-card-${id}`) {
    c.header('HX-Trigger', JSON.stringify({ showToast: `Entrada registrada en ${tracker.name}` }))
    return c.html(<TrackerCard tracker={tracker} />)
  }

  // Otherwise, default redirect to the track detail page
  return c.redirect(`/track/${id}`)
})

// DELETE /track/:id - Delete track
app.delete('/track/:id', (c) => {
  const id = c.req.param('id')
  deleteTracker(id)
  c.header('HX-Location', '/')
  return c.body(null, 200)
})

// DELETE /track/:id/:eventId - Delete single event
app.delete('/track/:id/:eventId', (c) => {
  const trackerId = c.req.param('id')
  const eventId = c.req.param('eventId')
  deleteEvent(trackerId, eventId)
  c.header('HX-Location', `/track/${trackerId}`)
  return c.body(null, 200)
})
