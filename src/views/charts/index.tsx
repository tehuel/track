import {
  CHART_PERIODS,
  getTrackChartMode,
  type ChartMode,
  type ChartPeriod,
  type ChartPoint,
  type Track,
  type TrackEvent,
} from '../../types'
import { BarsChart } from './bars'
import { GridChart } from './grid'
import { LineChart } from './line'
import { formatChartValue, getTrackColor } from './utils'

export { formatChartValue }

function renderModeChart(
  mode: ChartMode,
  props: {
    track: Track
    points: ChartPoint[]
    period?: ChartPeriod
    mini?: boolean
  }
) {
  const color = getTrackColor(props.track)
  const period = props.period ?? '7d'
  const mini = Boolean(props.mini)

  if (mode === 'grid') {
    return (
      <GridChart
        track={props.track}
        period={period}
        points={props.points}
        color={color}
        mini={mini}
      />
    )
  }
  if (mode === 'bars') {
    return (
      <BarsChart
        points={props.points}
        color={color}
        mini={mini}
        ariaLabel={mini ? 'Últimos 7 días' : `Gráfico de barras (${period})`}
      />
    )
  }
  return (
    <LineChart
      points={props.points}
      color={color}
      mini={mini}
      ariaLabel={mini ? 'Últimos 7 días' : `Gráfico de línea (${period})`}
    />
  )
}

interface DashboardMiniChartProps {
  track: Track
  points: ChartPoint[]
  latestEvent?: TrackEvent | null
}

export function DashboardMiniChart({
  track,
  points,
  latestEvent,
}: DashboardMiniChartProps) {
  const mode = getTrackChartMode(track, 'dashboard')

  return (
    <div class="d-flex align-items-center justify-content-between gap-2 mt-3 position-relative z-2">
      <div class="d-flex align-items-center flex-shrink-0" data-chart-mode={mode}>
        {renderModeChart(mode, { track, points, mini: true })}
      </div>

      <div class="text-body-secondary small text-truncate">
        {latestEvent ? (
          <time datetime={latestEvent.timestamp}></time>
        ) : (
          <span class="text-body-tertiary">Sin entradas</span>
        )}
      </div>
    </div>
  )
}

interface TrackChartSectionProps {
  track: Track
  period: ChartPeriod
  points: ChartPoint[]
  oob?: boolean
}

export function TrackChartSection({
  track,
  period,
  points,
  oob = false,
}: TrackChartSectionProps) {
  const mode = getTrackChartMode(track, period)
  const minWidth =
    period === '12m' && mode === 'grid'
      ? '34rem'
      : period === '30d'
        ? '30rem'
        : period === '12m'
          ? '28rem'
          : '18rem'

  return (
    <div
      class="card border-0 bg-body rounded-3 p-3 mb-4"
      id="chart-section"
      data-period={period}
      data-chart-mode={mode}
      hx-swap-oob={oob ? 'true' : undefined}
    >
      <div
        class="overflow-x-auto overflow-y-hidden"
        style={{ height: '8.75rem' }}
      >
        <div
          class="d-flex flex-column justify-content-center h-100 w-100"
          style={{ minWidth }}
        >
          {renderModeChart(mode, { track, period, points })}
        </div>
      </div>

      {/* Simple row of period links below the chart */}
      <div class="d-flex justify-content-center align-items-center gap-3 mt-2 pt-1 small">
        {CHART_PERIODS.map((p) => {
          const active = p.value === period
          return (
            <a
              href={`/track/${track.id}?period=${p.value}`}
              hx-get={`/track/${track.id}?period=${p.value}`}
              hx-target="#chart-section"
              hx-swap="outerHTML"
              class={
                active
                  ? 'fw-semibold text-body text-decoration-none'
                  : 'text-body-secondary text-decoration-none'
              }
              aria-current={active ? 'true' : undefined}
            >
              {p.label}
            </a>
          )
        })}
      </div>
    </div>
  )
}
