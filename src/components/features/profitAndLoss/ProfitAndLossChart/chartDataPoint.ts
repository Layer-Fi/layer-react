export interface ChartDataPoint {
  name: string
  year: number
  month: number

  netProfit: number

  revenue: number
  revenueUncategorized: number
  expenses: number
  expensesUncategorized: number

  revenueBar: number
  revenueBarInverse: number
  revenueUncategorizedBar: number
  revenueUncategorizedBarInverse: number

  expensesBar: number
  expensesBarInverse: number
  expensesUncategorizedBar: number
  expensesUncategorizedBarInverse: number

  loadingBar: number
  loadingBarInverse: number
}
