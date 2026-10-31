export type TrackerType = 'habit' | 'numeric' | 'text'

export interface Tracker {
  id: string
  name: string
  type: TrackerType
  description?: string | null
  created_at?: string
}

export interface TrackerEvent {
  id: string
  tracker_id: string
  value?: number | null
  note?: string | null
  timestamp: string
}
