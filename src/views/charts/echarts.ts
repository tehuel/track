import * as echarts from 'echarts/core'
import { BarChart, LineChart, type BarSeriesOption, type LineSeriesOption } from 'echarts/charts'
import { GridComponent } from 'echarts/components'
import { SVGRenderer } from 'echarts/renderers'
import { raw } from 'hono/html'
import type { ChartPoint } from '../../types'
import { formatChartValue } from './utils'

echarts.use([BarChart, LineChart, GridComponent, SVGRenderer])

export interface CartesianChartProps {
  points: ChartPoint[]
  color: string
  ariaLabel: string
  mini?: boolean
}

interface RenderCartesianOptions extends CartesianChartProps {
  boundaryGap?: boolean
  scaleY?: boolean
  series: BarSeriesOption | LineSeriesOption
}

export function renderCartesianChart({
  points,
  ariaLabel,
  mini = false,
  boundaryGap = true,
  scaleY = false,
  series,
}: RenderCartesianOptions) {
  const width = mini ? 380 : 1260
  const height = mini ? 32 : 144
  const padX = mini ? 4 : boundaryGap ? 6 : 20

  const chart = echarts.init(null, null, {
    renderer: 'svg',
    ssr: true,
    width,
    height,
  })

  chart.setOption({
    animation: false,
    grid: mini
      ? { left: padX, right: padX, top: 3, bottom: 3 }
      : { left: padX, right: padX, top: 10, bottom: 22 },
    xAxis: {
      type: 'category',
      show: !mini,
      boundaryGap,
      data: points.map((p) => (mini ? p.key : p.shortLabel)),
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: {
        color: 'currentColor',
        opacity: 0.6,
        fontSize: 12,
        interval: points.length > 12 ? 4 : 0,
      },
    },
    yAxis: {
      type: 'value',
      show: false,
      ...(scaleY ? { scale: true } : { min: 0 }),
    },
    series: [series],
  })

  let svg = chart.renderToSVGString()
  chart.dispose()

  svg = svg.replace(
    /<path\b([^>]*?\becmeta_data_index="(\d+)"[^>]*?)><\/path>/g,
    (match, attrs: string, idxStr: string) => {
      const p = points[Number(idxStr)]
      return p
        ? `<path${attrs}><title>${p.label}: ${formatChartValue(p.value)}</title></path>`
        : match
    }
  )

  return raw(
    svg.replace(
      /^<svg width="\d+" height="\d+"/,
      `<svg class="w-100 h-100 d-block" role="img" aria-label="${ariaLabel}"`
    )
  )
}
