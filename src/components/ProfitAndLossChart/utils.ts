import {
  add,
  differenceInMonths,
  endOfMonth,
  format,
  startOfMonth,
  sub,
} from 'date-fns'
import { ProfitAndLossSummaryData } from '../../hooks/useProfitAndLoss/useProfitAndLossLTM'
import { LoadedStatus } from '../../types/general'
import { ViewSize } from './ProfitAndLossChart'

// Find start and end date for the chart
export const getChartWindow = ({
  chartWindow,
  currentYear,
  currentMonth,
}: {
  chartWindow: { start: Date; end: Date }
  currentYear: number
  currentMonth: number
}) => {
  const today = startOfMonth(Date.now())
  const yearAgo = sub(today, { months: 11 })
  const current = startOfMonth(new Date(currentYear, currentMonth - 1, 1))
  
  if (
    differenceInMonths(startOfMonth(chartWindow.start), current) < 0
      && differenceInMonths(startOfMonth(chartWindow.end), current) > 1
  ) {
    return chartWindow
  }
  
  if (differenceInMonths(startOfMonth(chartWindow.start), current) === 0) {
    return {
      start: startOfMonth(sub(current, { months: 1 })),
      end: endOfMonth(add(current, { months: 11 })),
    }
  }
  
  if (
    differenceInMonths(endOfMonth(chartWindow.end), endOfMonth(current))
        === 1
      && differenceInMonths(today, current) >= 1
  ) {
    return {
      start: startOfMonth(sub(current, { months: 10 })),
      end: endOfMonth(add(current, { months: 2 })),
    }
  }
  
  if (
    differenceInMonths(current, startOfMonth(chartWindow.end)) === 0
      && differenceInMonths(current, startOfMonth(today)) > 0
  ) {
    return {
      start: startOfMonth(sub(current, { months: 11 })),
      end: endOfMonth(add(current, { months: 1 })),
    }
  }
  
  if (current >= yearAgo) {
    return {
      start: startOfMonth(yearAgo),
      end: endOfMonth(today),
    }
  }
  
  if (Number(current) > Number(chartWindow.end)) {
    return {
      start: startOfMonth(sub(current, { months: 12 })),
      end: endOfMonth(current),
    }
  }
  
  if (differenceInMonths(current, startOfMonth(chartWindow.start)) < 0) {
    return {
      start: startOfMonth(current),
      end: endOfMonth(add(current, { months: 11 })),
    }
  }
  
  return chartWindow
}

// Find a value for a loading bar so it has relatively same height as other
// bars (when data loaded), or just use 10,000 if no data.
export const getLoadingValue = (data?: ProfitAndLossSummaryData[]) => {
  if (!data) {
    return 10000
  }
  
  let max = 0
  
  data.forEach(x => {
    const current = Math.max(
      Math.abs(x.income),
      Math.abs(Math.abs((x?.income || 0) - (x?.netProfit || 0))),
    )
    if (current > max) {
      max = current
    }
  })
  
  return max === 0 ? 10000 : max * 0.6
}

// Get full or shorten month name based on the view size
export const getMonthName = (pnl: ProfitAndLossSummaryData | undefined, viewSize: ViewSize) =>
  pnl
    ? format(
      new Date(pnl.year, pnl.month - 1, 1),
      viewSize !== 'lg' ? 'LLLLL' : 'LLL',
    )
    : ''

// Parse ProfitAndLossSummaryData into format used by the chart
export const summarizePnL = (
  pnl: ProfitAndLossSummaryData | undefined,
  loadingValue: number,
  selectionMonth: { month: number; year: number },
  viewSize: ViewSize,
) => ({
  name: getMonthName(pnl, viewSize),
  revenue: pnl?.income || 0,
  revenueUncategorized: pnl?.uncategorizedInflows || 0,
  expenses: -(pnl?.totalExpenses || 0),
  expensesUncategorized: -(pnl?.uncategorizedOutflows || 0),
  totalExpensesInverse: pnl?.totalExpensesInverse || 0,
  uncategorizedOutflowsInverse: pnl?.uncategorizedOutflowsInverse || 0,
  netProfit: pnl?.netProfit || 0,
  selected:
      !!pnl
      && pnl.month === selectionMonth.month + 1
      && pnl.year === selectionMonth.year,
  year: pnl?.year,
  month: pnl?.month,
  base: 0,
  loading: pnl?.isLoading ? loadingValue : 0,
  loadingExpenses: pnl?.isLoading ? -loadingValue : 0,
})

