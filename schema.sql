-- Tracker application SQLite schema (Single-user / Self-hosted)

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
