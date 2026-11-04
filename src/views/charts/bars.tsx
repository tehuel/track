import { renderCartesianChart, type CartesianChartProps } from './echarts'

export function BarsChart({ points, color, ariaLabel, mini = false }: CartesianChartProps) {
  const radius = mini ? 2 : 3
  return (
    <div class="w-100 h-100" style={mini ? { height: '2rem' } : undefined}>
      {renderCartesianChart({
        points,
        color,
        ariaLabel,
        mini,
        series: {
          type: 'bar',
          data: points.map((p) => p.value),
          barWidth: '65%',
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
    </div>
  )
}
