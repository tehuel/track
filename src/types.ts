export type TrackType = 'habit' | 'numeric' | 'text'

export type ChartMode = 'grid' | 'bars' | 'line'

export type ChartPeriod = '7d' | '30d' | '12m'

export const CHART_MODES: { value: ChartMode; label: string }[] = [
  { value: 'grid', label: 'Grilla' },
  { value: 'bars', label: 'Barras' },
  { value: 'line', label: 'Línea' },
]

export const CHART_PERIODS: { value: ChartPeriod; label: string }[] = [
  { value: '7d', label: '7d' },
  { value: '30d', label: '30d' },
  { value: '12m', label: '12m' },
]

export function defaultChartMode(type: TrackType): ChartMode {
  return type === 'habit' ? 'grid' : 'bars'
}

export function parseChartMode(raw: unknown, fallback: ChartMode = 'grid'): ChartMode {
  const val = String(raw || '').trim()
  return CHART_MODES.find((m) => m.value === val)?.value ?? fallback
}

export function parseChartPeriod(raw: unknown): ChartPeriod {
  const val = String(raw || '').trim()
  return CHART_PERIODS.find((p) => p.value === val)?.value ?? '7d'
}

export function getTrackChartMode(track: Track, view: 'dashboard' | ChartPeriod): ChartMode {
  const fallback = defaultChartMode(track.type)
  switch (view) {
    case 'dashboard':
      return track.chart_dashboard ?? fallback
    case '7d':
      return track.chart_7d ?? fallback
    case '30d':
      return track.chart_30d ?? fallback
    case '12m':
      return track.chart_12m ?? fallback
  }
}

export interface ChartPoint {
  /** ISO date ('YYYY-MM-DD') or month ('YYYY-MM') key in UTC. */
  key: string
  /** Tooltip / full label (e.g. '4 nov' or 'nov 2026'). */
  label: string
  /** Axis short label (e.g. 'Mié', '4', 'Nov'). */
  shortLabel: string
  /** Accumulated total for the bucket: SUM(value) for numeric, COUNT(*) for habit/text. */
  value: number
}

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
  chart_dashboard?: ChartMode
  chart_7d?: ChartMode
  chart_30d?: ChartMode
  chart_12m?: ChartMode
  created_at?: string
}

export interface TrackEvent {
  id: string
  track_id: string
  value?: number | null
  note?: string | null
  timestamp: string
}
