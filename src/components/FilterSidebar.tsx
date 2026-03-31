import type { FilterState, Tissue, Timepoint, SncRNAType } from '../types'

interface FilterSidebarProps {
  filters: FilterState
  onFilterChange: (f: Partial<FilterState>) => void
  showSubclass?: boolean
  showTissue?: boolean
  showTimepoint?: boolean
  customContent?: React.ReactNode
}

const tissues: (Tissue | 'All')[] = ['All', 'Hypothalamus', 'Pituitary', 'Ovary']
const timepoints: (Timepoint | 'All')[] = ['All', '16w', '35w']
const subclasses: (SncRNAType | 'All')[] = ['All', 'miRNA', 'piRNA', 'tsRNA', 'rsRNA']

const tissueColors: Record<string, string> = {
  Hypothalamus: '#7D3C98',
  Pituitary: '#2E86C1',
  Ovary: '#D4AC0D',
}

const typeColors: Record<string, string> = {
  miRNA: '#1B4F72',
  piRNA: '#1ABC9C',
  tsRNA: '#E67E22',
  rsRNA: '#8E44AD',
}

export default function FilterSidebar({
  filters,
  onFilterChange,
  showSubclass = true,
  showTissue = true,
  showTimepoint = true,
  customContent,
}: FilterSidebarProps) {
  return (
    <aside className="w-56 flex-shrink-0 bg-white rounded-xl border border-gray-200 shadow-sm p-4 space-y-5 self-start sticky top-20">
      <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Filters</h3>

      {showSubclass && (
        <div>
          <p className="text-xs font-medium text-gray-600 mb-2">sncRNA Type</p>
          <div className="space-y-1">
            {subclasses.map(s => (
              <button
                key={s}
                onClick={() => onFilterChange({ subclass: s as FilterState['subclass'] })}
                className={`w-full text-left px-3 py-1.5 rounded text-sm flex items-center gap-2 transition-colors ${
                  filters.subclass === s
                    ? 'bg-primary text-white'
                    : 'text-text-main hover:bg-gray-50'
                }`}
              >
                {s !== 'All' && (
                  <span
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ background: typeColors[s] || '#ccc' }}
                  />
                )}
                {s === 'All' ? 'All types' : s}
              </button>
            ))}
          </div>
        </div>
      )}

      {showTissue && (
        <div>
          <p className="text-xs font-medium text-gray-600 mb-2">Tissue</p>
          <div className="space-y-1">
            {tissues.map(t => (
              <button
                key={t}
                onClick={() => onFilterChange({ tissue: t as FilterState['tissue'] })}
                className={`w-full text-left px-3 py-1.5 rounded text-sm flex items-center gap-2 transition-colors ${
                  filters.tissue === t
                    ? 'bg-primary text-white'
                    : 'text-text-main hover:bg-gray-50'
                }`}
              >
                {t !== 'All' && (
                  <span
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ background: tissueColors[t] || '#ccc' }}
                  />
                )}
                {t === 'All' ? 'All tissues' : t}
              </button>
            ))}
          </div>
        </div>
      )}

      {showTimepoint && (
        <div>
          <p className="text-xs font-medium text-gray-600 mb-2">Time Point</p>
          <div className="space-y-1">
            {timepoints.map(tp => (
              <button
                key={tp}
                onClick={() => onFilterChange({ timepoint: tp as FilterState['timepoint'] })}
                className={`w-full text-left px-3 py-1.5 rounded text-sm transition-colors ${
                  filters.timepoint === tp
                    ? 'bg-primary text-white'
                    : 'text-text-main hover:bg-gray-50'
                }`}
              >
                {tp === 'All' ? 'All time points' : tp === '16w' ? '16w (Pre-laying)' : '35w (Peak-laying)'}
              </button>
            ))}
          </div>
        </div>
      )}

      {customContent && (
        <div className="border-t border-gray-100 pt-4">
          {customContent}
        </div>
      )}

      <button
        onClick={() => onFilterChange({ tissue: 'All', timepoint: 'All', subclass: 'All' })}
        className="w-full text-xs text-gray-400 hover:text-primary py-1 text-center border border-gray-100 rounded hover:border-primary/30 transition-colors"
      >
        Reset filters
      </button>
    </aside>
  )
}
