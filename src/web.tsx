import { Hono } from 'hono'
import {
  listTrackers,
  getTrackerById,
  trackerExists,
  createTracker,
  deleteTracker,
  generateUniqueSlug,
  listEventsByTracker,
  createEvent,
  deleteEvent,
} from './db'
import type { Tracker, TrackerEvent, TrackerType } from './types'
import { DashboardPage, TrackersGrid } from './views/dashboard'
import { DetailPage } from './views/detail'
import { TrackerCard } from './views/components/tracker-card'

export const webRouter = new Hono()

// GET / - Dashboard & Search (supports ?q= query param)
webRouter.get('/', (c) => {
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
  if (c.req.header('HX-Request')) {
    c.header('HX-Push-Url', q ? `/?q=${encodeURIComponent(rawQ.trim())}` : '/')
    return c.html(<TrackersGrid trackers={filtered} />)
  }

  return c.html(<DashboardPage trackers={filtered} query={rawQ.trim()} />)
})

// Sub-router for all /track operations
const trackRouter = new Hono()

// POST /track - Create new track
trackRouter.post('/', async (c) => {
  const body = await c.req.parseBody()
  const name = String(body['name'] || '').trim()
  if (!name) {
    return c.redirect('/')
  }

  const rawId = body['id'] ? String(body['id']).trim() : ''
  const id = rawId && !trackerExists(rawId) ? rawId : generateUniqueSlug(name)
  const type = (String(body['type'] || 'habit') as TrackerType) || 'habit'
  const description = body['description'] ? String(body['description']).trim() : null

  const tracker: Tracker = {
    id,
    name,
    type,
    description,
  }

  createTracker(tracker)
  return c.redirect('/')
})

// GET /track/:id - Single track detail
trackRouter.get('/:id', (c) => {
  const id = c.req.param('id')
  const tracker = getTrackerById(id)
  if (!tracker) {
    return c.redirect('/')
  }

  const events = listEventsByTracker(id, 100)
  return c.html(<DetailPage tracker={tracker} events={events} />)
})

// POST /track/:id - Log event (quick check-in from dashboard or modal from detail)
trackRouter.post('/:id', async (c) => {
  const id = c.req.param('id')
  const tracker = getTrackerById(id)
  if (!tracker) {
    return c.redirect('/')
  }

  const body = await c.req.parseBody()
  let value: number | null = null
  let note: string | null = null

  if (body['value'] !== undefined && body['value'] !== '') {
    const rawVal = body['value']
    const parsedVal = typeof rawVal === 'string' ? parseFloat(rawVal) : NaN
    value = isNaN(parsedVal) ? null : parsedVal
  }

  if (body['note']) {
    note = String(body['note']).trim() || null
  }

  let timestamp = new Date().toISOString()
  if (body['timestamp'] && typeof body['timestamp'] === 'string') {
    const parsedDate = new Date(body['timestamp'])
    if (!isNaN(parsedDate.getTime())) {
      timestamp = parsedDate.toISOString()
    }
  }

  const event: TrackerEvent = {
    id: crypto.randomUUID(),
    tracker_id: id,
    value,
    note,
    timestamp,
  }

  createEvent(event)

  // If return_to is specified (e.g. from dashboard modal), redirect there
  if (body['return_to'] && typeof body['return_to'] === 'string') {
    return c.redirect(body['return_to'])
  }

  // If HTMX requested card update from dashboard, return the card
  if (c.req.header('HX-Target') === `tracker-card-${id}`) {
    return c.html(<TrackerCard tracker={tracker} justLogged={true} />)
  }

  // Otherwise, default redirect to the track detail page
  return c.redirect(`/track/${id}`)
})

// DELETE /track/:id - Delete track
trackRouter.delete('/:id', (c) => {
  const id = c.req.param('id')
  deleteTracker(id)
  c.header('HX-Location', '/')
  return c.body(null, 200)
})

// DELETE /track/:id/:eventId - Delete single event
trackRouter.delete('/:id/:eventId', (c) => {
  const trackerId = c.req.param('id')
  const eventId = c.req.param('eventId')
  deleteEvent(trackerId, eventId)
  return c.body(null, 200)
})

// Mount trackRouter at /track
webRouter.route('/track', trackRouter)
