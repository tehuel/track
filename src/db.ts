import { Database } from 'bun:sqlite'
import type { Track, TrackEvent } from './types'

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

export function listTracks(): Track[] {
  return db
    .query<Track, []>(
      'SELECT id, name, type, description, color, created_at FROM tracks ORDER BY created_at ASC'
    )
    .all()
}

export function getTrackById(id: string): Track | null {
  return db
    .query<Track, [string]>(
      'SELECT id, name, type, description, color, created_at FROM tracks WHERE id = ?'
    )
    .get(id)
}

export function generateUniqueSlug(name: string): string {
  const baseSlug = slugify(name)
  if (!getTrackById(baseSlug)) {
    return baseSlug
  }
  return `${baseSlug}-${crypto.randomUUID().slice(0, 4)}`
}

export function createTrack(track: Track): void {
  db.query<never, [string, string, string, string | null, string | null]>(
    'INSERT INTO tracks (id, name, type, description, color) VALUES (?, ?, ?, ?, ?)'
  ).run(
    track.id,
    track.name,
    track.type,
    track.description ?? null,
    track.color ?? null
  )
}

export function updateTrack(
  id: string,
  data: { name: string; description?: string | null; color?: string | null }
): void {
  db.query<never, [string, string | null, string | null, string]>(
    'UPDATE tracks SET name = ?, description = ?, color = ? WHERE id = ?'
  ).run(data.name, data.description ?? null, data.color ?? null, id)
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
