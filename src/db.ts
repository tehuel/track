import { Database } from 'bun:sqlite'
import type { Track, TrackEvent } from './types'

const dbPath =
  process.env.NODE_ENV === 'test' ? ':memory:' : process.env.DB_PATH || 'tracker.db'

export const db = new Database(dbPath)
db.exec('PRAGMA journal_mode = WAL;')
db.exec('PRAGMA foreign_keys = ON;')
db.exec(`
  CREATE TABLE IF NOT EXISTS trackers (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'habit',
    description TEXT,
    color TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS tracker_events (
    id TEXT PRIMARY KEY,
    tracker_id TEXT NOT NULL REFERENCES trackers(id) ON DELETE CASCADE,
    value REAL,
    note TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE INDEX IF NOT EXISTS idx_events_tracker_timestamp
    ON tracker_events(tracker_id, timestamp DESC);
`)

function slugify(text: string): string {
  const slug = text
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
  return slug || `tracker-${crypto.randomUUID().slice(0, 8)}`
}

// --- Tracker Queries ---

export function listTrackers(): Track[] {
  return db
    .query<Track, []>(
      'SELECT id, name, type, description, color, created_at FROM trackers ORDER BY created_at ASC'
    )
    .all()
}

export function getTrackerById(id: string): Track | null {
  return db
    .query<Track, [string]>(
      'SELECT id, name, type, description, color, created_at FROM trackers WHERE id = ?'
    )
    .get(id)
}

export function generateUniqueSlug(name: string): string {
  const baseSlug = slugify(name)
  if (!getTrackerById(baseSlug)) {
    return baseSlug
  }
  return `${baseSlug}-${crypto.randomUUID().slice(0, 4)}`
}

export function createTracker(tracker: Track): void {
  db.query<never, [string, string, string, string | null, string | null]>(
    'INSERT INTO trackers (id, name, type, description, color) VALUES (?, ?, ?, ?, ?)'
  ).run(
    tracker.id,
    tracker.name,
    tracker.type,
    tracker.description ?? null,
    tracker.color ?? null
  )
}

export function updateTracker(
  id: string,
  data: { name: string; description?: string | null; color?: string | null }
): void {
  db.query<never, [string, string | null, string | null, string]>(
    'UPDATE trackers SET name = ?, description = ?, color = ? WHERE id = ?'
  ).run(data.name, data.description ?? null, data.color ?? null, id)
}

export function deleteTracker(id: string): void {
  db.query<never, [string]>('DELETE FROM trackers WHERE id = ?').run(id)
}

// --- Event Queries ---

export function listEventsByTracker(trackerId: string, limit: number = 50): TrackEvent[] {
  return db
    .query<TrackEvent, [string, number]>(
      'SELECT id, tracker_id, value, note, timestamp FROM tracker_events WHERE tracker_id = ? ORDER BY timestamp DESC LIMIT ?'
    )
    .all(trackerId, limit)
}

export function createEvent(event: TrackEvent): void {
  db.query<never, [string, string, number | null, string | null, string]>(
    'INSERT INTO tracker_events (id, tracker_id, value, note, timestamp) VALUES (?, ?, ?, ?, ?)'
  ).run(
    event.id,
    event.tracker_id,
    event.value ?? null,
    event.note ?? null,
    event.timestamp
  )
}

export function deleteEvent(trackerId: string, eventId: string): void {
  db.query<never, [string, string]>(
    'DELETE FROM tracker_events WHERE id = ? AND tracker_id = ?'
  ).run(eventId, trackerId)
}
