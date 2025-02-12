export type TransactionTag = {
  id: string
  key: string
  value: string
  created_at: string
  updated_at: string
  deleted_at?: string
}

export type TagFilterInput =
  | {
    tagKey: string
    tagValues: string[]
  }
  | 'None'

export type TagViewConfig = {
  structure?: string
  tagFilters: TagFilterInput
}
