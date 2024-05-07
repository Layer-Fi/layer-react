export type SortDirection = 'asc' | 'desc'

export interface BaseSelectOption {
  label: string
  value: string | number
}

export type LoadedStatus = 'initial' | 'loading' | 'complete'
