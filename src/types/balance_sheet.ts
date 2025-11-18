import { type LineItem } from '@internal-types/line_item'

export interface BalanceSheet {
  business_id: string
  type: 'Balance_Sheet'
  effective_date: string
  start_date: string
  end_date: string
  assets: LineItem
  liabilities_and_equity: LineItem
  fully_categorized: boolean
}
