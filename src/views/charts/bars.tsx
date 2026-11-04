import { renderCartesianChart, type CartesianChartProps } from './echarts'

export function BarsChart({ points, color, ariaLabel, mini = false }: CartesianChartProps) {
  const radius = mini ? 1.5 : 2.5
  return (
    <>
      {renderCartesianChart({
        points,
        color,
        ariaLabel,
        mini,
        series: {
          type: 'bar',
          data: points.map((p) => p.value),
          barMaxWidth: mini ? 6 : 28,
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
      })}
    </>
  )
}