// Format Y-axis labels using denominators like billions, millions, thousands
export const formatYAxisValue = (value?: string | number) => {
  if (!value) {
    return value
  }

  try {
    let suffix = ''
    const base = Number(value) / 100
    let val = base

    if (Math.abs(base) >= 1000000000) {
      suffix = 'B'
      val = base / 1000000000
    } else if (Math.abs(base) >= 1000000) {
      suffix = 'M'
      val = base / 1000000
    } else if (Math.abs(base) >= 1000) {
      suffix = 'k'
      val = base / 1000
    }
    return `${val}${suffix}`
  } catch (_err) {
    return value
  }
}

// Check if there is any non-zero value in the data
export const hasAnyData = (data: ProfitAndLossSummaryData[]) => (
  Boolean(
    data?.find(
      x =>
        x.income !== 0
        || x.costOfGoodsSold !== 0
        || x.grossProfit !== 0
        || x.operatingExpenses !== 0
        || x.profitBeforeTaxes !== 0
        || x.taxes !== 0
        || x.totalExpenses !== 0,
    ),
  )
)

// Parse and filter raw data for the chart.
// If data has not be loaded yet, then it returns data for "loading" bars
export const collectData = ({
  data,
  loaded,
  loadingValue,
  anyData,
  chartWindow,
  viewSize,
  selectionMonth,
}: {
  data: ProfitAndLossSummaryData[]
  loaded?: LoadedStatus
  anyData: boolean
  chartWindow: {
    start: Date;
    end: Date;
  }
  viewSize: ViewSize
  loadingValue: number
  selectionMonth: {
    year: number;
    month: number;
  }
}) => {
  if (loaded !== 'complete' || (loaded === 'complete' && !anyData)) {
    const loadingData = []
    const today = Date.now()
    for (let i = 11; i >= 0; i--) {
      const currentDate = sub(today, { months: i })
      loadingData.push({
        name: format(currentDate, viewSize !== 'lg' ? 'LLLLL' : 'LLL'),
        revenue: 0,
        revenueUncategorized: 0,
        totalExpensesInverse: 0,
        uncategorizedOutflowsInverse: 0,
        expenses: 0,
        expensesUncategorized: 0,
        netProfit: 0,
        selected: false,
        year: currentDate.getFullYear(),
        month: currentDate.getMonth() + 1,
        loading: 1000 * Math.pow(-1, i + 1) * (((i + 1) % 12) + 1) + 90000,
        loadingExpenses:
            -1000 * Math.pow(-1, i + 1) * (((i + 1) % 2) + 1) - 90000,
        base: 0,
      })
    }
    return loadingData
  }

  return data
    ?.map(x => {
      const totalExpenses = x.totalExpenses || 0
      if (totalExpenses < 0 || x.uncategorizedOutflows < 0) {
        return {
          ...x,
          totalExpenses: totalExpenses < 0 ? 0 : totalExpenses,
          uncategorizedOutflows:
              x.uncategorizedOutflows < 0 ? 0 : x.uncategorizedOutflows,
          totalExpensesInverse: totalExpenses < 0 ? -totalExpenses : 0,
          uncategorizedOutflowsInverse:
              x.uncategorizedOutflows < 0 ? -x.uncategorizedOutflows : 0,
        }
      }

      return x
    })
    ?.filter(
      x =>
        differenceInMonths(
          startOfMonth(new Date(x.year, x.month - 1, 1)),
          chartWindow.start,
        ) >= 0
          && differenceInMonths(
            startOfMonth(new Date(x.year, x.month - 1, 1)),
            chartWindow.start,
          ) < 12
          && differenceInMonths(
            chartWindow.end,
            startOfMonth(new Date(x.year, x.month - 1, 1)),
          ) >= 0
          && differenceInMonths(
            chartWindow.end,
            startOfMonth(new Date(x.year, x.month - 1, 1)),
          ) <= 12,
    )
    .map(x => summarizePnL(x, loadingValue, selectionMonth, viewSize))
}

// Returns [barSize, margin] for chart based on number of bars and view mode
export const getBarSizing = (itemsLength: number, view: ViewSize) => {
  const divider = view === 'xs' ? 2 : view === 'md' ? 1.5 : 1
  let base = Math.round(240 / divider)

  if (itemsLength >= 12) {
    base = 20
  } else if (itemsLength >= 8) {
    base = 40
  } else if (itemsLength >= 6) {
    base = 60
  } else if (itemsLength >= 4) {
    base = 80
  }

  const margin = Math.max(Math.min(Math.round(base * 0.25 / divider), 24), 2)

  // [barSize, margin]
  return [base / divider, margin]
}
