import * as echarts from 'echarts/core'
import { BarChart, LineChart, type BarSeriesOption, type LineSeriesOption } from 'echarts/charts'
import { GridComponent, type GridComponentOption } from 'echarts/components'
import { SVGRenderer } from 'echarts/renderers'
import { raw } from 'hono/html'
import type { ChartPoint } from '../../types'
import { formatChartValue } from './utils'

echarts.use([BarChart, LineChart, GridComponent, SVGRenderer])

export type EChartsSSRConfs = echarts.ComposeOption<
  BarSeriesOption | LineSeriesOption | GridComponentOption
>

interface RenderEChartsProps {
  width: number
  height: number
  option: EChartsSSRConfs
  points: ChartPoint[]
  ariaLabel: string
  responsive?: boolean
}

export function renderEChartsSvg({
  width,
  height,
  option,
  points,
  ariaLabel,
  responsive = false,
}: RenderEChartsProps) {
  const chart = echarts.init(null, null, {
    renderer: 'svg',
    ssr: true,
    width,
    height,
  })

  chart.setOption({
    animation: false,
    ...option,
  })

  let svg = chart.renderToSVGString()
  chart.dispose()

  // Inject native <title> tooltips on each rendered series item using ECharts SSR metadata
  svg = svg.replace(
    /<path\b([^>]*?\becmeta_data_index="(\d+)"[^>]*?)><\/path>/g,
    (match, attrs: string, idxStr: string) => {
      const p = points[Number(idxStr)]
      if (!p) return match
      return `<path${attrs}><title>${p.label}: ${formatChartValue(p.value)}</title></path>`
    }
  )

  if (responsive) {
    svg = svg.replace(
      /^<svg width="\d+" height="\d+"/,
      `<svg class="w-100 h-100" role="img" aria-label="${ariaLabel}"`
    )
  } else {
    svg = svg.replace(
      /^<svg /,
      `<svg role="img" aria-label="${ariaLabel}" `
    )
  }

  return raw(svg)
}
