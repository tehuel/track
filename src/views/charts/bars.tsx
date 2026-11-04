import { renderCartesianSvg, type CartesianChartProps } from './echarts'

export function CartesianFrame({
  points,
  mini = false,
  svg,
}: {
  points: CartesianChartProps['points']
  mini?: boolean
  svg: ReturnType<typeof renderCartesianSvg>
}) {
  if (mini) {
    return (
      <div class="w-100" style={{ height: '2rem' }}>
        {svg}
      </div>
    )
  }

  return (
    <div class="d-flex flex-column justify-content-between h-100 w-100">
      <div class="flex-grow-1 w-100" style={{ minHeight: 0 }}>
        {svg}
      </div>
      <div class="d-flex justify-content-between text-body-secondary small pt-1 flex-shrink-0">
        {points.map((p, i) => {
          const showLabel =
            points.length <= 12 || i % 5 === 0 || i === points.length - 1
          return showLabel ? (
            <span class="font-monospace" style={{ fontSize: '0.75rem' }}>
              {p.shortLabel}
            </span>
          ) : null
        })}
      </div>
    </div>
  )
}

export function BarsChart({ points, color, ariaLabel, mini = false }: CartesianChartProps) {
  const radius = mini ? 2 : 3
  const svg = renderCartesianSvg({
    points,
    color,
    ariaLabel,
    mini,
    series: {
      type: 'bar',
      data: points.map((p) => p.value),
      barWidth: '72%',
      showBackground: true,
      backgroundStyle: {
        color: 'currentColor',
        opacity: mini ? 0.12 : 0.08,
        borderRadius: radius,
      },
      itemStyle: {
        color,
        borderRadius: radius,
        opacity: 0.85,
      },
    },
  })

  return <CartesianFrame points={points} mini={mini} svg={svg} />
}
