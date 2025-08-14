import { useCallback, useMemo, useState } from 'react'
import { ReportingBasis } from '../../types'
import { startOfMonth, sub } from 'date-fns'
import type { ProfitAndLossSummary } from './schemas'
import { useProfitAndLossSummaries } from './useProfitAndLossSummaries'

type UseProfitAndLossLTMProps = {
  currentDate: Date
  tagFilter?: {
    key: string
    values: string[]
  }
  reportingBasis?: ReportingBasis
}

export interface ProfitAndLossSummaryData extends ProfitAndLossSummary {
  isLoading?: boolean
}

type UseProfitAndLossLTMReturn = (props?: UseProfitAndLossLTMProps) => {
  data: ProfitAndLossSummaryData[]
  isLoading: boolean
  isError: boolean
  setDate: (date: Date) => void
  refetch: () => void
}

const getYearMonthKey = (y: number, m: number) => {
  return `${y}-${m.toString().padStart(2, '0')}`
}

const BASE_PNL_SUMMARY: Omit<ProfitAndLossSummary, 'year' | 'month'> = {
  income: 0,
  costOfGoodsSold: 0,
  grossProfit: 0,
  operatingExpenses: 0,
  profitBeforeTaxes: 0,
  taxes: 0,
  netProfit: 0,
  fullyCategorized: false,
  totalExpenses: 0,
  uncategorizedInflows: 0,
  uncategorizedOutflows: 0,
  uncategorizedTransactions: 0,
  categorizedTransactions: 0,
}

const buildDates = ({ currentDate }: { currentDate: Date }) => {
  return {
    startYear: startOfMonth(currentDate).getFullYear() - 1,
    startMonth: startOfMonth(currentDate).getMonth() + 1,
    endYear: startOfMonth(currentDate).getFullYear(),
    endMonth: startOfMonth(currentDate).getMonth() + 1,
  }
}

const buildMonthsArray = (startDate: Date, endDate: Date) => {
  if (startDate >= endDate) {
    return []
  }

  const dates = []
  for (let d = startDate; d <= endDate; d.setMonth(d.getMonth() + 1)) {
    dates.push(new Date(d))
  }

  return dates
}

/**
 * Hooks fetch Last Twelve Months sending 12 requests (one for each month).
 * Implementation is not perfect, but we cannot use loops and arrays with hooks.
 */
export const useProfitAndLossLTM: UseProfitAndLossLTMReturn = (
  { currentDate, tagFilter, reportingBasis }: UseProfitAndLossLTMProps = {
    currentDate: startOfMonth(Date.now()),
  },
) => {
  const [date, setDate] = useState(currentDate)

  const { startYear, startMonth, endYear, endMonth } = useMemo(() => {
    return buildDates({ currentDate: date })
  }, [date])

  const { data, isLoading, isError, mutate } = useProfitAndLossSummaries({
    startYear,
    startMonth,
    endYear,
    endMonth,
    tagKey: tagFilter?.key,
    tagValues: tagFilter?.values?.join(','),
    reportingBasis,
  })

  const augmentedData = useMemo(() => {
    // 1) Build the 12-month period ending at `date`
    const period = buildMonthsArray(sub(date, { years: 1 }), date)

    // 2) Create placeholders for each period month
    const map = new Map<string, ProfitAndLossSummaryData>()

    for (const d of period) {
      const y = d.getFullYear()
      const m = d.getMonth() + 1
      map.set(getYearMonthKey(y, m), {
        year: y,
        month: m,
        isLoading: true,
        ...BASE_PNL_SUMMARY,
      })
    }

    // 3) Overlay API data (replacing placeholders; mark as loaded)
    const monthsFromApi = data?.months ?? []
    for (const m of monthsFromApi) {
      const key = getYearMonthKey(m.year, m.month)
      map.set(key, { ...m, isLoading: false })
    }

    // 4) Sorted array
    const sorted = Array.from(map.values()).sort(
      (a, b) =>
        new Date(a.year, a.month - 1, 1).getTime()
          - new Date(b.year, b.month - 1, 1).getTime(),
    )

    return sorted
  }, [date, data?.months])

  const updateDate = useCallback((date: Date) => setDate(date), [setDate])

  const refetch = useCallback(() => {
    void mutate()
  }, [mutate])

  return {
    data: augmentedData,
    isLoading,
    isError,
    setDate: updateDate,
    refetch,
  }
}
