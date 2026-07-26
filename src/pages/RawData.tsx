import DataTable from '../components/DataTable'
import type { RawDataLibrary, ColumnDef } from '../types'
import rawLibs from '../data/raw_data.json'

const libraries = rawLibs as RawDataLibrary[]

const columns: ColumnDef<RawDataLibrary>[] = [
  { key: 'libraryId', header: 'Library ID', sortable: true },
  { key: 'tissue', header: 'Tissue', sortable: true },
  { key: 'timepoint', header: 'Time Point', sortable: true },
  { key: 'replicate', header: 'Replicate', sortable: true },
  { key: 'totalReads_M', header: 'Total Reads (M)', sortable: true,
    render: (v) => `${(v as number).toFixed(1)}M` },
  { key: 'mappedReads_M', header: 'Mapped Reads (M)', sortable: true,
    render: (v) => `${(v as number).toFixed(1)}M` },
  { key: 'mappingRate_pct', header: 'Mapping Rate', sortable: true,
    render: (v) => (
      <div className="flex items-center gap-2">
        <div className="w-16 bg-gray-100 rounded-full h-1.5">
          <div
            className="h-1.5 rounded-full bg-accent"
            style={{ width: `${v as number}%` }}
          />
        </div>
        <span className="text-xs text-gray-600">{(v as number).toFixed(1)}%</span>
      </div>
    ),
  },
  { key: 'sraAccession', header: 'SRA Accession', sortable: false,
    render: (v) => (
      <span className="font-mono text-xs text-primary">{String(v)}</span>
    ),
  },
]

export default function RawData() {
  return (
    <div className="max-w-screen-xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="font-heading text-2xl font-semibold text-primary mb-2">Raw Sequencing Data</h1>
        <p className="text-gray-600 leading-relaxed max-w-2xl">
          All raw sequencing data from this study are deposited in the NCBI Sequence Read Archive (SRA).
          Reads were processed using standard small RNA-seq pipelines with alignment to the <em>Gallus gallus</em> reference genome (GalGal6).
        </p>
      </div>

      {/* NCBI SRA link */}
      <div className="bg-gradient-to-r from-primary/5 to-accent/5 border border-primary/20 rounded-xl p-6 mb-8 flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="font-heading text-lg font-semibold text-primary mb-1">NCBI Sequence Read Archive</h2>
          <p className="text-sm text-gray-600">
            18 libraries available — 3 tissues × 2 time points × 3 biological replicates
          </p>
          <p className="text-xs text-gray-400 mt-1">BioProject accession: PRJNA_PLACEHOLDER</p>
        </div>
        <a
          href="https://www.ncbi.nlm.nih.gov/sra?term=PRJNA_PLACEHOLDER"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-lg font-medium hover:bg-primary/90 transition-colors shadow-sm"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
          View on NCBI SRA
        </a>
      </div>

      {/* Download info */}
      <div className="grid md:grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Format', value: 'FASTQ (gzip compressed)', icon: '📄' },
          { label: 'Instrument', value: 'Illumina HiSeq 2500', icon: '🔬' },
          { label: 'Read Length', value: '50 bp single-end', icon: '📏' },
        ].map(item => (
          <div key={item.label} className="bg-white border border-gray-200 rounded-lg p-4 flex items-center gap-3">
            <span className="text-2xl">{item.icon}</span>
            <div>
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">{item.label}</p>
              <p className="text-sm text-text-main font-medium mt-0.5">{item.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Library table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
        <h3 className="font-semibold text-gray-700 mb-4">Sequencing Libraries</h3>
        <DataTable
          data={libraries}
          columns={columns}
          pageSize={12}
          searchable={false}
        />
      </div>
    </div>
  )
}
