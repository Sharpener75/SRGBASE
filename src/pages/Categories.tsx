import { useParams, useSearchParams } from 'react-router-dom'
import { useMemo } from 'react'
import FilterSidebar from '../components/FilterSidebar'
import StackedBarChart from '../components/StackedBarChart'
import DataTable from '../components/DataTable'
import { parseFiltersFromURL, filtersToSearchParams } from '../utils/filterUtils'
import { formatExpression } from '../utils/formatters'
import type { SncRNACategory, ColumnDef, FilterState } from '../types'
import rawData from '../data/sncRNA_categories.json'

const allData = rawData as SncRNACategory[]

const columns: ColumnDef<SncRNACategory>[] = [
  { key: 'id', header: 'sncRNA ID', sortable: true },
  { key: 'type', header: 'Type', sortable: true,
    render: (v) => (
      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
        {String(v)}
      </span>
    ),
  },
  { key: 'tissue', header: 'Tissue', sortable: true },
  { key: 'timepoint', header: 'Time Point', sortable: true },
  {
    key: 'expression',
    header: 'Expression (TPM)',
    sortable: true,
    render: (v) => formatExpression(v as number),
  },
  { key: 'sequence', header: 'Sequence',
    render: (v) => (
      <span className="font-mono text-xs text-gray-500 tracking-wide">
        {String(v).slice(0, 18)}{String(v).length > 18 ? '…' : ''}
      </span>
    ),
  },
]

export default function Categories() {
  const { subclass } = useParams<{ subclass: string }>()
  const [searchParams, setSearchParams] = useSearchParams()
  const filters = parseFiltersFromURL(searchParams)

  const handleFilterChange = (f: Partial<FilterState>) => {
    const updated = { ...filters, ...f }
    setSearchParams(filtersToSearchParams(updated), { replace: true })
  }

  const filtered = useMemo(() => {
    return allData.filter(row => {
      if (subclass && subclass !== 'All' && row.type !== subclass) return false
      if (filters.tissue !== 'All' && row.tissue !== filters.tissue) return false
      if (filters.timepoint !== 'All' && row.timepoint !== filters.timepoint) return false
      return true
    })
  }, [subclass, filters])

  // Build stacked bar chart data grouped by tissue
  const chartData = useMemo(() => {
    const groups: Record<string, { name: string; miRNA: number; piRNA: number; tsRNA: number; rsRNA: number }> = {}
    for (const row of filtered) {
      const key = `${row.tissue} (${row.timepoint})`
      if (!groups[key]) groups[key] = { name: key, miRNA: 0, piRNA: 0, tsRNA: 0, rsRNA: 0 }
      groups[key][row.type] = (groups[key][row.type] || 0) + 1
    }
    return Object.values(groups)
  }, [filtered])

  return (
    <div className="max-w-screen-xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="font-heading text-2xl font-semibold text-primary">
          sncRNA Categories
          {subclass && subclass !== 'All' && (
            <span className="ml-2 text-lg text-accent">— {subclass}</span>
          )}
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Browse detected sncRNAs by type, tissue, and time point.
        </p>
      </div>

      <div className="flex gap-6 items-start">
        <FilterSidebar
          filters={filters}
          onFilterChange={handleFilterChange}
          showSubclass={false}
        />

        <div className="flex-1 min-w-0 space-y-6">
          {/* Chart */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
            <StackedBarChart
              data={chartData}
              title="sncRNA Count by Tissue and Time Point"
            />
          </div>

          {/* Table */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
            <h3 className="font-semibold text-gray-700 mb-4">Expression Data</h3>
            <DataTable
              data={filtered}
              columns={columns}
              pageSize={20}
              searchable
            />
          </div>
        </div>
      </div>
    </div>
  )
}
