import { useParams, useSearchParams } from 'react-router-dom'
import { useMemo } from 'react'
import FilterSidebar from '../components/FilterSidebar'
import StackedBarChart from '../components/StackedBarChart'
import LengthDistributionChart from '../components/LengthDistributionChart'
import { parseFiltersFromURL, filtersToSearchParams } from '../utils/filterUtils'
import type { CategoryCount, LengthDistribution, SncRNAType, FilterState } from '../types'
import rawCounts from '../data/categories_counts.json'
import rawLength from '../data/length_distribution.json'

const allCounts = rawCounts as CategoryCount[]
const lengthDist = rawLength as LengthDistribution

export default function Categories() {
  const { subclass } = useParams<{ subclass: string }>()
  const [searchParams, setSearchParams] = useSearchParams()
  const filters = parseFiltersFromURL(searchParams)

  const handleFilterChange = (f: Partial<FilterState>) => {
    const updated = { ...filters, ...f }
    setSearchParams(filtersToSearchParams(updated), { replace: true })
  }

  const filtered = useMemo(() => {
    return allCounts.filter(row => {
      if (subclass && subclass !== 'All' && row.type !== subclass) return false
      if (filters.tissue !== 'All' && row.tissue !== filters.tissue) return false
      if (filters.timepoint !== 'All' && row.timepoint !== filters.timepoint) return false
      return true
    })
  }, [subclass, filters])

  // Build stacked bar chart data grouped by tissue×timepoint
  const chartData = useMemo(() => {
    const groups: Record<string, { name: string; miRNA: number; piRNA: number; tsRNA: number; rsRNA: number }> = {}
    for (const row of filtered) {
      const key = `${row.tissue} (${row.timepoint})`
      if (!groups[key]) groups[key] = { name: key, miRNA: 0, piRNA: 0, tsRNA: 0, rsRNA: 0 }
      groups[key][row.type] += row.count
    }
    return Object.values(groups)
  }, [filtered])

  // Length distribution: use the subclass-keyed series; dim non-matching samples when filters active
  const currentSubclass = (subclass && subclass !== 'All' ? subclass : 'miRNA') as SncRNAType
  const rawLenSeries = lengthDist[currentSubclass]

  const lenSeries = useMemo(() => {
    if (!rawLenSeries) return rawLenSeries
    if (filters.tissue === 'All' && filters.timepoint === 'All') return rawLenSeries

    const activeSamples = new Set<string>()
    for (const t of ['Hypothalamus', 'Pituitary', 'Ovary']) {
      for (const tp of ['16w', '35w']) {
        const tissueOk = filters.tissue === 'All' || filters.tissue === t
        const tpOk = filters.timepoint === 'All' || filters.timepoint === tp
        if (tissueOk && tpOk) activeSamples.add(`${t} ${tp}`)
      }
    }

    return {
      ...rawLenSeries,
      series: rawLenSeries.series.map(s => ({
        ...s,
        values: activeSamples.has(s.sample) ? s.values : s.values.map(() => 0),
      })),
    }
  }, [rawLenSeries, filters.tissue, filters.timepoint])

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
          {/* Count bar chart */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
            <StackedBarChart
              data={chartData}
              title="sncRNA Count by Tissue and Time Point"
            />
          </div>

          {/* Length distribution */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
            <h3 className="font-semibold text-gray-700 mb-1">
              Length Distribution — {currentSubclass}
            </h3>
            <p className="text-xs text-gray-400 mb-4">
              Percentage of reads at each length across tissue × timepoint samples.
              Solid lines = 16w, dashed = 35w.
            </p>
            {lenSeries ? (
              <LengthDistributionChart data={lenSeries} />
            ) : (
              <p className="text-sm text-gray-400">No data for {currentSubclass}.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
