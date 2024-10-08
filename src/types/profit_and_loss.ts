import { LineItem } from './line_item'

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

export interface ProfitAndLossComparison {
  type: string
  pnls: ProfitAndLossComparisonItem[]
}

export interface ProfitAndLossComparisonPnl {
  business_id: string
  start_date: string
  end_date: string
  income: LineItem
  cost_of_goods_sold: LineItem
  gross_profit: number
  expenses: LineItem
  profit_before_taxes: number
  taxes: LineItem
  net_profit: number
  other_outflows?: LineItem | null
  personal_expenses?: LineItem | null
  fully_categorized: boolean
}

export interface ProfitAndLossComparisonItem {
  period: {
    type: string
    year?: number
    month?: number
    start_date?: string
    end_date?: string
  }
  tag_filter?: {
    key: string
    values: string[]
  }
  pnl: ProfitAndLossComparisonPnl
}

export interface ProfitAndLossSummary {
  year: number
  month: number
  income: number
  costOfGoodsSold: number
  grossProfit: number
  operatingExpenses: number
  profitBeforeTaxes: number
  taxes: number
  netProfit: number
  fullyCategorized: boolean
  totalExpenses: number
  uncategorizedInflows: number
  uncategorizedOutflows: number
  totalExpensesInverse?: number
  uncategorizedOutflowsInverse?: number
  uncategorized_transactions: number
}

export interface ProfitAndLossSummaries {
  type: 'Profit_And_Loss_Summaries'
  months: ProfitAndLossSummary[]
}
