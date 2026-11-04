import type { ChartPeriod, ChartPoint } from '../../types'
import { renderEChartsSvg } from './echarts'

interface MiniLineProps {
  points: ChartPoint[]
  color: string
}

export function MiniLineChart({ points, color }: MiniLineProps) {
  return (
    <>
      {renderEChartsSvg({
        width: 68,
        height: 20,
        points,
        ariaLabel: 'Últimos 7 días',
        option: {
          grid: { left: 3, right: 3, top: 3, bottom: 3 },
          xAxis: {
            type: 'category',
            show: false,
            boundaryGap: false,
            data: points.map((p) => p.key),
          },
          yAxis: {
            type: 'value',
            show: false,
            scale: true,
          },
          series: [
            {
              type: 'line',
              data: points.map((p) => (p.value > 0 ? p.value : null)),
              connectNulls: true,
              symbol: 'circle',
              symbolSize: 4,
              itemStyle: { color },
              lineStyle: { color, width: 1.75 },
              areaStyle: { color, opacity: 0.15 },
            },
          ],
        },
      })}
    </>
  )
}

interface DetailLineProps {
  period: ChartPeriod
  points: ChartPoint[]
  color: string
}

export function DetailLineChart({ period, points, color }: DetailLineProps) {
  return (
    <>
      {renderEChartsSvg({
        width: 560,
        height: 130,
        responsive: true,
        points,
        ariaLabel: `Gráfico de línea (${period})`,
        option: {
          grid: { left: 20, right: 20, top: 12, bottom: 22 },
          xAxis: {
            type: 'category',
            boundaryGap: false,
            data: points.map((p) => p.shortLabel),
            axisLine: { show: false },
            axisTick: { show: false },
            axisLabel: {
              color: 'currentColor',
              opacity: 0.6,
              fontSize: 11,
              interval: points.length > 12 ? 4 : 0,
            },
          },
          yAxis: {
            type: 'value',
            show: false,
            scale: true,
          },
          series: [
            {
              type: 'line',
              data: points.map((p) => (p.value > 0 ? p.value : null)),
              connectNulls: true,
              symbol: 'circle',
              symbolSize: 6,
              itemStyle: { color },
              lineStyle: { color, width: 2.25 },
              areaStyle: { color, opacity: 0.12 },
            },
          ],
        },
      })}
    </>
  )
}
