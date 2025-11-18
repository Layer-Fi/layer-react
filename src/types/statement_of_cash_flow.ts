import { type LineItem } from '@internal-types/line_item'

export interface StatementOfCashFlow {
  business_id: string
  type: 'Cashflow_Statement'
  start_date: string
  end_date: string
  financing_activities: LineItem
  investing_activities: LineItem
  operating_activities: LineItem
  period_net_cash_increase: number
  cash_at_end_of_period: number
}
