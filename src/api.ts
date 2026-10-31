import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { createTrackerSchema, createEventSchema } from './schemas'
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
import type { Tracker, TrackerEvent } from './types'

export const apiRouter = new Hono()

// GET /api/trackers - List all trackers
apiRouter.get('/trackers', (c) => {
  const trackers = listTrackers()
  return c.json(trackers)
})

// POST /api/trackers - Create a new tracker
apiRouter.post(
  '/trackers',
  zValidator('json', createTrackerSchema, (result, c) => {
    if (!result.success) {
      return c.json({ error: 'INVALID_REQUEST', details: result.error.flatten() }, 400)
    }
  }),
  (c) => {
    const body = c.req.valid('json')

    let id: string
    if (body.id && body.id.trim().length > 0) {
      id = body.id.trim()
      if (trackerExists(id)) {
        return c.json({ error: 'TRACKER_ALREADY_EXISTS' }, 409)
      }
    } else {
      id = generateUniqueSlug(body.name)
    }

    const tracker: Tracker = {
      id,
      name: body.name.trim(),
      type: body.type || 'habit',
      description: body.description?.trim() || null,
    }

    const created = createTracker(tracker)
    return c.json(created, 201)
  }
)

// GET /api/trackers/:id - Get tracker by ID
apiRouter.get('/trackers/:id', (c) => {
  const id = c.req.param('id')
  const tracker = getTrackerById(id)
  if (!tracker) {
    return c.json({ error: 'TRACKER_NOT_FOUND' }, 404)
  }
  return c.json(tracker)
})

// DELETE /api/trackers/:id - Delete tracker and cascading events
apiRouter.delete('/trackers/:id', (c) => {
  const id = c.req.param('id')
  const deleted = deleteTracker(id)
  if (!deleted) {
    return c.json({ error: 'TRACKER_NOT_FOUND' }, 404)
  }
  return c.json({ success: true })
})

// GET /api/trackers/:id/events - List events for tracker
apiRouter.get('/trackers/:id/events', (c) => {
  const trackerId = c.req.param('id')
  if (!trackerExists(trackerId)) {
    return c.json({ error: 'TRACKER_NOT_FOUND' }, 404)
  }

  const limitParam = c.req.query('limit')
  const parsedLimit = limitParam !== undefined ? parseInt(limitParam, 10) : NaN
  const limit = isNaN(parsedLimit) ? 50 : Math.min(Math.max(parsedLimit, 1), 500)

  const events = listEventsByTracker(trackerId, limit)
  return c.json(events)
})

// POST /api/trackers/:id/events - Log an event for tracker
apiRouter.post(
  '/trackers/:id/events',
  zValidator('json', createEventSchema, (result, c) => {
    if (!result.success) {
      return c.json({ error: 'INVALID_REQUEST', details: result.error.flatten() }, 400)
    }
  }),
  (c) => {
    const trackerId = c.req.param('id')
    if (!trackerExists(trackerId)) {
      return c.json({ error: 'TRACKER_NOT_FOUND' }, 404)
    }

    const body = c.req.valid('json')

    const event: TrackerEvent = {
      id: crypto.randomUUID(),
      tracker_id: trackerId,
      value: typeof body.value === 'number' ? body.value : null,
      note: typeof body.note === 'string' ? body.note.trim() : null,
      timestamp: body.timestamp || new Date().toISOString(),
    }

    const created = createEvent(event)
    return c.json(created, 201)
  }
)

// DELETE /api/trackers/:id/events/:eventId - Delete a logged event
apiRouter.delete('/trackers/:id/events/:eventId', (c) => {
  const trackerId = c.req.param('id')
  const eventId = c.req.param('eventId')

  if (!trackerExists(trackerId)) {
    return c.json({ error: 'TRACKER_NOT_FOUND' }, 404)
  }

  const deleted = deleteEvent(trackerId, eventId)
  if (!deleted) {
    return c.json({ error: 'EVENT_NOT_FOUND' }, 404)
  }

  return c.json({ success: true })
})
