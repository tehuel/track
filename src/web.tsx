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
  getAllDataForExport,
} from './db'
import { getTrackSeries } from './series'
import {
  parseChartMode,
  parseChartPeriod,
  parseTrackColor,
  parseTrackType,
  type ChartPeriod,
  type ChartPoint,
  type Track,
} from './types'
import { DashboardPage, TracksGrid, TrackCard } from './views/dashboard'
import { DetailPage, EventsSection, ChartSection } from './views/detail'

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

function buildDashboardSeries(tracks: Track[]): Record<string, ChartPoint[]> {
  const series: Record<string, ChartPoint[]> = {}
  for (const t of tracks) {
    series[t.id] = getTrackSeries(t, 'dashboard')
  }
  return series
}

function getRequestedPeriod(c: Context): ChartPeriod {
  const queryPeriod = c.req.query('period')
  if (queryPeriod) return parseChartPeriod(queryPeriod)
  const currentUrl = c.req.header('HX-Current-URL')
  if (currentUrl) {
    try {
      const url = new URL(currentUrl, 'http://localhost')
      return parseChartPeriod(url.searchParams.get('period'))
    } catch {
      // ignore malformed URL
    }
  }
  return '7d'
}

function renderEventsSection(c: Context, track: Track) {
  const events = listEventsByTrack(track.id, EVENTS_LIMIT)
  const period = getRequestedPeriod(c)
  const chartPoints = getTrackSeries(track, period)
  return c.html(
    <>
      <EventsSection track={track} events={events} />
      <ChartSection track={track} period={period} points={chartPoints} oob={true} />
    </>
  )
}

/** Shared parsing for the create and edit track forms. */
function parseTrackForm(body: FormBody) {
  return {
    name: field(body, 'name'),
    description: field(body, 'description'),
    color: parseTrackColor(body['color']),
    ...(body['chart_dashboard']
      ? { chart_dashboard: parseChartMode(body['chart_dashboard']) }
      : {}),
    ...(body['chart_7d'] ? { chart_7d: parseChartMode(body['chart_7d']) } : {}),
    ...(body['chart_30d'] ? { chart_30d: parseChartMode(body['chart_30d']) } : {}),
    ...(body['chart_12m'] ? { chart_12m: parseChartMode(body['chart_12m']) } : {}),
  }
}

/** Parses and validates an event for the given track type. Returns `null` if invalid. */
function parseEventForm(track: Track, body: FormBody) {
  const rawValue = field(body, 'value')
  const parsedValue = rawValue === null ? NaN : Number(rawValue)
  const value = Number.isFinite(parsedValue) ? parsedValue : null
  const note = field(body, 'note')
  const rawTimestamp = field(body, 'timestamp')
  const date = rawTimestamp
    ? new Date(rawTimestamp.endsWith('Z') ? rawTimestamp : `${rawTimestamp}Z`)
    : new Date()
  const timestamp = Number.isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString()

  if (track.type === 'numeric' && value === null) return null
  if (track.type === 'text' && !note) return null
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

  const series = buildDashboardSeries(filtered)

  // If HTMX requested just the grid partial, return TracksGrid with clean URL push
  if (c.req.header('HX-Target') === 'tracks-grid') {
    c.header('HX-Push-Url', q ? `/?q=${encodeURIComponent(rawQ.trim())}` : '/')
    return c.html(<TracksGrid tracks={filtered} series={series} />)
  }

  return c.html(
    <DashboardPage tracks={filtered} series={series} query={rawQ.trim()} />
  )
})

// GET /export - Export all tracks and events to JSON
app.get('/export', (c) => {
  const data = getAllDataForExport()
  const json = JSON.stringify(data, null, 2)
  const dateStr = new Date().toISOString().slice(0, 10)
  const filename = `track-export-${dateStr}.json`

  c.header('Content-Type', 'application/json; charset=utf-8')
  c.header('Content-Disposition', `attachment; filename="${filename}"`)
  return c.body(json)
})

// POST /track - Create new track
app.post('/track', async (c) => {
  const body = await c.req.parseBody()
  const { name, ...rest } = parseTrackForm(body)
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

  const { name, ...rest } = parseTrackForm(await c.req.parseBody())
  if (!name) return c.text('El nombre es obligatorio', 400)

  updateTrack(id, { name, ...rest })
  return navigate(c, `/track/${id}`)
})

// GET /track/:id - Single track detail (and HTMX chart partial swap for ?period=...)
app.get('/track/:id', (c) => {
  const id = c.req.param('id')
  const track = getTrackById(id)
  if (!track) return c.redirect('/')

  const period = parseChartPeriod(c.req.query('period'))
  const chartPoints = getTrackSeries(track, period)

  if (c.req.header('HX-Target') === 'chart-section') {
    c.header(
      'HX-Push-Url',
      period === '7d' ? `/track/${id}` : `/track/${id}?period=${period}`
    )
    return c.html(
      <ChartSection track={track} period={period} points={chartPoints} />
    )
  }

  const events = listEventsByTrack(id, EVENTS_LIMIT)
  return c.html(
    <DetailPage
      track={track}
      events={events}
      period={period}
      chartPoints={chartPoints}
    />
  )
})

// POST /track/:id - Log event (quick log from dashboard card or modal from detail)
app.post('/track/:id', async (c) => {
  const id = c.req.param('id')
  const track = getTrackById(id)
  if (!track) return navigate(c, '/')

  const input = parseEventForm(track, await c.req.parseBody())
  if (!input) return c.text('Entrada inválida', 400)

  createEvent({ id: crypto.randomUUID(), track_id: id, ...input })
  toast(c, `Entrada registrada en ${track.name}`)

  switch (c.req.header('HX-Target')) {
    case `track-card-${id}`:
      return c.html(
        <TrackCard track={track} points={getTrackSeries(track, 'dashboard')} />
      )
    case 'events-section':
      return renderEventsSection(c, track)
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
  const trackId = c.req.param('id')
  deleteEvent(trackId, c.req.param('eventId'))

  if (c.req.header('HX-Target') === 'events-section') {
    const track = getTrackById(trackId)
    if (track) {
      toast(c, 'Entrada eliminada')
      return renderEventsSection(c, track)
    }
  }

  return navigate(c, `/track/${trackId}`)
})
