import { LineItem } from './line_item'

export interface StatementOfCash {
  business_id: string
  type: 'Cashflow_Statement'
  start_date: string
  end_date: string
  financing_activities: LineItem
  investing_activities: LineItem
  operating_activities: LineItem
}
