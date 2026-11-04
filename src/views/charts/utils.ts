import type { Track } from '../../types'

export function formatChartValue(value: number): string {
  if (Number.isInteger(value)) return String(value)
  return Number(value.toFixed(2)).toString()
}

export function getTrackColor(track: Track): string {
  return track.color || 'var(--bs-primary)'
}

export function getIntensityOpacity(value: number, maxValue: number): string {
  if (value <= 0) return '0.1'
  if (maxValue <= 1) return '0.9'
  const ratio = Math.min(1, Math.max(0, value / maxValue))
  return (0.35 + ratio * 0.65).toFixed(2)
}
