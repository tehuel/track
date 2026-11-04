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

export function renderCartesianSvg({
  points,
  ariaLabel,
  mini = false,
  boundaryGap = true,
  scaleY = false,
  series,
}: RenderCartesianOptions) {
  const width = mini ? 320 : 960
  const height = mini ? 32 : 116
  const padX = mini ? 2 : boundaryGap ? 2 : 8

  const chart = echarts.init(null, null, {
    renderer: 'svg',
    ssr: true,
    width,
    height,
  })

  chart.setOption({
    animation: false,
    grid: { left: padX, right: padX, top: 4, bottom: 4 },
    xAxis: {
      type: 'category',
      show: false,
      boundaryGap,
      data: points.map((p) => p.key),
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
      `<svg class="w-100 h-100 d-block" preserveAspectRatio="none" role="img" aria-label="${ariaLabel}"`
    )
  )
}
