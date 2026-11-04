import { Hono, type Context } from 'hono'
import {
  listTracks,
  getTrackById,
  createTrack,
  updateTrack,
  deleteTrack,
  generateUniqueSlug,
  listEventsByTrack,
  createEvent,
  deleteEvent,
} from './db'
import { parseTrackColor, parseTrackType, type Track } from './types'
import { DashboardPage, TrackersGrid, TrackerCard } from './views/dashboard'
import { DetailPage, EventsSection } from './views/detail'

export const app = new Hono()

const EVENTS_LIMIT = 100

// --- Helpers ---------------------------------------------------------------

type FormBody = Record<string, string | File | (string | File)[]>

/** Trimmed string field; empty values become `null`. */
function field(body: FormBody, key: string): string | null {
  return String(body[key] ?? '').trim() || null
}

/** Navigate after a mutation: `HX-Location` for HTMX, 302 redirect otherwise. */
function navigate(c: Context, path: string) {
  if (c.req.header('HX-Request')) {
    c.header('HX-Location', path)
    return c.body(null, 200)
  }
  return c.redirect(path)
}

function toast(c: Context, message: string) {
  c.header('HX-Trigger', JSON.stringify({ showToast: message }))
}

function renderEventsSection(c: Context, tracker: Track) {
  const events = listEventsByTrack(tracker.id, EVENTS_LIMIT)
  return c.html(<EventsSection tracker={tracker} events={events} />)
}

/** Shared parsing for the create and edit tracker forms. */
function parseTrackerForm(body: FormBody) {
  return {
    name: field(body, 'name'),
    description: field(body, 'description'),
    color: parseTrackColor(body['color']),
  }
}

/** Parses and validates an event for the given tracker type. Returns `null` if invalid. */
function parseEventForm(tracker: Track, body: FormBody) {
  const rawValue = field(body, 'value')
  const parsedValue = rawValue === null ? NaN : Number(rawValue)
  const value = Number.isFinite(parsedValue) ? parsedValue : null
  const note = field(body, 'note')
  const rawTimestamp = field(body, 'timestamp')
  const date = rawTimestamp ? new Date(rawTimestamp) : new Date()
  const timestamp = Number.isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString()

  if (tracker.type === 'numeric' && value === null) return null
  if (tracker.type === 'text' && !note) return null
  return { value, note, timestamp }
}

// --- Routes ----------------------------------------------------------------

// GET / - Dashboard & Search (supports ?q= query param)
app.get('/', (c) => {
  const rawQ = c.req.query('q') || ''
  const q = rawQ.toLowerCase().trim()
  const all = listTracks()
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
  const { name, ...rest } = parseTrackerForm(body)
  if (!name) return c.text('El nombre es obligatorio', 400)

  createTrack({
    id: generateUniqueSlug(name),
    name,
    type: parseTrackType(body['type']),
    ...rest,
  })
  return navigate(c, '/')
})

// POST /track/:id/edit - Update track details
app.post('/track/:id/edit', async (c) => {
  const id = c.req.param('id')
  if (!getTrackById(id)) return navigate(c, '/')

  const { name, ...rest } = parseTrackerForm(await c.req.parseBody())
  if (!name) return c.text('El nombre es obligatorio', 400)

  updateTrack(id, { name, ...rest })
  return navigate(c, `/track/${id}`)
})

// GET /track/:id - Single track detail
app.get('/track/:id', (c) => {
  const id = c.req.param('id')
  const tracker = getTrackById(id)
  if (!tracker) return c.redirect('/')

  const events = listEventsByTrack(id, EVENTS_LIMIT)
  return c.html(<DetailPage tracker={tracker} events={events} />)
})

// POST /track/:id - Log event (quick log from dashboard card or modal from detail)
app.post('/track/:id', async (c) => {
  const id = c.req.param('id')
  const tracker = getTrackById(id)
  if (!tracker) return navigate(c, '/')

  const input = parseEventForm(tracker, await c.req.parseBody())
  if (!input) return c.text('Entrada inválida', 400)

  createEvent({ id: crypto.randomUUID(), track_id: id, ...input })
  toast(c, `Entrada registrada en ${tracker.name}`)

  switch (c.req.header('HX-Target')) {
    case `tracker-card-${id}`:
      return c.html(<TrackerCard tracker={tracker} />)
    case 'events-section':
      return renderEventsSection(c, tracker)
    default:
      return navigate(c, `/track/${id}`)
  }
})

// DELETE /track/:id - Delete track
app.delete('/track/:id', (c) => {
  deleteTrack(c.req.param('id'))
  return navigate(c, '/')
})

// DELETE /track/:id/:eventId - Delete single event
app.delete('/track/:id/:eventId', (c) => {
  const trackerId = c.req.param('id')
  deleteEvent(trackerId, c.req.param('eventId'))

  if (c.req.header('HX-Target') === 'events-section') {
    const tracker = getTrackById(trackerId)
    if (tracker) {
      toast(c, 'Entrada eliminada')
      return renderEventsSection(c, tracker)
    }
  }

  return navigate(c, `/track/${trackerId}`)
})
