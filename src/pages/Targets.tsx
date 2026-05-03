import { useParams, useSearchParams } from 'react-router-dom'
import { useState, useMemo } from 'react'
import DataTable from '../components/DataTable'
import type { TargetEntry, ColumnDef } from '../types'
import rawData from '../data/targets.json'

const allData = rawData as TargetEntry[]

const columns: ColumnDef<TargetEntry>[] = [
  { key: 'sncRNAId', header: 'sncRNA ID', sortable: true },
  { key: 'sncRNAType', header: 'Type', sortable: true,
    render: (v) => (
      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
        {String(v)}
      </span>
    ),
  },
  { key: 'bindingSiteLabel', header: 'Binding Site', sortable: true,
    render: (v) => (
      <span className={`px-2 py-0.5 rounded text-xs font-medium ${
        String(v).toLowerCase().includes('promoter')
          ? 'bg-purple-100 text-purple-700'
          : 'bg-teal-100 text-teal-700'
      }`}>
        {String(v)}
      </span>
    ),
  },
  { key: 'targetGene', header: 'Target Gene', sortable: true,
    render: (v) => <span className="font-semibold text-text-main font-mono">{String(v)}</span> },
  { key: 'geneDescription', header: 'Gene Description', sortable: false },
  { key: 'mfe', header: 'MFE (kcal/mol)', sortable: true,
    render: (v) => (
      <span className="font-mono text-sm text-gray-700">
        {(v as number).toFixed(1)}
      </span>
    ),
  },
  { key: 'targetExpression', header: 'Target Expression', sortable: true,
    render: (v) => (
      <span className={`px-2 py-0.5 rounded text-xs font-semibold text-white ${
        v === 'Upregulated' ? 'bg-up-color' : 'bg-down-color'
      }`}>
        {String(v)}
      </span>
    ),
  },
  { key: 'tissue', header: 'Tissue', sortable: true },
]

// Parse subclass: "miRNA_promoter" → {type:'miRNA', binding:'promoter'}
//                 "miRNA_body"     → {type:'miRNA', binding:'body'}
function parseSubclass(subclass?: string) {
  if (!subclass) return { type: null, binding: null }
  const idx = subclass.lastIndexOf('_')
  if (idx < 0) return { type: subclass, binding: null }
  const type = subclass.slice(0, idx)
  const binding = subclass.slice(idx + 1)
  return { type, binding }
}

export default function Targets() {
  const { subclass } = useParams<{ subclass: string }>()
  const [searchName, setSearchName] = useState('')
  const { type, binding } = parseSubclass(subclass)

  const filtered = useMemo(() => {
    return allData.filter(row => {
      if (type && type !== 'All' && row.sncRNAType !== type) return false
      if (binding && row.bindingSite !== binding) return false
      if (searchName.trim()) {
        const term = searchName.trim().toLowerCase()
        return row.sncRNAId.toLowerCase().includes(term)
      }
      return true
    })
  }, [type, binding, searchName])

  const bindingLabel = binding === 'promoter' ? 'Promoter' : binding === 'body' ? 'RNA/Gene Body' : binding

  return (
    <div className="max-w-screen-xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="font-heading text-2xl font-semibold text-primary">
          Target Gene Prediction
          {type && <span className="ml-2 text-lg text-accent">— {type}</span>}
          {binding && <span className="ml-1 text-base text-gray-500">({bindingLabel})</span>}
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Predicted target genes for sncRNAs based on promoter and RNA/gene body interactions.
        </p>
      </div>

      <div className="flex gap-6 items-start">
        {/* Search-only sidebar */}
        <aside className="w-56 flex-shrink-0 bg-white rounded-xl border border-gray-200 shadow-sm p-4 space-y-4 self-start sticky top-20">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Search</h3>
          <div>
            <label className="text-xs font-medium text-gray-600 block mb-1.5">sncRNA Name</label>
            <input
              type="text"
              placeholder="e.g. gga-miR-21"
              value={searchName}
              onChange={e => setSearchName(e.target.value)}
              className="w-full text-sm border border-gray-200 rounded-md px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-accent/50"
            />
          </div>
          <div className="text-xs text-gray-400 pt-1 border-t border-gray-100">
            {filtered.length} interactions found
          </div>
          {searchName && (
            <button
              onClick={() => setSearchName('')}
              className="w-full text-xs text-gray-400 hover:text-primary py-1 border border-gray-100 rounded hover:border-primary/30"
            >
              Clear
            </button>
          )}
        </aside>

        <div className="flex-1 min-w-0">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
            <h3 className="font-semibold text-gray-700 mb-4">Target Interactions</h3>
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
