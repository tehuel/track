import { Database } from 'bun:sqlite'
import {
  defaultChartMode,
  getTrackChartMode,
  type ChartMode,
  type ChartPeriod,
  type ChartPoint,
  type Track,
  type TrackEvent,
} from './types'

const dbPath =
  process.env.NODE_ENV === 'test' ? ':memory:' : process.env.DB_PATH || 'track.db'

export const db = new Database(dbPath)
db.exec('PRAGMA journal_mode = WAL;')
db.exec('PRAGMA foreign_keys = ON;')
db.exec(`
  CREATE TABLE IF NOT EXISTS tracks (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'habit',
    description TEXT,
    color TEXT,
    chart_dashboard TEXT NOT NULL DEFAULT 'grid',
    chart_7d TEXT NOT NULL DEFAULT 'grid',
    chart_30d TEXT NOT NULL DEFAULT 'grid',
    chart_12m TEXT NOT NULL DEFAULT 'grid',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS track_events (
    id TEXT PRIMARY KEY,
    track_id TEXT NOT NULL REFERENCES tracks(id) ON DELETE CASCADE,
    value REAL,
    note TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE INDEX IF NOT EXISTS idx_events_track_timestamp
    ON track_events(track_id, timestamp DESC);
`)

// Ensure existing databases have the chart mode columns
const existingCols = new Set(
  db
    .query<{ name: string }, []>('PRAGMA table_info(tracks)')
    .all()
    .map((c) => c.name)
)
for (const col of ['chart_dashboard', 'chart_7d', 'chart_30d', 'chart_12m']) {
  if (!existingCols.has(col)) {
    db.exec(`ALTER TABLE tracks ADD COLUMN ${col} TEXT NOT NULL DEFAULT 'grid'`)
  }
}

function slugify(text: string): string {
  const slug = text
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
  return slug || `track-${crypto.randomUUID().slice(0, 8)}`
}

// --- Track Queries ---

const TRACK_SELECT = `
  SELECT
    id, name, type, description, color,
    chart_dashboard, chart_7d, chart_30d, chart_12m,
    created_at
  FROM tracks
`

export function listTracks(): Track[] {
  return db.query<Track, []>(`${TRACK_SELECT} ORDER BY created_at ASC`).all()
}

export function getTrackById(id: string): Track | null {
  return db.query<Track, [string]>(`${TRACK_SELECT} WHERE id = ?`).get(id)
}

export function generateUniqueSlug(name: string): string {
  const baseSlug = slugify(name)
  if (!getTrackById(baseSlug)) {
    return baseSlug
  }
  return `${baseSlug}-${crypto.randomUUID().slice(0, 4)}`
}

