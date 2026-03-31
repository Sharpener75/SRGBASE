import { useState, useEffect, useRef, useCallback } from 'react'
import type { ColumnDef } from '../types'
import { TableSkeleton } from './LoadingSkeleton'

interface DataTableProps<T extends { id: string }> {
  data: T[]
  columns: ColumnDef<T>[]
  hoveredId?: string | null
  onHoverChange?: (id: string | null) => void
  searchable?: boolean
  pageSize?: number
  isLoading?: boolean
  caption?: string
}

type SortDir = 'asc' | 'desc'

export default function DataTable<T extends { id: string }>({
  data,
  columns,
  hoveredId,
  onHoverChange,
  searchable = true,
  pageSize = 20,
  isLoading = false,
  caption,
}: DataTableProps<T>) {
  const [sortKey, setSortKey] = useState<keyof T | null>(null)
  const [sortDir, setSortDir] = useState<SortDir>('asc')
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const rowRefs = useRef<Record<string, HTMLTableRowElement | null>>({})

  // Scroll to hovered row
  useEffect(() => {
    if (hoveredId && rowRefs.current[hoveredId]) {
      rowRefs.current[hoveredId]!.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    }
  }, [hoveredId])

  // Reset page on filter change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, sortKey, sortDir])

  const handleSort = useCallback((key: keyof T) => {
    if (sortKey === key) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    } else {
      setSortKey(key)
      setSortDir('asc')
    }
  }, [sortKey])

  // Filter
  const filtered = data.filter(row => {
    if (!searchTerm) return true
    const term = searchTerm.toLowerCase()
    return columns.some(col => {
      const val = row[col.key]
      return String(val).toLowerCase().includes(term)
    })
  })

  // Sort
  const sorted = [...filtered].sort((a, b) => {
    if (!sortKey) return 0
    const av = a[sortKey]
    const bv = b[sortKey]
    const cmp = av < bv ? -1 : av > bv ? 1 : 0
    return sortDir === 'asc' ? cmp : -cmp
  })

  // Paginate
  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize))
  const paginated = sorted.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  if (isLoading) return <TableSkeleton rows={pageSize} />

  return (
    <div className="flex flex-col gap-3">
      {/* Search + caption */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        {caption && <p className="text-sm text-gray-500">{caption}</p>}
        {searchable && (
          <div className="relative ml-auto">
            <input
              type="text"
              placeholder="Search…"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="pl-8 pr-3 py-1.5 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-accent/50 bg-white"
            />
            <svg className="absolute left-2.5 top-2 w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 111 11a6 6 0 0116 0z" />
            </svg>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 text-left border-b border-gray-200">
              {columns.map(col => (
                <th
                  key={String(col.key)}
                  className={`px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap ${
                    col.sortable ? 'cursor-pointer select-none hover:text-primary' : ''
                  } ${col.width || ''}`}
                  onClick={() => col.sortable && handleSort(col.key)}
                >
                  <span className="flex items-center gap-1">
                    {col.header}
                    {col.sortable && (
                      <span className="text-gray-300">
                        {sortKey === col.key
                          ? sortDir === 'asc' ? '↑' : '↓'
                          : '↕'}
                      </span>
                    )}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginated.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-8 text-center text-gray-400 text-sm">
                  No results found
                </td>
              </tr>
            ) : (
              paginated.map(row => {
                const isHovered = hoveredId === row.id
                return (
                  <tr
                    key={row.id}
                    ref={el => { rowRefs.current[row.id] = el }}
                    className={`border-b border-gray-100 transition-colors cursor-default ${
                      isHovered
                        ? 'bg-accent/10 border-l-4 border-l-accent'
                        : 'hover:bg-gray-50 border-l-4 border-l-transparent'
                    }`}
                    onMouseEnter={() => onHoverChange?.(row.id)}
                    onMouseLeave={() => onHoverChange?.(null)}
                  >
                    {columns.map(col => (
                      <td key={String(col.key)} className="px-4 py-2.5 text-text-main">
                        {col.render
                          ? col.render(row[col.key], row)
                          : String(row[col.key] ?? '')}
                      </td>
                    ))}
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between text-sm text-gray-500">
        <span>
          {filtered.length === 0
            ? 'No results'
            : `${(currentPage - 1) * pageSize + 1}–${Math.min(currentPage * pageSize, filtered.length)} of ${filtered.length}`}
        </span>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setCurrentPage(1)}
            disabled={currentPage === 1}
            className="px-2 py-1 rounded border border-gray-200 disabled:opacity-40 hover:bg-gray-100"
          >«</button>
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-2 py-1 rounded border border-gray-200 disabled:opacity-40 hover:bg-gray-100"
          >‹</button>
          <span className="px-3 py-1 bg-primary text-white rounded text-xs">
            {currentPage} / {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="px-2 py-1 rounded border border-gray-200 disabled:opacity-40 hover:bg-gray-100"
          >›</button>
          <button
            onClick={() => setCurrentPage(totalPages)}
            disabled={currentPage === totalPages}
            className="px-2 py-1 rounded border border-gray-200 disabled:opacity-40 hover:bg-gray-100"
          >»</button>
        </div>
      </div>
    </div>
  )
}
