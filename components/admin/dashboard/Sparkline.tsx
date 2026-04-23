/**
 * Sparkline — inline SVG polyline. Zero dependencies.
 */
export function Sparkline({
  values,
  width = 96,
  height = 28,
  stroke = 'currentColor',
  fill = 'currentColor',
  fillOpacity = 0.12,
}: {
  values: number[]
  width?: number
  height?: number
  stroke?: string
  fill?: string
  fillOpacity?: number
}) {
  if (values.length === 0) {
    return (
      <svg width={width} height={height} className="text-fg-muted/40">
        <line x1="0" y1={height / 2} x2={width} y2={height / 2} stroke="currentColor" strokeWidth="1" strokeDasharray="2 2" />
      </svg>
    )
  }

  const max = Math.max(...values, 1)
  const stepX = values.length > 1 ? width / (values.length - 1) : width / 2
  const paddingY = 2

  const points = values.map((v, i) => {
    const x = values.length > 1 ? i * stepX : width / 2
    const y = paddingY + (height - paddingY * 2) * (1 - v / max)
    return `${x.toFixed(1)},${y.toFixed(1)}`
  })

  const polyline = points.join(' ')
  const areaPath = `M0,${height} L${points.join(' L ')} L${width},${height} Z`

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} aria-hidden>
      <path d={areaPath} fill={fill} fillOpacity={fillOpacity} />
      <polyline points={polyline} fill="none" stroke={stroke} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
