import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts'

interface BarDatum {
  name: string
  miRNA?: number
  piRNA?: number
  tsRNA?: number
  rsRNA?: number
  [key: string]: string | number | undefined
}

interface StackedBarChartProps {
  data: BarDatum[]
  title?: string
}

const TYPE_COLORS: Record<string, string> = {
  miRNA: '#1B4F72',
  piRNA: '#1ABC9C',
  tsRNA: '#E67E22',
  rsRNA: '#8E44AD',
}

export default function StackedBarChart({ data, title }: StackedBarChartProps) {
  const keys = ['miRNA', 'piRNA', 'tsRNA', 'rsRNA']

  return (
    <div>
      {title && <h3 className="text-sm font-semibold text-gray-600 mb-3">{title}</h3>}
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} margin={{ top: 10, right: 20, left: 10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="name" tick={{ fontSize: 12, fontFamily: 'IBM Plex Sans' }} />
          <YAxis tick={{ fontSize: 11, fontFamily: 'IBM Plex Sans' }} label={{ value: 'Count', angle: -90, position: 'insideLeft', style: { fontSize: 11 } }} />
          <Tooltip
            contentStyle={{ fontFamily: 'IBM Plex Sans', fontSize: 12, borderRadius: 6 }}
            formatter={(value: number, name: string) => [value.toLocaleString(), name]}
          />
          <Legend wrapperStyle={{ fontFamily: 'IBM Plex Sans', fontSize: 12 }} />
          {keys.map(key => (
            <Bar key={key} dataKey={key} stackId="a" fill={TYPE_COLORS[key]} radius={key === 'rsRNA' ? [4, 4, 0, 0] : undefined} />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
