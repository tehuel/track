import { Database } from 'bun:sqlite'
import { defaultChartMode, type ChartMode, type Track, type TrackEvent } from './types'

const dbPath =
  process.env.NODE_ENV === 'test' ? ':memory:' : process.env.DB_PATH || 'track.db'

// `strict: true` allows binding named parameters (`$name`) from plain object keys (`{ name }`).
export const db = new Database(dbPath, { strict: true })

// WAL is opt-in (`DB_WAL=true`) because it creates `-wal`/`-shm` side files next to the DB.
// The journal mode persists in the file, so set it explicitly to revert databases that used WAL.
const useWal = ['1', 'true'].includes(process.env.DB_WAL?.trim().toLowerCase() ?? '')
db.exec(`PRAGMA journal_mode = ${useWal ? 'WAL' : 'DELETE'};`)
db.exec('PRAGMA foreign_keys = ON;')

const CHART_COLUMNS = ['chart_dashboard', 'chart_7d', 'chart_30d', 'chart_12m'] as const

db.exec(`
  CREATE TABLE IF NOT EXISTS tracks (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'habit',
    description TEXT,
    color TEXT,
    ${CHART_COLUMNS.map((col) => `${col} TEXT NOT NULL DEFAULT 'grid',`).join('\n    ')}
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
for (const col of CHART_COLUMNS) {
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
  SELECT id, name, type, description, color, ${CHART_COLUMNS.join(', ')}, created_at
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
  return getTrackById(baseSlug) ? `${baseSlug}-${crypto.randomUUID().slice(0, 4)}` : baseSlug
}

export function createTrack(track: Track): void {
  const fallback = defaultChartMode(track.type)
  db.query(
    `INSERT INTO tracks (id, name, type, description, color, ${CHART_COLUMNS.join(', ')})
     VALUES ($id, $name, $type, $description, $color, ${CHART_COLUMNS.map((c) => `$${c}`).join(', ')})`
  ).run({
    id: track.id,
    name: track.name,
    type: track.type,
    description: track.description ?? null,
    color: track.color ?? null,
    chart_dashboard: track.chart_dashboard ?? fallback,
    chart_7d: track.chart_7d ?? fallback,
    chart_30d: track.chart_30d ?? fallback,
    chart_12m: track.chart_12m ?? fallback,
  })
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
  // Chart modes are optional: omitted values keep the current column value.
  db.query(
    `UPDATE tracks
     SET name = $name,
         description = $description,
         color = $color,
         ${CHART_COLUMNS.map((c) => `${c} = COALESCE($${c}, ${c})`).join(',\n         ')}
     WHERE id = $id`
  ).run({
    id,
    name: data.name,
    description: data.description ?? null,
    color: data.color ?? null,
    chart_dashboard: data.chart_dashboard ?? null,
    chart_7d: data.chart_7d ?? null,
    chart_30d: data.chart_30d ?? null,
    chart_12m: data.chart_12m ?? null,
  })
}

export function deleteTrack(id: string): void {
  db.query('DELETE FROM tracks WHERE id = ?').run(id)
}

// --- Event Queries ---

const EVENT_SELECT = 'SELECT id, track_id, value, note, timestamp FROM track_events'

export function listEventsByTrack(trackId: string, limit: number = 50): TrackEvent[] {
  return db
    .query<TrackEvent, [string, number]>(
      `${EVENT_SELECT} WHERE track_id = ? ORDER BY timestamp DESC LIMIT ?`
    )
    .all(trackId, limit)
}

export function createEvent(event: TrackEvent): void {
  db.query(
    `INSERT INTO track_events (id, track_id, value, note, timestamp)
     VALUES ($id, $track_id, $value, $note, $timestamp)`
  ).run({
    id: event.id,
    track_id: event.track_id,
    value: event.value ?? null,
    note: event.note ?? null,
    timestamp: event.timestamp,
  })
}

export function deleteEvent(trackId: string, eventId: string): void {
  db.query('DELETE FROM track_events WHERE id = ? AND track_id = ?').run(eventId, trackId)
}

// --- Export Queries ---

export interface TrackWithEvents extends Track {
  events: TrackEvent[]
}

export function getAllDataForExport(): TrackWithEvents[] {
  const allEvents = db
    .query<TrackEvent, []>(`${EVENT_SELECT} ORDER BY timestamp DESC`)
    .all()
  const eventsByTrack = Map.groupBy(allEvents, (event) => event.track_id)

  return listTracks().map((track) => ({
    ...track,
    events: eventsByTrack.get(track.id) ?? [],
  }))
}

// --- Aggregation Queries ---

export type TotalsBucket = 'day' | 'month'

/** Length of the ISO timestamp prefix used as bucket key (`YYYY-MM-DD` / `YYYY-MM`). */
const BUCKET_KEY_LENGTH: Record<TotalsBucket, number> = { day: 10, month: 7 }

/**
 * Accumulates a track's events per time bucket, keyed by ISO date (`YYYY-MM-DD`)
 * or month (`YYYY-MM`), starting at `sinceKey` (inclusive).
 * Numeric tracks sum `value`; habit/text tracks count events.
 * Buckets without events are omitted.
 */
export function getEventTotals(
  track: Track,
  bucket: TotalsBucket,
  sinceKey: string
): Map<string, number> {
  const aggregate = track.type === 'numeric' ? 'SUM(COALESCE(value, 0))' : 'COUNT(*)'
  const rows = db
    .query<{ key: string; total: number }, { keyLen: number; trackId: string; sinceKey: string }>(
      `SELECT substr(timestamp, 1, $keyLen) AS key, ${aggregate} AS total
       FROM track_events
       WHERE track_id = $trackId AND timestamp >= $sinceKey
       GROUP BY key`
    )
    .all({ keyLen: BUCKET_KEY_LENGTH[bucket], trackId: track.id, sinceKey })

  return new Map(rows.map((r) => [r.key, Number(r.total)]))
}