export function createTrack(track: Track): void {
  const fallback = defaultChartMode(track.type)
  db.query<
    never,
    [string, string, string, string | null, string | null, string, string, string, string]
  >(
    `INSERT INTO tracks (
      id, name, type, description, color,
      chart_dashboard, chart_7d, chart_30d, chart_12m
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(
    track.id,
    track.name,
    track.type,
    track.description ?? null,
    track.color ?? null,
    track.chart_dashboard ?? fallback,
    track.chart_7d ?? fallback,
    track.chart_30d ?? fallback,
    track.chart_12m ?? fallback
  )
}

export function updateTrack(
  id: string,
  data: {
    name: string
    description?: string | null
    color?: string | null
    chart_dashboard?: ChartMode
    chart_7d?: ChartMode
    chart_30d?: ChartMode
    chart_12m?: ChartMode
  }
): void {
  db.query<
    never,
    [
      string,
      string | null,
      string | null,
      string | null,
      string | null,
      string | null,
      string | null,
      string,
    ]
  >(
    `UPDATE tracks
     SET name = ?,
         description = ?,
         color = ?,
         chart_dashboard = COALESCE(?, chart_dashboard),
         chart_7d = COALESCE(?, chart_7d),
         chart_30d = COALESCE(?, chart_30d),
         chart_12m = COALESCE(?, chart_12m)
     WHERE id = ?`
  ).run(
    data.name,
    data.description ?? null,
    data.color ?? null,
    data.chart_dashboard ?? null,
    data.chart_7d ?? null,
    data.chart_30d ?? null,
    data.chart_12m ?? null,
    id
  )
}

export function deleteTrack(id: string): void {
  db.query<never, [string]>('DELETE FROM tracks WHERE id = ?').run(id)
}

// --- Event Queries ---

export function listEventsByTrack(trackId: string, limit: number = 50): TrackEvent[] {
  return db
    .query<TrackEvent, [string, number]>(
      'SELECT id, track_id, value, note, timestamp FROM track_events WHERE track_id = ? ORDER BY timestamp DESC LIMIT ?'
    )
    .all(trackId, limit)
}

export function createEvent(event: TrackEvent): void {
  db.query<never, [string, string, number | null, string | null, string]>(
    'INSERT INTO track_events (id, track_id, value, note, timestamp) VALUES (?, ?, ?, ?, ?)'
  ).run(
    event.id,
    event.track_id,
    event.value ?? null,
    event.note ?? null,
    event.timestamp
  )
}

export function deleteEvent(trackId: string, eventId: string): void {
  db.query<never, [string, string]>(
    'DELETE FROM track_events WHERE id = ? AND track_id = ?'
  ).run(eventId, trackId)
}

// --- Export Queries ---

export interface TrackWithEvents extends Track {
  events: TrackEvent[]
}

export function getAllDataForExport(): TrackWithEvents[] {
  const tracks = listTracks()
  const allEvents = db
    .query<TrackEvent, []>(
      'SELECT id, track_id, value, note, timestamp FROM track_events ORDER BY timestamp DESC'
    )
    .all()

  const eventsByTrack = new Map<string, TrackEvent[]>()
  for (const event of allEvents) {
    const list = eventsByTrack.get(event.track_id)
    if (list) {
      list.push(event)
    } else {
      eventsByTrack.set(event.track_id, [event])
    }
  }

  return tracks.map((track) => ({
    ...track,
    events: eventsByTrack.get(track.id) ?? [],
  }))
}

// --- Chart Series Aggregation Queries ---

const WEEKDAYS_SHORT = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
const MONTHS_SHORT = [
  'Ene',
  'Feb',
  'Mar',
  'Abr',
  'May',
  'Jun',
  'Jul',
  'Ago',
  'Sep',
  'Oct',
  'Nov',
  'Dic',
]

interface BucketRow {
  key: string
  total: number
}

function queryBucketTotals(
  track: Track,
  keyLen: 7 | 10,
  startKey: string
): Map<string, number> {
  const rows = db
    .query<BucketRow, [number, string, string, number, string, number]>(
      `SELECT
         substr(timestamp, 1, ?) AS key,
         COALESCE(SUM(CASE WHEN ? = 'numeric' THEN COALESCE(value, 0) ELSE 1 END), 0) AS total
       FROM track_events
       WHERE track_id = ? AND substr(timestamp, 1, ?) >= ?
       GROUP BY substr(timestamp, 1, ?)`
    )
    .all(keyLen, track.type, track.id, keyLen, startKey, keyLen)

  return new Map(rows.map((r) => [r.key, Number(r.total)]))
}

/**
 * Returns a continuous time series of accumulated values (`SUM(value)` for
 * numeric tracks, `COUNT(*)` for habit/text tracks) for the requested view.
 *
 * - `dashboard` / `7d`: 7 daily points
 * - `30d`: 30 daily points
 * - `12m`: 364 daily points (52×7 heatmap) when mode is `grid`, or 12 monthly points when mode is `bars`/`line`
 */
export function getTrackSeries(
  track: Track,
  view: 'dashboard' | ChartPeriod,
  now: Date = new Date()
): ChartPoint[] {
  const mode = getTrackChartMode(track, view)

  if (view === '12m' && mode !== 'grid') {
    const endYear = now.getUTCFullYear()
    const endMonth = now.getUTCMonth()
    const startKey = new Date(Date.UTC(endYear, endMonth - 11, 1))
      .toISOString()
      .slice(0, 7)
    const totals = queryBucketTotals(track, 7, startKey)

    return Array.from({ length: 12 }, (_, idx) => {
      const d = new Date(Date.UTC(endYear, endMonth - (11 - idx), 1))
      const y = d.getUTCFullYear()
      const m = d.getUTCMonth()
      const key = `${y}-${String(m + 1).padStart(2, '0')}`
      const shortLabel = MONTHS_SHORT[m] ?? ''
      return {
        key,
        label: `${shortLabel} ${y}`,
        shortLabel,
        value: totals.get(key) ?? 0,
      }
    })
  }

  const days = view === '12m' ? 364 : view === '30d' ? 30 : 7
  const todayUtc = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
  const startUtc = todayUtc - (days - 1) * 86_400_000
  const totals = queryBucketTotals(
    track,
    10,
    new Date(startUtc).toISOString().slice(0, 10)
  )

  return Array.from({ length: days }, (_, i) => {
    const d = new Date(startUtc + i * 86_400_000)
    const key = d.toISOString().slice(0, 10)
    const dayNum = d.getUTCDate()
    const weekday = WEEKDAYS_SHORT[d.getUTCDay()] ?? ''
    const month = MONTHS_SHORT[d.getUTCMonth()]?.toLowerCase() ?? ''
    return {
      key,
      label: `${weekday} ${dayNum} ${month}`,
      shortLabel: days === 7 ? weekday : String(dayNum),
      value: totals.get(key) ?? 0,
    }
  })
}
