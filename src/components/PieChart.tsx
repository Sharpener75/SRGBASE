import {
  PieChart as RechartsPieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer
} from 'recharts'

export interface PieDatum {
  name: string
  value: number
}

interface PieChartProps {
  data: PieDatum[]
  title?: string
  colors?: string[]
}

const DEFAULT_COLORS = ['#1B4F72', '#1ABC9C', '#E67E22', '#8E44AD', '#2980B9', '#F39C12']

const RADIAN = Math.PI / 180
function renderCustomLabel({ cx, cy, midAngle, innerRadius, outerRadius, percent, name, fill }: {
  cx: number; cy: number; midAngle: number; innerRadius: number; outerRadius: number
  percent: number; name?: string; fill?: string
}) {
  const cos = Math.cos(-midAngle * RADIAN)
  const sin = Math.sin(-midAngle * RADIAN)

  // Tiny slices are too thin to see — draw an external leader line + percentage.
  if (percent < 0.04) {
    const pct = percent * 100
    const pctText = `${pct < 1 ? pct.toFixed(2) : pct.toFixed(1)}%`
    const sx = cx + outerRadius * cos
    const sy = cy + outerRadius * sin
    const mx = cx + (outerRadius + 12) * cos
    const my = cy + (outerRadius + 12) * sin
    const side = cos >= 0 ? 1 : -1
    const ex = mx + side * 20
    const color = fill ?? '#1B4F72'
    return (
      <g>
        <polyline points={`${sx},${sy} ${mx},${my} ${ex},${my}`}
          stroke={color} strokeWidth={1} fill="none" />
        <circle cx={ex} cy={my} r={1.8} fill={color} />
        <text x={ex + side * 4} y={my}
          textAnchor={side > 0 ? 'start' : 'end'} dominantBaseline="central"
          fontSize={10} fontWeight={700} fill={color} fontFamily="IBM Plex Sans">
          {name ? `${name} ${pctText}` : pctText}
        </text>
      </g>
    )
  }

  const radius = innerRadius + (outerRadius - innerRadius) * 0.5
  const x = cx + radius * cos
  const y = cy + radius * sin
  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={11} fontFamily="IBM Plex Sans">
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  )
}

export default function PieChart({ data, title, colors = DEFAULT_COLORS }: PieChartProps) {
  return (
    <div>
      {title && <h3 className="text-sm font-semibold text-gray-600 mb-3">{title}</h3>}
      <ResponsiveContainer width="100%" height={260}>
        <RechartsPieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            outerRadius={90}
            dataKey="value"
            labelLine={false}
            label={renderCustomLabel}
          >
            {data.map((_, i) => (
              <Cell key={i} fill={colors[i % colors.length]} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value: number) => [value.toLocaleString(), 'Reads']}
            contentStyle={{ fontFamily: 'IBM Plex Sans', fontSize: 12, borderRadius: 6 }}
          />
          <Legend wrapperStyle={{ fontFamily: 'IBM Plex Sans', fontSize: 12 }} />
        </RechartsPieChart>
      </ResponsiveContainer>
    </div>
  )
}
