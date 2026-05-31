import { useParams, useSearchParams } from 'react-router-dom'
import { useState, useMemo, useEffect } from 'react'
import FilterSidebar from '../components/FilterSidebar'
import VolcanoPlot from '../components/VolcanoPlot'
import DataTable from '../components/DataTable'
import { parseFiltersFromURL, filtersToSearchParams } from '../utils/filterUtils'
import { formatLog2FC, formatPadj } from '../utils/formatters'
import type { DERecord, DEVolcanoRecord, SncRNAType, ColumnDef, FilterState } from '../types'

const VOLCANO_MODULES: Record<string, () => Promise<{ default: unknown[] }>> = {
  miRNA: () => import('../data/diff_expression_miRNA_volcano.json'),
  piRNA: () => import('../data/diff_expression_piRNA_volcano.json'),
  tsRNA: () => import('../data/diff_expression_tsRNA_volcano.json'),
  rsRNA: () => import('../data/diff_expression_rsRNA_volcano.json'),
}
const SIG_MODULES: Record<string, () => Promise<{ default: unknown[] }>> = {
  miRNA: () => import('../data/diff_expression_miRNA_significant.json'),
  piRNA: () => import('../data/diff_expression_piRNA_significant.json'),
  tsRNA: () => import('../data/diff_expression_tsRNA_significant.json'),
  rsRNA: () => import('../data/diff_expression_rsRNA_significant.json'),
}

export default function DiffExpression() {
  const { subclass } = useParams<{ subclass: string }>()
  const [searchParams, setSearchParams] = useSearchParams()
  const filters = parseFiltersFromURL(searchParams)

  const currentSubclass = (subclass && subclass !== 'All' ? subclass : 'miRNA') as SncRNAType

  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const [volcanoData, setVolcanoData] = useState<DEVolcanoRecord[]>([])
  const [sigData, setSigData] = useState<DERecord[]>([])

  useEffect(() => {
    setVolcanoData([])
    setSigData([])
    Promise.all([
      VOLCANO_MODULES[currentSubclass]?.(),
      SIG_MODULES[currentSubclass]?.(),
    ]).then(([vol, sig]) => {
      setVolcanoData((vol?.default ?? []) as DEVolcanoRecord[])
      setSigData((sig?.default ?? []) as DERecord[])
    })
  }, [currentSubclass])

  const handleFilterChange = (f: Partial<FilterState>) => {
    const updated = { ...filters, ...f }
    setSearchParams(filtersToSearchParams(updated), { replace: true })
  }

  // Volcano: filter by tissue only (all types already pre-filtered by file)
  const filteredVolcano = useMemo(() => {
    return volcanoData.filter(row => {
      if (filters.tissue !== 'All' && row.tissue !== filters.tissue) return false
      return true
    })
  }, [volcanoData, filters.tissue])

  // Table: significant rows filtered by tissue; threshold sliders only affect volcano display
  const filteredSig = useMemo(() => {
    return sigData.filter(row => {
      if (filters.tissue !== 'All' && row.tissue !== filters.tissue) return false
      return true
    })
  }, [sigData, filters.tissue])

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
    up:   filteredSig.filter(d => d.regulation === 'Up').length,
    down: filteredSig.filter(d => d.regulation === 'Down').length,
  }), [filteredSig])

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
        <FilterSidebar
          filters={filters}
          onFilterChange={handleFilterChange}
          showSubclass={false}
          showTimepoint={false}
          customContent={
            <div className="space-y-4">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Significance Criterion</p>
              <div className="text-xs text-gray-600 space-y-1 bg-gray-50 rounded-md p-2.5 border border-gray-100">
                <p>|Log₂FC| ≥ <span className="font-semibold text-primary">0.585</span></p>
                <p>p-value ≤ <span className="font-semibold text-primary">0.05</span></p>
              </div>
              <div className="grid grid-cols-2 gap-1 text-center text-xs mt-2">
                <div className="bg-up-color/10 rounded p-1.5">
                  <div className="font-bold text-up-color">{summary.up}</div>
                  <div className="text-gray-500">Up</div>
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
            {filteredVolcano.length === 0 ? (
              <div className="flex items-center justify-center h-40 text-sm text-gray-400">
                Loading…
              </div>
            ) : (
              <div className="overflow-x-auto min-w-[400px]">
                <VolcanoPlot
                  data={filteredVolcano}
                  hoveredId={hoveredId}
                  onHoverChange={setHoveredId}
                />
              </div>
            )}
          </div>

          {/* Significant results table */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
            <h3 className="font-semibold text-gray-700 mb-4">
              Significant DE Results
              <span className="ml-2 text-xs font-normal text-gray-400">
                (|Log₂FC| ≥ 0.585 & p-value ≤ 0.05)
              </span>
            </h3>
            <DataTable
              data={filteredSig}
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
