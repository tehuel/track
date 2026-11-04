import type { ChartPeriod, ChartPoint } from '../../types'
import { renderEChartsSvg } from './echarts'

interface MiniBarsProps {
  points: ChartPoint[]
  color: string
}

export function MiniBarsChart({ points, color }: MiniBarsProps) {
  return (
    <>
      {renderEChartsSvg({
        width: 68,
        height: 20,
        points,
        ariaLabel: 'Últimos 7 días',
        option: {
          grid: { left: 1, right: 1, top: 2, bottom: 1 },
          xAxis: {
            type: 'category',
            show: false,
            data: points.map((p) => p.key),
          },
          yAxis: {
            type: 'value',
            show: false,
            min: 0,
          },
          series: [
            {
              type: 'bar',
              data: points.map((p) => p.value),
              barMaxWidth: 6,
              showBackground: true,
              backgroundStyle: {
                color: 'currentColor',
                opacity: 0.12,
                borderRadius: 1.5,
              },
              itemStyle: {
                color,
                borderRadius: 1.5,
                opacity: 0.85,
              },
            },
          ],
        },
      })}
    </>
  )
}

interface DetailBarsProps {
  period: ChartPeriod
  points: ChartPoint[]
  color: string
}

export function DetailBarsChart({ period, points, color }: DetailBarsProps) {
  return (
    <>
      {renderEChartsSvg({
        width: 560,
        height: 130,
        responsive: true,
        points,
        ariaLabel: `Gráfico de barras (${period})`,
        option: {
          grid: { left: 16, right: 16, top: 10, bottom: 22 },
          xAxis: {
            type: 'category',
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
            min: 0,
          },
          series: [
            {
              type: 'bar',
              data: points.map((p) => p.value),
              barMaxWidth: 28,
              showBackground: true,
              backgroundStyle: {
                color: 'currentColor',
                opacity: 0.08,
                borderRadius: 2.5,
              },
              itemStyle: {
                color,
                borderRadius: 2.5,
                opacity: 0.85,
              },
            },
          ],
        },
      })}
    </>
  )
}
