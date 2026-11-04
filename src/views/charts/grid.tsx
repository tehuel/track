import type { ChartPeriod, ChartPoint, Track } from '../../types'
import { formatChartValue, getIntensityOpacity } from './utils'

interface GridChartProps {
  points: ChartPoint[]
  color: string
  mini?: boolean
  track?: Track
  period?: ChartPeriod
}

export function GridChart({
  points,
  color,
  mini = false,
  track,
  period = '7d',
}: GridChartProps) {
  const maxVal = Math.max(1, ...points.map((p) => p.value))

  if (mini) {
    return (
      <div class="d-inline-flex align-items-center gap-1" role="img" aria-label="Últimos 7 días">
        {points.map((p) => {
          const active = p.value > 0
          return (
            <span
              class="rounded-circle d-inline-block"
              title={`${p.label}: ${formatChartValue(p.value)}`}
              style={{
                width: '0.55rem',
                height: '0.55rem',
                backgroundColor: active ? color : 'currentColor',
                opacity: active ? getIntensityOpacity(p.value, maxVal) : '0.2',
              }}
            ></span>
          )
        })}
      </div>
    )
  }

  if (period === '7d') {
    return (
      <div class="d-flex justify-content-between gap-1 text-center w-100">
        {points.map((p) => {
          const active = p.value > 0
          return (
            <div
              class="d-flex flex-column align-items-center gap-2 flex-fill"
              title={`${p.label}: ${formatChartValue(p.value)}`}
            >
              <span class="text-body-secondary small">{p.shortLabel}</span>
              <span
                class="rounded-circle d-inline-flex align-items-center justify-content-center small fw-semibold font-monospace"
                style={{
                  width: '2.5rem',
                  height: '2.5rem',
                  backgroundColor: active ? color : 'transparent',
                  color: active ? '#fff' : 'var(--bs-secondary-color)',
                  border: `1.5px solid ${active ? color : 'var(--bs-border-color)'}`,
                  opacity: active ? getIntensityOpacity(p.value, maxVal) : '0.65',
                }}
              >
                {active
                  ? track?.type === 'habit' && p.value === 1
                    ? '✓'
                    : formatChartValue(p.value)
                  : '·'}
              </span>
            </div>
          )
        })}
      </div>
    )
  }

  if (period === '30d') {
    return (
      <div
        class="w-100"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(10, minmax(0, 1fr))',
          gap: '0.375rem',
        }}
      >
        {points.map((p) => {
          const active = p.value > 0
          return (
            <div
              class="rounded-2 d-flex align-items-center justify-content-center small font-monospace"
              title={`${p.label}: ${formatChartValue(p.value)}`}
              style={{
                height: '2.25rem',
                backgroundColor: active ? color : 'transparent',
                color: active ? '#fff' : 'var(--bs-secondary-color)',
                border: `1px solid ${active ? color : 'var(--bs-border-color)'}`,
                opacity: active ? getIntensityOpacity(p.value, maxVal) : '0.45',
              }}
            >
              {p.shortLabel}
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <svg
      viewBox="0 0 572 77"
      class="w-100"
      style={{ height: '100%', maxHeight: '7.5rem' }}
      role="img"
      aria-label="Actividad anual"
    >
      {points.map((p, idx) => {
        const active = p.value > 0
        return (
          <rect
            x={Math.floor(idx / 7) * 11}
            y={(idx % 7) * 11}
            width="8.5"
            height="8.5"
            rx="2"
            fill={active ? color : 'currentColor'}
            fill-opacity={active ? getIntensityOpacity(p.value, maxVal) : '0.12'}
          >
            <title>{`${p.label}: ${formatChartValue(p.value)}`}</title>
          </rect>
        )
      })}
    </svg>
  )
}
