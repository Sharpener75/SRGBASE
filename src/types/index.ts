// ── Overview / Homepage
export interface TimepointData {
  miRNA: number
  piRNA: number
  tsRNA: number
  rsRNA: number
}

export interface OverviewData {
  totalSncRNAs: number
  tissues: number
  timepoints: number
  libraries: number
  hpoCallouts: {
    Hypothalamus: { '16w': TimepointData; '35w': TimepointData }
    Pituitary:    { '16w': TimepointData; '35w': TimepointData }
    Ovary:        { '16w': TimepointData; '35w': TimepointData }
  }
  readDistribution: { miRNA: number; piRNA: number; tsRNA: number; rsRNA: number }
}

// ── Shared union types
export type SncRNAType = 'miRNA' | 'piRNA' | 'tsRNA' | 'rsRNA'
export type Tissue = 'Hypothalamus' | 'Pituitary' | 'Ovary'
export type Timepoint = '16w' | '35w'

// ── sncRNA Categories
export interface CategoryCount {
  tissue: Tissue
  timepoint: Timepoint
  type: SncRNAType
  count: number
}

export interface LengthSeries {
  lengths: number[]
  series: { sample: string; values: number[] }[]
}

export interface LengthDistribution {
  miRNA: LengthSeries
  piRNA: LengthSeries
  tsRNA: LengthSeries
  rsRNA: LengthSeries
}

// ── Top 50
export interface Top50Entry {
  rank: number
  id: string
  type: SncRNAType
  tissue: Tissue
  timepoint: Timepoint
  tpm: number
  percentTPM: number
  seedSequence: string
}

export type Top50PieData = Record<SncRNAType, { name: string; value: number }[]>

// ── Differential Expression
export type RegulationType = 'Up' | 'Down' | 'NS'

export interface DEVolcanoRecord {
  id: string
  type: SncRNAType
  tissue: Tissue
  log2FC: number
  padj: number
  regulation: RegulationType
}

export interface DERecord {
  id: string
  type: SncRNAType
  tissue: Tissue
  comparison: string
  log2FC: number
  pvalue: number
  padj: number
  regulation: RegulationType
}

// ── Target Gene Prediction
export type BindingSite = 'promoter' | 'body'
export type TargetExpression = 'Upregulated' | 'Downregulated'

export interface TargetEntry {
  id: string
  sncRNAId: string
  sncRNAType: SncRNAType
  bindingSite: BindingSite
  bindingSiteLabel: string
  targetGene: string
  geneDescription: string
  mfe: number
  targetExpression: TargetExpression
  tissue: Tissue
}

// ── Raw Data
export interface RawDataLibrary {
  id: string
  libraryId: string
  tissue: Tissue
  timepoint: Timepoint
  replicate: number
  totalReads_M: number
  mappedReads_M: number
  mappingRate_pct: number
  sraAccession: string
}

// ── Filter State
export interface FilterState {
  tissue: Tissue | 'All'
  timepoint: Timepoint | 'All'
  subclass: SncRNAType | 'All'
}

// ── DataTable column definition
export interface ColumnDef<T> {
  key: keyof T
  header: string
  sortable?: boolean
  render?: (value: T[keyof T], row: T) => React.ReactNode
  width?: string
}
