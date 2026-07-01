import { useContext, useMemo } from 'react'
import { sub } from 'date-fns'

import type { LineItem } from '@schemas/common/lineItem'
import type { ProfitAndLoss } from '@schemas/reports/profitAndLoss'
import { DateFormat } from '@utils/i18n/date/patterns'
import { calculatePercentageChange } from '@utils/percentageChange'
import { toMiniChartData } from '@utils/profitAndLossUtils'
import { useProfitAndLossSummaries } from '@hooks/api/businesses/[business-id]/reports/profit-and-loss-summaries/useProfitAndLossSummaries'
import { useIntlFormatter } from '@hooks/utils/i18n/useIntlFormatter'
import { useGlobalDateRange } from '@providers/DateStore/GlobalDateStoreProvider'
import { ProfitAndLossContext } from '@contexts/ProfitAndLossContext/ProfitAndLossContext'

const emptyLineItem = (name: string): LineItem => ({
  name,
  displayName: name,
  value: 0,
  isContra: false,
  lineItems: [],
})

const EMPTY_PROFIT_AND_LOSS: ProfitAndLoss = {
  businessId: '',
  startDate: new Date(0),
  endDate: new Date(0),
  fullyCategorized: false,
  grossProfit: 0,
  grossProfitPercentDelta: undefined,
  profitBeforeTaxes: 0,
  profitBeforeTaxesPercentDelta: undefined,
  netProfit: 0,
  netProfitPercentDelta: undefined,
  income: emptyLineItem('income'),
  costOfGoodsSold: emptyLineItem('cost_of_goods_sold'),
  expenses: emptyLineItem('expenses'),
  taxes: emptyLineItem('taxes'),
  customLineItems: null,
  otherOutflows: null,
  uncategorizedOutflows: undefined,
  uncategorizedInflows: undefined,
  personalExpenses: null,
}

export type ProfitAndLossSummariesMode = 'profitAndLoss' | 'cashflow'

type SummaryMetricInputs = {
  income: number
  totalExpenses: number
  net: number
  uncategorizedInflows: number
  uncategorizedOutflows: number
}

function toSummaryMetrics(
  { income, totalExpenses, net, uncategorizedInflows, uncategorizedOutflows }: SummaryMetricInputs,
  mode: ProfitAndLossSummariesMode,
) {
  if (mode === 'cashflow') {
    return {
      revenue: income + uncategorizedInflows,
      expenses: totalExpenses + uncategorizedOutflows,
      net: net + uncategorizedInflows - uncategorizedOutflows,
    }
  }

  return { revenue: income, expenses: totalExpenses, net }
}

export function useProfitAndLossSummariesMiniChartData({
  mode,
}: { mode: ProfitAndLossSummariesMode }) {
  const { formatDate } = useIntlFormatter()
  const { data, isLoading } = useContext(ProfitAndLossContext)

  const { startDate } = useGlobalDateRange({ dateSelectionMode: 'month' })

  const previousMonthStart = sub(startDate, { months: 1 })
  const { data: previousData, isLoading: isPreviousLoading } = useProfitAndLossSummaries({
    startYear: previousMonthStart.getFullYear(),
    startMonth: previousMonthStart.getMonth() + 1,
    endYear: previousMonthStart.getFullYear(),
    endMonth: previousMonthStart.getMonth() + 1,
  })

  const isComparisonLoading = isLoading || isPreviousLoading

  const { revenueChartData, expensesChartData } = useMemo(
    () => ({
      revenueChartData: toMiniChartData({ scope: 'revenue', data, mode }),
      expensesChartData: toMiniChartData({ scope: 'expenses', data, mode }),
    }),
    [data, mode],
  )

  const effectiveData = useMemo(() => data ?? EMPTY_PROFIT_AND_LOSS, [data])

  const breakdown = useMemo(() => {
    const categorizedRevenue = effectiveData.income.value
    const uncategorizedRevenue = effectiveData.uncategorizedInflows?.value ?? 0
    const categorizedExpenses = effectiveData.income.value - effectiveData.netProfit
    const uncategorizedExpenses = effectiveData.uncategorizedOutflows?.value ?? 0

    return {
      revenue: { categorized: categorizedRevenue, uncategorized: uncategorizedRevenue },
      expenses: { categorized: categorizedExpenses, uncategorized: uncategorizedExpenses },
      net: {
        categorized: effectiveData.netProfit,
        uncategorized: uncategorizedRevenue - uncategorizedExpenses,
      },
    }
  }, [effectiveData])

  const { revenueAmount, expensesAmount, netAmount } = useMemo(() => {
    const { revenue, expenses, net } = toSummaryMetrics({
      income: effectiveData.income.value,
      totalExpenses: effectiveData.income.value - effectiveData.netProfit,
      net: effectiveData.netProfit,
      uncategorizedInflows: effectiveData.uncategorizedInflows?.value ?? 0,
      uncategorizedOutflows: effectiveData.uncategorizedOutflows?.value ?? 0,
    }, mode)

    return { revenueAmount: revenue, expensesAmount: expenses, netAmount: net }
  }, [effectiveData, mode])

  const comparisonData = useMemo(() => {
    const previousMonthData = previousData?.months?.[0]

    if (!previousMonthData) return null

    const previous = toSummaryMetrics({
      income: previousMonthData.income,
      totalExpenses: previousMonthData.totalExpenses,
      net: previousMonthData.netProfit,
      uncategorizedInflows: previousMonthData.uncategorizedInflows,
      uncategorizedOutflows: previousMonthData.uncategorizedOutflows,
    }, mode)

    return {
      revenuePercentChange: calculatePercentageChange(revenueAmount, previous.revenue),
      expensesPercentChange: calculatePercentageChange(expensesAmount, previous.expenses),
      netProfitPercentChange: calculatePercentageChange(netAmount, previous.net),
      comparisonMonth: formatDate(previousMonthStart, DateFormat.MonthShort),
    }
  }, [revenueAmount, expensesAmount, netAmount, formatDate, previousData, previousMonthStart, mode])

  const {
    revenuePercentChange = null,
    expensesPercentChange = null,
    netProfitPercentChange = null,
    comparisonMonth = null,
  } = comparisonData ?? {}

  return useMemo(() => ({
    isLoading,
    isComparisonLoading,
    comparisonMonth,

    revenue: {
      amount: revenueAmount,
      percentChange: revenuePercentChange,
      chartData: revenueChartData,
      breakdown: breakdown.revenue,
    },
    expenses: {
      amount: expensesAmount,
      percentChange: expensesPercentChange,
      chartData: expensesChartData,
      breakdown: breakdown.expenses,
    },
    net: {
      amount: netAmount,
      percentChange: netProfitPercentChange,
      breakdown: breakdown.net,
    },
  }), [
    isLoading,
    isComparisonLoading,
    comparisonMonth,
    revenueAmount,
    expensesAmount,
    netAmount,
    breakdown,
    revenueChartData,
    expensesChartData,
    revenuePercentChange,
    expensesPercentChange,
    netProfitPercentChange,
  ])
}
