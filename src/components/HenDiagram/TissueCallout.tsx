import MiniBarChart from './MiniBarChart'

interface TissueCalloutProps {
  // Line start (tissue ellipse center)
  x1: number
  y1: number
  // Card top-left position
  cx: number
  cy: number
  tissue: string
  color: string
  data16w: { miRNA: number; piRNA: number; tsRNA: number; rsRNA: number }
  data35w: { miRNA: number; piRNA: number; tsRNA: number; rsRNA: number }
  timepoint: '16w' | '35w'
}

const TYPE_COLORS: Record<string, string> = {
  miRNA: '#1B4F72',
  piRNA: '#1ABC9C',
  tsRNA: '#E67E22',
  rsRNA: '#8E44AD',
}

export default function TissueCallout({
  x1, y1, cx, cy, tissue, color, data16w, data35w, timepoint
}: TissueCalloutProps) {
  const cardW = 155
  const cardH = 110
  const data = timepoint === '16w' ? data16w : data35w

  const chartData = [
    { name: 'miRNA', value: data.miRNA, color: TYPE_COLORS.miRNA },
    { name: 'piRNA', value: data.piRNA, color: TYPE_COLORS.piRNA },
    { name: 'tsRNA', value: data.tsRNA, color: TYPE_COLORS.tsRNA },
    { name: 'rsRNA', value: data.rsRNA, color: TYPE_COLORS.rsRNA },
  ]

  // Line endpoint: card midpoint left or right edge
  const x2 = cx + cardW / 2
  const y2 = cy + 10

  return (
    <g>
      {/* Dashed callout line */}
      <line
        x1={x1} y1={y1} x2={x2} y2={y2}
        stroke={color}
        strokeWidth={1.5}
        strokeDasharray="5 3"
        opacity={0.7}
      />
      {/* Card background */}
      <rect
        x={cx} y={cy}
        width={cardW} height={cardH}
        fill="white"
        stroke={color}
        strokeWidth={1.5}
        rx={6}
        filter="drop-shadow(0 2px 4px rgba(0,0,0,0.12))"
      />
      {/* Tissue label */}
      <text
        x={cx + cardW / 2} y={cy + 14}
        textAnchor="middle"
        fontSize={10}
        fontWeight="600"
        fill={color}
        fontFamily="IBM Plex Sans"
      >
        {tissue}
      </text>
      {/* Mini bar chart via foreignObject */}
      <foreignObject x={cx + 2} y={cy + 18} width={cardW - 4} height={90}>
        <div style={{ width: '100%', height: '100%', fontFamily: 'IBM Plex Sans' }} {...{ xmlns: 'http://www.w3.org/1999/xhtml' } as object}>
          <MiniBarChart data={chartData} />
        </div>
      </foreignObject>
    </g>
  )
}
