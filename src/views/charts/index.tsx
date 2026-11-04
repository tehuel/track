import type { ChartMode, ChartPeriod, ChartPoint, Track } from '../../types'
import { BarsChart } from './bars'
import { GridChart } from './grid'
import { LineChart } from './line'
import { formatChartValue, getTrackColor } from './utils'

export { formatChartValue }

export interface ChartProps {
  mode: ChartMode
  points: ChartPoint[]
  track?: Track
  color?: string | null
  period?: ChartPeriod
  mini?: boolean
}

export function Chart({
  mode,
  points,
  track,
  color: rawColor,
  period = '7d',
  mini = false,
}: ChartProps) {
  const color = rawColor || (track ? getTrackColor(track) : 'var(--bs-primary)')

  if (mode === 'grid') {
    return (
      <GridChart
        track={track}
        period={period}
        points={points}
        color={color}
        mini={mini}
      />
    )
  }

  if (mode === 'bars') {
    return (
      <BarsChart
        points={points}
        color={color}
        mini={mini}
        ariaLabel={mini ? 'Últimos 7 días' : `Gráfico de barras (${period})`}
      />
    )
  }

  return (
    <LineChart
      points={points}
      color={color}
      mini={mini}
      ariaLabel={mini ? 'Últimos 7 días' : `Gráfico de línea (${period})`}
    />
  )
}
