import { getEventTotals } from './db'
import { getTrackChartMode, type ChartPeriod, type ChartPoint, type Track } from './types'

const DAY_MS = 86_400_000
const WEEKDAYS_SHORT = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
// prettier-ignore
const MONTHS_SHORT = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']

/**
 * Returns a continuous time series of accumulated values (`SUM(value)` for
 * numeric tracks, `COUNT(*)` for habit/text tracks) for the requested view.
 *
 * - `dashboard` / `7d`: 7 daily points
 * - `30d`: 30 daily points
 * - `12m`: 364 daily points (52×7 heatmap) when mode is `grid`, or 12 monthly points when mode is `bars`/`line`
 */
export function getTrackSeries(
  track: Track,
  view: 'dashboard' | ChartPeriod,
  now: Date = new Date()
): ChartPoint[] {
  if (view === '12m' && getTrackChartMode(track, view) !== 'grid') {
    const months = monthlyRange(now, 12)
    const totals = getEventTotals(track, 'month', monthKey(months[0]!))
    return buildMonthlySeries(months, totals)
  }

  const days = dailyRange(now, view === '12m' ? 364 : view === '30d' ? 30 : 7)
  const totals = getEventTotals(track, 'day', dayKey(days[0]!))
  return buildDailySeries(days, totals)
}

// --- Date helpers (UTC; ranges are oldest first, ending at `now`) ---

const dayKey = (d: Date) => d.toISOString().slice(0, 10)
const monthKey = (d: Date) => d.toISOString().slice(0, 7)

function dailyRange(now: Date, count: number): Date[] {
  const todayUtc = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
  return Array.from({ length: count }, (_, i) => new Date(todayUtc - (count - 1 - i) * DAY_MS))
}

function monthlyRange(now: Date, count: number): Date[] {
  return Array.from(
    { length: count },
    (_, i) => new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - (count - 1 - i), 1))
  )
}

// --- Series builders (pure: dates + totals → ChartPoint[]) ---

export function buildDailySeries(days: Date[], totals: Map<string, number>): ChartPoint[] {
  return days.map((d) => {
    const key = dayKey(d)
    const dayNum = d.getUTCDate()
    const weekday = WEEKDAYS_SHORT[d.getUTCDay()] ?? ''
    const month = MONTHS_SHORT[d.getUTCMonth()]?.toLowerCase() ?? ''
    return {
      key,
      label: `${weekday} ${dayNum} ${month}`,
      shortLabel: days.length === 7 ? weekday : String(dayNum),
      value: totals.get(key) ?? 0,
    }
  })
}

export function buildMonthlySeries(months: Date[], totals: Map<string, number>): ChartPoint[] {
  return months.map((d) => {
    const key = monthKey(d)
    const shortLabel = MONTHS_SHORT[d.getUTCMonth()] ?? ''
    return {
      key,
      label: `${shortLabel} ${d.getUTCFullYear()}`,
      shortLabel,
      value: totals.get(key) ?? 0,
    }
  })
}
