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
import { LogEntryPage } from './views/log-entry'
import { TrackerCard } from './views/components/tracker-card'

export const webRouter = new Hono()

// GET / - Dashboard
webRouter.get('/', (c) => {
  const trackers = listTrackers()
  return c.html(<DashboardPage trackers={trackers} />)
})

// GET /search - Live search HTMX partial
webRouter.get('/search', (c) => {
  const q = (c.req.query('q') || '').toLowerCase().trim()
  const all = listTrackers()
  const filtered = q
    ? all.filter(
        (t) =>
          t.name.toLowerCase().includes(q) ||
          (t.description && t.description.toLowerCase().includes(q))
      )
    : all

  return c.html(<TrackersGrid trackers={filtered} />)
})

// POST /trackers - Create new tracker
webRouter.post('/trackers', async (c) => {
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

// GET /trackers/:id - Single tracker detail
webRouter.get('/trackers/:id', (c) => {
  const id = c.req.param('id')
  const tracker = getTrackerById(id)
  if (!tracker) {
    return c.redirect('/')
  }

  const events = listEventsByTracker(id, 100)
  return c.html(<DetailPage tracker={tracker} events={events} />)
})

// GET /trackers/:id/log - Full-page entry logger
webRouter.get('/trackers/:id/log', (c) => {
  const id = c.req.param('id')
  const tracker = getTrackerById(id)
  if (!tracker) {
    return c.redirect('/')
  }

  return c.html(<LogEntryPage tracker={tracker} />)
})

// POST /trackers/:id/quick - Quick-log action (Habit, Numeric, or Text)
webRouter.post('/trackers/:id/quick', async (c) => {
  const id = c.req.param('id')
  const tracker = getTrackerById(id)
  if (!tracker) {
    return c.text('Not found', 404)
  }

  const body = await c.req.parseBody()
  let value: number | null = null
  let note: string | null = null

  if (tracker.type === 'numeric') {
    const rawVal = body['value']
    const parsed = typeof rawVal === 'string' ? parseFloat(rawVal) : NaN
    value = isNaN(parsed) ? null : parsed
  } else if (tracker.type === 'text') {
    note = body['note'] ? String(body['note']).trim() : null
  }

  const event: TrackerEvent = {
    id: crypto.randomUUID(),
    tracker_id: id,
    value,
    note,
    timestamp: new Date().toISOString(),
  }

  createEvent(event)
  return c.html(<TrackerCard tracker={tracker} justLogged={true} />)
})

// POST /trackers/:id/events - Save entry from detailed form
webRouter.post('/trackers/:id/events', async (c) => {
  const id = c.req.param('id')
  const tracker = getTrackerById(id)
  if (!tracker) {
    return c.redirect('/')
  }

  const body = await c.req.parseBody()
  const rawVal = body['value']
  const parsedVal = typeof rawVal === 'string' && rawVal !== '' ? parseFloat(rawVal) : NaN
  const value = isNaN(parsedVal) ? null : parsedVal
  const note = body['note'] ? String(body['note']).trim() : null

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
  return c.redirect(`/trackers/${id}`)
})

// DELETE /trackers/:id/events/:eventId - Delete single event
webRouter.delete('/trackers/:id/events/:eventId', (c) => {
  const trackerId = c.req.param('id')
  const eventId = c.req.param('eventId')
  deleteEvent(trackerId, eventId)
  return c.body(null, 200)
})

// DELETE /trackers/:id - Delete tracker
webRouter.delete('/trackers/:id', (c) => {
  const id = c.req.param('id')
  deleteTracker(id)
  c.header('HX-Location', '/')
  return c.body(null, 200)
})
