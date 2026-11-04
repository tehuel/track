import type { ChartPeriod, ChartPoint } from '../../types'
import { formatChartValue } from './utils'

interface MiniLineProps {
  points: ChartPoint[]
  color: string
  maxVal: number
}

export function MiniLineChart({ points, color, maxVal }: MiniLineProps) {
  const W = 68
  const H = 20
  const padX = 3
  const padY = 3
  const plotW = W - padX * 2
  const plotH = H - padY * 2
  const coords = points.map((p, i) => {
    const x = padX + (i / Math.max(1, points.length - 1)) * plotW
    const y = padY + plotH - (p.value / maxVal) * plotH
    return { x, y, p }
  })
  const activeCoords = coords.filter((c) => c.p.value > 0)
  const poly = activeCoords.map((c) => `${c.x.toFixed(1)},${c.y.toFixed(1)}`).join(' ')
  const firstX = activeCoords[0]?.x.toFixed(1) ?? '0'
  const lastX = activeCoords[activeCoords.length - 1]?.x.toFixed(1) ?? '0'
  const baseLineY = (padY + plotH).toFixed(1)
  const area = `${firstX},${baseLineY} ${poly} ${lastX},${baseLineY}`

  return (
    <svg
      width={W}
      height={H}
      viewBox={`0 0 ${W} ${H}`}
      role="img"
      aria-label="Últimos 7 días"
    >
      {activeCoords.length >= 2 ? (
        <>
          <polygon points={area} fill={color} fill-opacity="0.15" />
          <polyline
            fill="none"
            stroke={color}
            stroke-width="1.75"
            stroke-linecap="round"
            stroke-linejoin="round"
            points={poly}
          />
        </>
      ) : (
        <polyline
          fill="none"
          stroke="currentColor"
          stroke-opacity="0.18"
          stroke-width="1.5"
          points={`${padX},${baseLineY} ${W - padX},${baseLineY}`}
        />
      )}
      {activeCoords.map((c) => (
        <circle cx={c.x.toFixed(1)} cy={c.y.toFixed(1)} r="2" fill={color}>
          <title>{`${c.p.label}: ${formatChartValue(c.p.value)}`}</title>
        </circle>
      ))}
    </svg>
  )
}

interface DetailLineProps {
  period: ChartPeriod
  points: ChartPoint[]
  color: string
  maxVal: number
}

export function DetailLineChart({
  period,
  points,
  color,
  maxVal,
}: DetailLineProps) {
  const W = 560
  const H = 110
  const padX = 20
  const padY = 12
  const plotW = W - padX * 2
  const plotH = H - padY * 2
  const coords = points.map((p, i) => {
    const x = padX + (i / Math.max(1, points.length - 1)) * plotW
    const y = padY + plotH - (p.value / maxVal) * plotH
    return { x, y, p, i }
  })
  const activeCoords = coords.filter((c) => c.p.value > 0)
  const poly = activeCoords.map((c) => `${c.x.toFixed(1)},${c.y.toFixed(1)}`).join(' ')
  const firstX = activeCoords[0]?.x.toFixed(1) ?? '0'
  const lastX = activeCoords[activeCoords.length - 1]?.x.toFixed(1) ?? '0'
  const baseY = (padY + plotH).toFixed(1)
  const area = `${firstX},${baseY} ${poly} ${lastX},${baseY}`

  return (
    <svg
      viewBox={`0 0 ${W} ${H + 20}`}
      class="w-100 h-100"
      role="img"
      aria-label={`Gráfico de línea (${period})`}
    >
      {activeCoords.length >= 2 ? (
        <>
          <polygon points={area} fill={color} fill-opacity="0.12" />
          <polyline
            fill="none"
            stroke={color}
            stroke-width="2.25"
            stroke-linecap="round"
            stroke-linejoin="round"
            points={poly}
          />
        </>
      ) : (
        <polyline
          fill="none"
          stroke="currentColor"
          stroke-opacity="0.18"
          stroke-width="1.5"
          points={`${padX},${baseY} ${W - padX},${baseY}`}
        />
      )}
      {coords.map((c) => {
        const showLabel =
          points.length <= 12 || c.i % 5 === 0 || c.i === points.length - 1
        return (
          <>
            {c.p.value > 0 && (
              <circle
                cx={c.x.toFixed(1)}
                cy={c.y.toFixed(1)}
                r="3.2"
                fill={color}
              >
                <title>{`${c.p.label}: ${formatChartValue(c.p.value)}`}</title>
              </circle>
            )}
            {showLabel && (
              <text
                x={c.x.toFixed(1)}
                y={H + 15}
                text-anchor="middle"
                fill="currentColor"
                opacity="0.6"
                font-size="11"
              >
                {c.p.shortLabel}
              </text>
            )}
          </>
        )
      })}
    </svg>
  )
}
