import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'

interface MiniBarChartProps {
  data: { name: string; value: number; color: string }[]
}

const MIRNA_COLOR = '#1B4F72'

export default function MiniBarChart({ data }: MiniBarChartProps) {
  const total = data.reduce((sum, d) => sum + d.value, 0)

  // miRNA is bar index 0; its count is tiny next to piRNA, so the bar is
  // near-invisible. Annotate it with a leader line + percentage label.
  const renderMiRnaLabel = (props: {
    x?: number; y?: number; width?: number; index?: number; value?: number
  }) => {
    if (props.index !== 0) return <g />
    const { x = 0, y = 0, width = 0, value = 0 } = props
    const cx = x + width / 2
    const pct = total > 0 ? (value / total) * 100 : 0
    const pctText = `${pct < 1 ? pct.toFixed(2) : pct.toFixed(1)}%`
    const labelY = 11
    return (
      <g>
        <line
          x1={cx} y1={labelY + 3} x2={cx} y2={y - 1}
          stroke={MIRNA_COLOR} strokeWidth={0.75}
        />
        <circle cx={cx} cy={y - 1} r={1.6} fill={MIRNA_COLOR} />
        <text
          x={cx} y={labelY} textAnchor="middle"
          fontSize={9} fontWeight={700} fill={MIRNA_COLOR}
          fontFamily="IBM Plex Sans"
        >
          {pctText}
        </text>
      </g>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={70}>
      <BarChart data={data} margin={{ top: 6, right: 2, bottom: 0, left: 2 }}>
        <XAxis dataKey="name" tick={{ fontSize: 8, fontFamily: 'IBM Plex Sans' }} interval={0} />
        <Tooltip
          contentStyle={{ fontSize: 10, padding: '2px 6px', fontFamily: 'IBM Plex Sans' }}
          formatter={(v: number) => [v.toLocaleString(), '']}
        />
        <Bar dataKey="value" radius={[2, 2, 0, 0]} minPointSize={2} label={renderMiRnaLabel}>
          {data.map((d, i) => (
            <Cell key={i} fill={d.color} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
