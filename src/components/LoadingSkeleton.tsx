interface TableSkeletonProps {
  rows?: number
}

interface ChartSkeletonProps {
  height?: number
}

export function TableSkeleton({ rows = 8 }: TableSkeletonProps) {
  return (
    <div className="animate-pulse">
      {/* Header */}
      <div className="flex gap-4 mb-3 bg-gray-100 p-3 rounded">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-4 bg-gray-200 rounded flex-1" />
        ))}
      </div>
      {/* Rows */}
      {[...Array(rows)].map((_, i) => (
        <div key={i} className="flex gap-4 py-3 border-b border-gray-100">
          {[...Array(5)].map((_, j) => (
            <div
              key={j}
              className="h-3 bg-gray-100 rounded flex-1"
              style={{ opacity: 1 - i * 0.05 }}
            />
          ))}
        </div>
      ))}
    </div>
  )
}

export function ChartSkeleton({ height = 300 }: ChartSkeletonProps) {
  return (
    <div
      className="animate-pulse bg-gray-100 rounded-lg w-full"
      style={{ height }}
    >
      <div className="flex items-end justify-around h-full px-8 pb-8 pt-8 gap-3">
        {[70, 45, 85, 60, 55, 75, 40, 90, 65].map((h, i) => (
          <div
            key={i}
            className="bg-gray-200 rounded-t flex-1"
            style={{ height: `${h}%` }}
          />
        ))}
      </div>
    </div>
  )
}
