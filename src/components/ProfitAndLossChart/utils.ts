import {
  format,
} from 'date-fns'

import { MONTH_FORMAT_ABBREVIATED, MONTH_FORMAT_NARROW } from '@config/general'
import { type ProfitAndLossSummaryData } from '@hooks/useProfitAndLoss/useProfitAndLossLTM'

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

const BASE_LOADING_DEFAULT = 90000

const getBaseLoadingValues = (data?: ProfitAndLossSummaryData[]) => {
  if (!data) return { maxRevenue: BASE_LOADING_DEFAULT, maxExpenses: BASE_LOADING_DEFAULT }

  let maxRevenue = 0
  let maxExpenses = 0

  data.forEach((x) => {
    const revenue = Math.abs(x.income) + Math.abs(x.uncategorizedInflows)
    const expenses = Math.abs(x.totalExpenses) + Math.abs(x.uncategorizedOutflows)
    if (revenue > maxRevenue) maxRevenue = revenue
    if (expenses > maxExpenses) maxExpenses = expenses
  })

  return {
    maxRevenue: maxRevenue === 0 ? BASE_LOADING_DEFAULT : maxRevenue * 0.75,
    maxExpenses: maxExpenses === 0 ? BASE_LOADING_DEFAULT : maxExpenses * 0.75,
  }
}

export const getLoadingValues = (index: number, data?: ProfitAndLossSummaryData[]) => {
  const { maxRevenue, maxExpenses } = getBaseLoadingValues(data)
  const wave = Math.pow(-1, index + 1)
  const loadingRevenue = maxRevenue + (maxRevenue * 0.05 * wave * (((index + 1) % 12) + 1))
  const loadingExpenses = maxExpenses + (maxExpenses * 0.05 * wave * (((index + 1) % 2) + 1))

  return {
    loadingBar: loadingRevenue > 0 ? loadingRevenue : 0,
    loadingBarInverse: loadingRevenue < 0 ? loadingRevenue : -loadingExpenses,
  }
}

export const summarizePnL = ({
  pnl,
  index,
  compactView,
  data,
}: {
  pnl: ProfitAndLossSummaryData
  index: number
  compactView: boolean
  data?: ProfitAndLossSummaryData[]
}): ChartDataPoint => {
  const name = format(
    new Date(pnl.year, pnl.month - 1, 1),
    compactView ? MONTH_FORMAT_NARROW : MONTH_FORMAT_ABBREVIATED,
  )

  const { loadingBar, loadingBarInverse } = pnl.isLoading
    ? getLoadingValues(index, data)
    : { loadingBar: 0, loadingBarInverse: 0 }

  return {
    name,
    year: pnl.year,
    month: pnl.month,

    netProfit: pnl.netProfit,

    revenue: pnl.income,
    revenueUncategorized: pnl.uncategorizedInflows,
    expenses: pnl.totalExpenses,
    expensesUncategorized: pnl.uncategorizedOutflows,

    revenueBar: pnl.income > 0 ? pnl.income : 0,
    revenueBarInverse: pnl.income < 0 ? pnl.income : 0,
    revenueUncategorizedBar: pnl.uncategorizedInflows > 0 ? pnl.uncategorizedInflows : 0,
    revenueUncategorizedBarInverse: pnl.uncategorizedInflows < 0 ? pnl.uncategorizedInflows : 0,

    expensesBar: pnl.totalExpenses > 0 ? -pnl.totalExpenses : 0,
    expensesBarInverse: pnl.totalExpenses < 0 ? -pnl.totalExpenses : 0,
    expensesUncategorizedBar: pnl.uncategorizedOutflows > 0 ? -pnl.uncategorizedOutflows : 0,
    expensesUncategorizedBarInverse: pnl.uncategorizedOutflows < 0 ? -pnl.uncategorizedOutflows : 0,

    loadingBar,
    loadingBarInverse,
  }
}

export const transformPnLData = ({
  data,
  compactView,
}: {
  data: ProfitAndLossSummaryData[]
  compactView: boolean
}): ChartDataPoint[] => {
  return data.map((pnl, index) => summarizePnL({ pnl, index, compactView, data }))
}
