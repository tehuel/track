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
  const width = mini ? 68 : 560
  const height = mini ? 20 : 130

  const chart = echarts.init(null, null, {
    renderer: 'svg',
    ssr: true,
    width,
    height,
  })

  chart.setOption({
    animation: false,
    grid: mini
      ? { left: 2, right: 2, top: 2, bottom: 2 }
      : { left: 18, right: 18, top: 12, bottom: 22 },
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
        fontSize: 11,
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

  const rootAttrs = mini
    ? `<svg role="img" aria-label="${ariaLabel}" `
    : `<svg class="w-100 h-100" role="img" aria-label="${ariaLabel}"`

  return raw(
    mini
      ? svg.replace(/^<svg /, rootAttrs)
      : svg.replace(/^<svg width="\d+" height="\d+"/, rootAttrs)
  )
}
