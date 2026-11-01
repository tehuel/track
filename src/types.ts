export type TrackerType = 'habit' | 'numeric' | 'text'

export const TRACKER_TYPES: { value: TrackerType; label: string; icon: string }[] = [
  { value: 'habit', label: 'Hábito', icon: 'check2-circle' },
  { value: 'numeric', label: 'Numérico', icon: 'hash' },
  { value: 'text', label: 'Texto', icon: 'card-text' },
]

export function getTrackerIcon(type: TrackerType): string {
  return TRACKER_TYPES.find((t) => t.value === type)?.icon ?? 'activity'
}

export function getTrackerTypeLabel(type: TrackerType): string {
  return TRACKER_TYPES.find((t) => t.value === type)?.label ?? type
}

export const TRACKER_COLORS: { value: string; label: string }[] = [
  { value: '#dc3545', label: 'Rojo' },
  { value: '#fd7e14', label: 'Naranja' },
  { value: '#ffc107', label: 'Amarillo' },
  { value: '#198754', label: 'Verde' },
  { value: '#0dcaf0', label: 'Cian' },
  { value: '#0d6efd', label: 'Azul' },
  { value: '#6f42c1', label: 'Violeta' },
  { value: '#d63384', label: 'Rosa' },
]

export function parseTrackerColor(raw: unknown): string | null {
  const val = String(raw || '').trim()
  return TRACKER_COLORS.some((c) => c.value === val) ? val : null
}

export interface Tracker {
  id: string
  name: string
  type: TrackerType
  description?: string | null
  color?: string | null
  created_at?: string
}

export interface TrackerEvent {
  id: string
  tracker_id: string
  value?: number | null
  note?: string | null
  timestamp: string
}
