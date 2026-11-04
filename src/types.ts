export type TrackType = 'habit' | 'numeric' | 'text'

export const TRACK_TYPES: { value: TrackType; label: string; icon: string }[] = [
  { value: 'habit', label: 'Hábito', icon: 'check2-circle' },
  { value: 'numeric', label: 'Numérico', icon: 'hash' },
  { value: 'text', label: 'Texto', icon: 'justify-left' },
]

export function parseTrackType(raw: unknown): TrackType {
  const val = String(raw || '').trim()
  return TRACK_TYPES.find((t) => t.value === val)?.value ?? 'habit'
}

export function getTrackIcon(type: TrackType): string {
  return TRACK_TYPES.find((t) => t.value === type)?.icon ?? 'activity'
}

export function getTrackTypeLabel(type: TrackType): string {
  return TRACK_TYPES.find((t) => t.value === type)?.label ?? type
}

export const TRACK_COLORS: { value: string; label: string }[] = [
  { value: '#dc3545', label: 'Rojo' },
  { value: '#fd7e14', label: 'Naranja' },
  { value: '#ffc107', label: 'Amarillo' },
  { value: '#198754', label: 'Verde' },
  { value: '#0dcaf0', label: 'Cian' },
  { value: '#0d6efd', label: 'Azul' },
  { value: '#6f42c1', label: 'Violeta' },
  { value: '#d63384', label: 'Rosa' },
]

export function parseTrackColor(raw: unknown): string | null {
  const val = String(raw || '').trim()
  return TRACK_COLORS.some((c) => c.value === val) ? val : null
}

export interface Track {
  id: string
  name: string
  type: TrackType
  description?: string | null
  color?: string | null
  created_at?: string
}

export interface TrackEvent {
  id: string
  tracker_id: string
  value?: number | null
  note?: string | null
  timestamp: string
}
