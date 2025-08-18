export interface LineItem {
  name?: string
  display_name: string
  value: number | undefined
  line_items?: LineItem[] | null
  is_contra?: boolean
}
