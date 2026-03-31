import { useParams, useSearchParams } from 'react-router-dom'
import { useState, useMemo } from 'react'
import FilterSidebar from '../components/FilterSidebar'
import VolcanoPlot from '../components/VolcanoPlot'
import DataTable from '../components/DataTable'
import { parseFiltersFromURL, filtersToSearchParams } from '../utils/filterUtils'
import { formatLog2FC, formatPadj } from '../utils/formatters'
import type { DERecord, ColumnDef, FilterState } from '../types'
import rawData from '../data/diff_expression.json'

const allData = rawData as DERecord[]

export default function DiffExpression() {
  const { subclass } = useParams<{ subclass: string }>()
  const [searchParams, setSearchParams] = useSearchParams()
  const filters = parseFiltersFromURL(searchParams)

  // Bidirectional hover state — owned here, passed to both plot and table
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const [log2fcThreshold, setLog2fcThreshold] = useState(1.0)
  const [padjThreshold, setPadjThreshold] = useState(0.05)

  const handleFilterChange = (f: Partial<FilterState>) => {
    const updated = { ...filters, ...f }
    setSearchParams(filtersToSearchParams(updated), { replace: true })
  }

  const filtered = useMemo(() => {
    return allData.filter(row => {
      if (subclass && subclass !== 'All' && row.type !== subclass) return false
      if (filters.tissue !== 'All' && row.tissue !== filters.tissue) return false
      return true
    })
  }, [subclass, filters])

  const columns: ColumnDef<DERecord>[] = [
    { key: 'id', header: 'sncRNA ID', sortable: true },
    { key: 'type', header: 'Type', sortable: true,
      render: (v) => (
        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
          {String(v)}
        </span>
      ),
    },
    { key: 'tissue', header: 'Tissue', sortable: true },
    { key: 'comparison', header: 'Comparison', sortable: false },
    {
      key: 'log2FC',
      header: 'Log₂FC',
      sortable: true,
      render: (v) => (
        <span className={`font-mono font-medium ${
          (v as number) > 0 ? 'text-up-color' : (v as number) < 0 ? 'text-down-color' : 'text-gray-500'
        }`}>
          {formatLog2FC(v as number)}
        </span>
      ),
    },
    { key: 'pvalue', header: 'p-value', sortable: true,
      render: (v) => formatPadj(v as number) },
    { key: 'padj', header: 'adj. p-value', sortable: true,
      render: (v) => formatPadj(v as number) },
    {
      key: 'regulation',
      header: 'Regulation',
      sortable: true,
      render: (v) => (
        <span className={`px-2 py-0.5 rounded text-xs font-semibold text-white ${
          v === 'Up' ? 'bg-up-color' : v === 'Down' ? 'bg-down-color' : 'bg-gray-400'
        }`}>
          {String(v)}
        </span>
      ),
    },
  ]

  const summary = useMemo(() => ({
    up: filtered.filter(d => d.regulation === 'Up').length,
    down: filtered.filter(d => d.regulation === 'Down').length,
    ns: filtered.filter(d => d.regulation === 'NS').length,
  }), [filtered])

  return (
    <div className="max-w-screen-xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="font-heading text-2xl font-semibold text-primary">
          Differential Expression
          {subclass && subclass !== 'All' && (
            <span className="ml-2 text-lg text-accent">— {subclass}</span>
          )}
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Comparison: 35w (peak-laying) vs. 16w (pre-laying). Hover a table row or volcano point to highlight the corresponding element.
        </p>
      </div>

      <div className="flex gap-6 items-start">
        {/* Sidebar with threshold controls */}
        <FilterSidebar
          filters={filters}
          onFilterChange={handleFilterChange}
          showSubclass={false}
          showTimepoint={false}
          customContent={
            <div className="space-y-4">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Thresholds</p>
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1">
                  |Log₂FC| ≥ {log2fcThreshold.toFixed(1)}
                </label>
                <input
                  type="range" min={0.5} max={4} step={0.1}
                  value={log2fcThreshold}
                  onChange={e => setLog2fcThreshold(Number(e.target.value))}
                  className="w-full accent-primary"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1">
                  adj. p-value ≤ {padjThreshold}
                </label>
                <input
                  type="range" min={0.01} max={0.2} step={0.01}
                  value={padjThreshold}
                  onChange={e => setPadjThreshold(Number(e.target.value))}
                  className="w-full accent-primary"
                />
              </div>
              <div className="grid grid-cols-3 gap-1 text-center text-xs mt-2">
                <div className="bg-up-color/10 rounded p-1.5">
                  <div className="font-bold text-up-color">{summary.up}</div>
                  <div className="text-gray-500">Up</div>
                </div>
                <div className="bg-gray-100 rounded p-1.5">
                  <div className="font-bold text-gray-500">{summary.ns}</div>
                  <div className="text-gray-500">NS</div>
                </div>
                <div className="bg-down-color/10 rounded p-1.5">
                  <div className="font-bold text-down-color">{summary.down}</div>
                  <div className="text-gray-500">Down</div>
                </div>
              </div>
            </div>
          }
        />

        <div className="flex-1 min-w-0 space-y-5">
          {/* Volcano Plot */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
            <h3 className="font-semibold text-gray-700 mb-3">Volcano Plot</h3>
            <div className="overflow-x-auto min-w-[400px]">
              <VolcanoPlot
                data={filtered}
                log2fcThreshold={log2fcThreshold}
                padjThreshold={padjThreshold}
                hoveredId={hoveredId}
                onHoverChange={setHoveredId}
              />
            </div>
          </div>

          {/* Data Table */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
            <h3 className="font-semibold text-gray-700 mb-4">DE Results Table</h3>
            <DataTable
              data={filtered}
              columns={columns}
              hoveredId={hoveredId}
              onHoverChange={setHoveredId}
              pageSize={20}
              searchable
            />
          </div>
        </div>
      </div>
    </div>
  )
}
