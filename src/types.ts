export type TrackerType = 'habit' | 'numeric' | 'text'

export const TRACKER_TYPES: { value: TrackerType; label: string; icon: string }[] = [
  { value: 'habit', label: 'Hábito', icon: 'bi-check2-circle' },
  { value: 'numeric', label: 'Numérico', icon: 'bi-123' },
  { value: 'text', label: 'Texto', icon: 'bi-card-text' },
]

export function getTrackerIcon(type: TrackerType): string {
  return TRACKER_TYPES.find((t) => t.value === type)?.icon ?? 'bi-activity'
}

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
