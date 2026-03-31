import type { FilterState, Tissue, Timepoint, SncRNAType } from '../types'

const TISSUES: Tissue[] = ['Hypothalamus', 'Pituitary', 'Ovary']
const TIMEPOINTS: Timepoint[] = ['16w', '35w']
const SUBCLASSES: SncRNAType[] = ['miRNA', 'piRNA', 'tsRNA', 'rsRNA']

export function parseFiltersFromURL(searchParams: URLSearchParams): FilterState {
  const tissue = searchParams.get('tissue') as Tissue | null
  const timepoint = searchParams.get('timepoint') as Timepoint | null
  const subclass = searchParams.get('subclass') as SncRNAType | null

  return {
    tissue: tissue && TISSUES.includes(tissue) ? tissue : 'All',
    timepoint: timepoint && TIMEPOINTS.includes(timepoint) ? timepoint : 'All',
    subclass: subclass && SUBCLASSES.includes(subclass) ? subclass : 'All',
  }
}

export function filtersToSearchParams(filters: FilterState): URLSearchParams {
  const params = new URLSearchParams()
  if (filters.tissue !== 'All') params.set('tissue', filters.tissue)
  if (filters.timepoint !== 'All') params.set('timepoint', filters.timepoint)
  if (filters.subclass !== 'All') params.set('subclass', filters.subclass)
  return params
}
