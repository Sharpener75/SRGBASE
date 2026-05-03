import { useParams, useSearchParams } from 'react-router-dom'
import { useMemo } from 'react'
import FilterSidebar from '../components/FilterSidebar'
import PieChart from '../components/PieChart'
import SequenceLogo from '../components/SequenceLogo'
import DataTable from '../components/DataTable'
import { parseFiltersFromURL, filtersToSearchParams } from '../utils/filterUtils'
import type { Top50Entry, Top50PieData, SncRNAType, ColumnDef, FilterState } from '../types'
import rawData from '../data/top50.json'
import rawPie from '../data/top50_pie.json'

const allData = rawData as Top50Entry[]
const pieDataAll = rawPie as Top50PieData

const columns: ColumnDef<Top50Entry>[] = [
  { key: 'rank', header: 'Rank', sortable: true, width: 'w-16' },
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
  { key: 'tpm', header: 'Expression (TPM)', sortable: true,
    render: (v) => (v as number).toLocaleString('en-US', { maximumFractionDigits: 2 }) },
  { key: 'percentTPM', header: '% TPM', sortable: true,
    render: (v) => `${(v as number).toFixed(2)}%` },
  { key: 'seedSequence', header: 'Seed (2–8 nt)',
    render: (v) => (
      <span className="font-mono text-xs text-accent tracking-widest font-medium">{String(v)}</span>
    ),
  },
]

const PIE_COLORS = ['#7D3C98', '#C39BD3', '#2E86C1', '#85C1E9', '#D4AC0D', '#F9E79F']

export default function Top50() {
  const { subclass } = useParams<{ subclass: string }>()
  const [searchParams, setSearchParams] = useSearchParams()
  const filters = parseFiltersFromURL(searchParams)

  const handleFilterChange = (f: Partial<FilterState>) => {
    const updated = { ...filters, ...f }
    setSearchParams(filtersToSearchParams(updated), { replace: true })
  }

  const currentSubclass = (subclass && subclass !== 'All' ? subclass : 'miRNA') as SncRNAType

  const filtered = useMemo(() => {
    return allData.filter(row => {
      if (subclass && subclass !== 'All' && row.type !== subclass) return false
      if (filters.tissue !== 'All' && row.tissue !== filters.tissue) return false
      if (filters.timepoint !== 'All' && row.timepoint !== filters.timepoint) return false
      return true
    }).slice(0, 50)
  }, [subclass, filters])

  // Pie data: from top50_pie.json, keyed by subclass
  const pieData = pieDataAll[currentSubclass] ?? []

  // Seed sequences for logo
  const seeds = useMemo(() => filtered.map(r => r.seedSequence).filter(Boolean), [filtered])

  return (
    <div className="max-w-screen-xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="font-heading text-2xl font-semibold text-primary">
          Top 50 sncRNAs
          {subclass && subclass !== 'All' && (
            <span className="ml-2 text-lg text-accent">— {subclass}</span>
          )}
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Most abundant small non-coding RNAs ranked by expression (TPM).
        </p>
      </div>

      <div className="flex gap-6 items-start">
        <FilterSidebar
          filters={filters}
          onFilterChange={handleFilterChange}
          showSubclass={false}
        />

        <div className="flex-1 min-w-0 space-y-6">
          {/* Charts row */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
              <PieChart
                data={pieData}
                title={`${currentSubclass} TPM by Tissue & Timepoint`}
                colors={PIE_COLORS}
              />
            </div>
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
              <SequenceLogo
                sequences={seeds}
                title="Seed Sequence Logo (Top 50)"
                height={140}
              />
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
            <h3 className="font-semibold text-gray-700 mb-4">Top 50 sncRNAs</h3>
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
