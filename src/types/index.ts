// ── Overview / Homepage
export interface ReadPct {
  miRNA: number
  piRNA: number
  tsRNA: number
  rsRNA: number
}

export interface TimepointData {
  miRNA: number
  piRNA: number
  tsRNA: number
  rsRNA: number
  readPct: ReadPct
}

export interface TissueCalloutData {
  '16w': TimepointData
  '35w': TimepointData
}

export interface OverviewData {
  totalSncRNAs: number
  tissues: number
  timepoints: number
  libraries: number
  hpoCallouts: {
    Hypothalamus: TissueCalloutData
    Pituitary: TissueCalloutData
    Ovary: TissueCalloutData
  }
}

// ── sncRNA Categories
export type SncRNAType = 'miRNA' | 'piRNA' | 'tsRNA' | 'rsRNA'
export type Tissue = 'Hypothalamus' | 'Pituitary' | 'Ovary'
export type Timepoint = '16w' | '35w'

export interface SncRNACategory {
  id: string
  type: SncRNAType
  tissue: Tissue
  timepoint: Timepoint
  expression: number
  sequence: string
}

// ── Top 50
export interface Top50Entry {
  rank: number
  id: string
  type: SncRNAType
  tissue: Tissue
  timepoint: Timepoint
  readCount: number
  percentReads: number
  seedSequence: string
  sequence: string
}

// ── Differential Expression
export type RegulationType = 'Up' | 'Down' | 'NS'

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
export type InteractionType = 'promoter' | 'RNA_body'

export interface TargetEntry {
  id: string
  sncRNAId: string
  sncRNAType: SncRNAType
  interactionType: InteractionType
  targetGene: string
  geneDescription: string
  score: number
  targetSequence: string
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
