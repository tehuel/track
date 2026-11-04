import type { ChartPeriod, ChartPoint } from '../../types'
import { formatChartValue } from './utils'

interface MiniBarsProps {
  points: ChartPoint[]
  color: string
  maxVal: number
}

export function MiniBarsChart({ points, color, maxVal }: MiniBarsProps) {
  return (
    <svg
      width="68"
      height="20"
      viewBox="0 0 68 20"
      role="img"
      aria-label="Últimos 7 días"
    >
      {points.map((p, i) => {
        const active = p.value > 0
        const h = active ? Math.max(4, Math.round((p.value / maxVal) * 16)) : 2
        const x = i * 10 + 1
        const y = 19 - h
        return (
          <rect
            x={x}
            y={y}
            width="6"
            height={h}
            rx="1.5"
            fill={active ? color : 'currentColor'}
            fill-opacity={active ? '0.85' : '0.18'}
          >
            <title>{`${p.label}: ${formatChartValue(p.value)}`}</title>
          </rect>
        )
      })}
    </svg>
  )
}

interface DetailBarsProps {
  period: ChartPeriod
  points: ChartPoint[]
  color: string
  maxVal: number
}

export function DetailBarsChart({
  period,
  points,
  color,
  maxVal,
}: DetailBarsProps) {
  const W = 560
  const H = 110
  const padX = 16
  const padY = 10
  const plotW = W - padX * 2
  const plotH = H - padY
  const step = plotW / Math.max(1, points.length)
  const barW = Math.min(28, Math.max(6, step * 0.65))

  return (
    <svg
      viewBox={`0 0 ${W} ${H + 20}`}
      class="w-100 h-100"
      role="img"
      aria-label={`Gráfico de barras (${period})`}
    >
      {points.map((p, i) => {
        const active = p.value > 0
        const h = active ? Math.max(5, (p.value / maxVal) * plotH) : 3
        const x = padX + i * step + (step - barW) / 2
        const y = padY + plotH - h
        const showLabel =
          points.length <= 12 || i % 5 === 0 || i === points.length - 1

        return (
          <>
            <rect
              x={x.toFixed(1)}
              y={y.toFixed(1)}
              width={barW.toFixed(1)}
              height={h.toFixed(1)}
              rx="2.5"
              fill={active ? color : 'currentColor'}
              fill-opacity={active ? '0.85' : '0.15'}
            >
              <title>{`${p.label}: ${formatChartValue(p.value)}`}</title>
            </rect>
            {showLabel && (
              <text
                x={(x + barW / 2).toFixed(1)}
                y={H + 15}
                text-anchor="middle"
                fill="currentColor"
                opacity="0.6"
                font-size="11"
              >
                {p.shortLabel}
              </text>
            )}
          </>
        )
      })}
    </svg>
  )
}
