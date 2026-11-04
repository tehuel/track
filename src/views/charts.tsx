import {
  CHART_PERIODS,
  getTrackChartMode,
  type ChartPeriod,
  type ChartPoint,
  type Track,
  type TrackEvent,
} from '../types'

export function formatChartValue(value: number): string {
  if (Number.isInteger(value)) return String(value)
  return Number(value.toFixed(2)).toString()
}

function getColor(track: Track): string {
  return track.color || 'var(--bs-primary)'
}

function getIntensityOpacity(value: number, maxValue: number): string {
  if (value <= 0) return '0.1'
  if (maxValue <= 1) return '0.9'
  const ratio = Math.min(1, Math.max(0, value / maxValue))
  return (0.35 + ratio * 0.65).toFixed(2)
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
  const color = getColor(track)
  const maxVal = Math.max(1, ...points.map((p) => p.value))

  return (
    <div class="d-flex align-items-center justify-content-between gap-2 mt-3 position-relative z-2">
      <div class="d-flex align-items-center flex-shrink-0" data-chart-mode={mode}>
        {mode === 'grid' && (
          <div class="d-inline-flex align-items-center gap-1" role="img" aria-label="Últimos 7 días">
            {points.map((p) => {
              const active = p.value > 0
              const opacity = active ? getIntensityOpacity(p.value, maxVal) : '0.2'
              return (
                <span
                  class="rounded-circle d-inline-block"
                  title={`${p.label}: ${formatChartValue(p.value)}`}
                  style={{
                    width: '0.55rem',
                    height: '0.55rem',
                    backgroundColor: active ? color : 'currentColor',
                    opacity,
                  }}
                ></span>
              )
            })}
          </div>
        )}

        {mode === 'bars' && (
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
        )}

        {mode === 'line' && (() => {
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
          const poly = coords.map((c) => `${c.x.toFixed(1)},${c.y.toFixed(1)}`).join(' ')
          const firstX = coords[0]?.x.toFixed(1) ?? '0'
          const lastX = coords[coords.length - 1]?.x.toFixed(1) ?? '0'
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
              <polygon points={area} fill={color} fill-opacity="0.15" />
              <polyline
                fill="none"
                stroke={color}
                stroke-width="1.75"
                stroke-linecap="round"
                stroke-linejoin="round"
                points={poly}
              />
              {coords.map((c) => (
                <circle cx={c.x.toFixed(1)} cy={c.y.toFixed(1)} r="2" fill={color}>
                  <title>{`${c.p.label}: ${formatChartValue(c.p.value)}`}</title>
                </circle>
              ))}
            </svg>
          )
        })()}
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
  const color = getColor(track)
  const maxVal = Math.max(1, ...points.map((p) => p.value))
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
        {mode === 'grid' && period === '7d' && (
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
                      border: active
                        ? `1.5px solid ${color}`
                        : '1.5px solid var(--bs-border-color)',
                      opacity: active ? getIntensityOpacity(p.value, maxVal) : '0.65',
                    }}
                  >
                    {active
                      ? track.type === 'habit' && p.value === 1
                        ? '✓'
                        : formatChartValue(p.value)
                      : '·'}
                  </span>
                </div>
              )
            })}
          </div>
        )}

        {mode === 'grid' && period === '30d' && (
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
              const opacity = active ? getIntensityOpacity(p.value, maxVal) : '0.45'
              return (
                <div
                  class="rounded-2 d-flex align-items-center justify-content-center small font-monospace"
                  title={`${p.label}: ${formatChartValue(p.value)}`}
                  style={{
                    height: '2.25rem',
                    backgroundColor: active ? color : 'transparent',
                    color: active ? '#fff' : 'var(--bs-secondary-color)',
                    border: active ? `1px solid ${color}` : '1px solid var(--bs-border-color)',
                    opacity,
                  }}
                >
                  {p.shortLabel}
                </div>
              )
            })}
          </div>
        )}

        {mode === 'grid' && period === '12m' && (
          <svg
            viewBox="0 0 572 77"
            class="w-100"
            style={{ height: '100%', maxHeight: '7.5rem' }}
            role="img"
            aria-label="Actividad anual"
          >
            {points.map((p, idx) => {
              const col = Math.floor(idx / 7)
              const row = idx % 7
              const active = p.value > 0
              const opacity = active ? getIntensityOpacity(p.value, maxVal) : '0.12'
              return (
                <rect
                  x={col * 11}
                  y={row * 11}
                  width="8.5"
                  height="8.5"
                  rx="2"
                  fill={active ? color : 'currentColor'}
                  fill-opacity={opacity}
                >
                  <title>{`${p.label}: ${formatChartValue(p.value)}`}</title>
                </rect>
              )
            })}
          </svg>
        )}

        {mode === 'bars' && (() => {
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
        })()}

        {mode === 'line' && (() => {
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
          const poly = coords.map((c) => `${c.x.toFixed(1)},${c.y.toFixed(1)}`).join(' ')
          const firstX = coords[0]?.x.toFixed(1) ?? '0'
          const lastX = coords[coords.length - 1]?.x.toFixed(1) ?? '0'
          const baseY = (padY + plotH).toFixed(1)
          const area = `${firstX},${baseY} ${poly} ${lastX},${baseY}`

          return (
            <svg
              viewBox={`0 0 ${W} ${H + 20}`}
              class="w-100 h-100"
              role="img"
              aria-label={`Gráfico de línea (${period})`}
            >
              <polygon points={area} fill={color} fill-opacity="0.12" />
              <polyline
                fill="none"
                stroke={color}
                stroke-width="2.25"
                stroke-linecap="round"
                stroke-linejoin="round"
                points={poly}
              />
              {coords.map((c) => {
                const showLabel =
                  points.length <= 12 || c.i % 5 === 0 || c.i === points.length - 1
                return (
                  <>
                    <circle
                      cx={c.x.toFixed(1)}
                      cy={c.y.toFixed(1)}
                      r="3.2"
                      fill={color}
                    >
                      <title>{`${c.p.label}: ${formatChartValue(c.p.value)}`}</title>
                    </circle>
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
        })()}
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
