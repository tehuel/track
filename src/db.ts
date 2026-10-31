import { Database } from 'bun:sqlite'
import type { Tracker, TrackerEvent } from './types'
import { slugify } from './slug'

const DEFAULT_DB_PATH = process.env.DB_PATH || 'tracker.db'

export function createDatabase(path: string = DEFAULT_DB_PATH): Database {
  const db = new Database(path)
  db.exec('PRAGMA journal_mode = WAL;')
  db.exec('PRAGMA foreign_keys = ON;')

  // Initialize schema if not exists
  db.exec(`
    CREATE TABLE IF NOT EXISTS trackers (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      type TEXT NOT NULL DEFAULT 'habit',
      description TEXT,
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

  return db
}

export const db = createDatabase()

// --- Tracker Queries ---

export function listTrackers(database: Database = db): Tracker[] {
  const query = database.query<Tracker, []>(
    'SELECT id, name, type, description, created_at FROM trackers ORDER BY created_at ASC'
  )
  return query.all()
}

export function getTrackerById(id: string, database: Database = db): Tracker | null {
  const query = database.query<Tracker, [string]>(
    'SELECT id, name, type, description, created_at FROM trackers WHERE id = ?'
  )
  return query.get(id)
}

export function trackerExists(id: string, database: Database = db): boolean {
  const query = database.query<{ count: number }, [string]>(
    'SELECT COUNT(*) as count FROM trackers WHERE id = ?'
  )
  const result = query.get(id)
  return (result?.count ?? 0) > 0
}

export function generateUniqueSlug(name: string, database: Database = db): string {
  const baseSlug = slugify(name)
  if (!trackerExists(baseSlug, database)) {
    return baseSlug
  }
  return `${baseSlug}-${crypto.randomUUID().slice(0, 4)}`
}

export function createTracker(tracker: Tracker, database: Database = db): Tracker {
  const query = database.query<never, [string, string, string, string | null]>(
    'INSERT INTO trackers (id, name, type, description) VALUES (?, ?, ?, ?)'
  )
  query.run(tracker.id, tracker.name, tracker.type, tracker.description ?? null)
  return getTrackerById(tracker.id, database)!
}

export function deleteTracker(id: string, database: Database = db): boolean {
  const query = database.query<never, [string]>('DELETE FROM trackers WHERE id = ?')
  const result = query.run(id)
  return result.changes > 0
}

// --- Event Queries ---

export function listEventsByTracker(
  trackerId: string,
  limit: number = 50,
  database: Database = db
): TrackerEvent[] {
  const query = database.query<TrackerEvent, [string, number]>(
    'SELECT id, tracker_id, value, note, timestamp FROM tracker_events WHERE tracker_id = ? ORDER BY timestamp DESC LIMIT ?'
  )
  return query.all(trackerId, limit)
}

export function createEvent(event: TrackerEvent, database: Database = db): TrackerEvent {
  const query = database.query<never, [string, string, number | null, string | null, string]>(
    'INSERT INTO tracker_events (id, tracker_id, value, note, timestamp) VALUES (?, ?, ?, ?, ?)'
  )
  query.run(
    event.id,
    event.tracker_id,
    event.value ?? null,
    event.note ?? null,
    event.timestamp
  )
  const fetchQuery = database.query<TrackerEvent, [string]>(
    'SELECT id, tracker_id, value, note, timestamp FROM tracker_events WHERE id = ?'
  )
  return fetchQuery.get(event.id)!
}

export function deleteEvent(trackerId: string, eventId: string, database: Database = db): boolean {
  const query = database.query<never, [string, string]>(
    'DELETE FROM tracker_events WHERE id = ? AND tracker_id = ?'
  )
  const result = query.run(eventId, trackerId)
  return result.changes > 0
}
