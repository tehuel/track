import { CartesianFrame } from './bars'
import { renderCartesianSvg, type CartesianChartProps } from './echarts'

export function LineChart({ points, color, ariaLabel, mini = false }: CartesianChartProps) {
  const svg = renderCartesianSvg({
    points,
    color,
    ariaLabel,
    mini,
    boundaryGap: false,
    scaleY: true,
    series: {
      type: 'line',
      data: points.map((p) => (p.value > 0 ? p.value : null)),
      connectNulls: true,
      symbol: 'circle',
      symbolSize: mini ? 4 : 6,
      itemStyle: { color },
      lineStyle: { color, width: mini ? 1.75 : 2.25 },
      areaStyle: { color, opacity: mini ? 0.15 : 0.12 },
    },
  })

  return <CartesianFrame points={points} mini={mini} svg={svg} />
}
