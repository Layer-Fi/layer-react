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
