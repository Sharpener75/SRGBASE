import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer,
} from 'recharts'
import type { LengthSeries } from '../types'

interface Props {
  data: LengthSeries
  title?: string
}

// 6 series colors: tissue-aligned, solid vs dashed for 16w vs 35w
const SERIES_CONFIG = [
  { key: 'Hypothalamus 16w', color: '#7D3C98', dash: '' },
  { key: 'Hypothalamus 35w', color: '#7D3C98', dash: '5 3' },
  { key: 'Pituitary 16w',   color: '#2E86C1', dash: '' },
  { key: 'Pituitary 35w',   color: '#2E86C1', dash: '5 3' },
  { key: 'Ovary 16w',       color: '#D4AC0D', dash: '' },
  { key: 'Ovary 35w',       color: '#D4AC0D', dash: '5 3' },
]

function pct(v: number) {
  return `${(v * 100).toFixed(1)}%`
}

export default function LengthDistributionChart({ data, title }: Props) {
  if (!data || !data.lengths || data.lengths.length === 0) {
    return (
      <div className="flex items-center justify-center h-40 text-sm text-gray-400">
        No length distribution data available.
      </div>
    )
  }

  // Build flat array: [{ length: 15, 'Hypothalamus 16w': 0.12, ... }, ...]
  const chartData = data.lengths.map((len, i) => {
    const point: Record<string, number> = { length: len }
    for (const s of data.series) {
      point[s.sample] = s.values[i] ?? 0
    }
    return point
  })

  return (
    <div>
      {title && (
        <h4 className="text-sm font-semibold text-gray-600 mb-3">{title}</h4>
      )}
      <ResponsiveContainer width="100%" height={260}>
        <LineChart data={chartData} margin={{ top: 4, right: 16, bottom: 4, left: 8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis
            dataKey="length"
            label={{ value: 'Length (nt)', position: 'insideBottom', offset: -2, fontSize: 11 }}
            tick={{ fontSize: 11 }}
            height={36}
          />
          <YAxis
            tickFormatter={pct}
            tick={{ fontSize: 11 }}
            width={48}
          />
          <Tooltip
            formatter={(value: number, name: string) => [pct(value), name]}
            labelFormatter={(label) => `Length: ${label} nt`}
            contentStyle={{ fontSize: 12 }}
          />
          <Legend
            wrapperStyle={{ fontSize: 11, paddingTop: 8 }}
          />
          {SERIES_CONFIG.map(cfg => {
            const seriesExists = data.series.some(s => s.sample === cfg.key)
            if (!seriesExists) return null
            return (
              <Line
                key={cfg.key}
                type="monotone"
                dataKey={cfg.key}
                stroke={cfg.color}
                strokeDasharray={cfg.dash || undefined}
                strokeWidth={1.8}
                dot={false}
                activeDot={{ r: 4 }}
              />
            )
          })}
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
