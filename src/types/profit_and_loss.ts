export interface ProfitAndLoss {
  type: 'Profit_And_Loss'
  business_id: string
  start_date: string
  end_date: string
  income: LineItem
  cost_of_goods_sold?: LineItem | null
  gross_profit: number
  expenses: LineItem
  profit_before_taxes: number
  taxes: LineItem
  net_profit: number
  other_outflows?: LineItem | null
  personal_expenses?: LineItem | null
  fully_categorized: boolean
}

export interface LineItem {
  name?: String
  display_name: string
  value: number
  line_items?: LineItem[] | null
}
