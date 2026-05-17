import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'

interface MiniBarChartProps {
  data: { name: string; value: number; color: string }[]
}

export default function MiniBarChart({ data }: MiniBarChartProps) {
  return (
    <ResponsiveContainer width="100%" height={70}>
      <BarChart data={data} margin={{ top: 2, right: 2, bottom: 0, left: 2 }}>
        <XAxis dataKey="name" tick={{ fontSize: 8, fontFamily: 'IBM Plex Sans' }} interval={0} />
        <Tooltip
          contentStyle={{ fontSize: 10, padding: '2px 6px', fontFamily: 'IBM Plex Sans' }}
          formatter={(v: number) => [v.toLocaleString(), '']}
        />
        <Bar dataKey="value" radius={[2, 2, 0, 0]}>
          {data.map((d, i) => (
            <Cell key={i} fill={d.color} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
