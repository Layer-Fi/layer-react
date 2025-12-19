import { useEffect, useMemo, useRef, useState } from 'react'

import { type ReportingBasis } from '@internal-types/general'
import type { ProfitAndLossSummary } from '@hooks/useProfitAndLoss/schemas'
import { useProfitAndLossSummaries } from '@hooks/useProfitAndLoss/useProfitAndLossSummaries'
import type { ChartWindow } from '@components/ProfitAndLossChart/getChartWindow'

const MIN_LOADING_DURATION_MS = 1000

type UseProfitAndLossLTMProps = {
  tagFilter?: {
    key: string
    values: string[]
  }
  reportingBasis?: ReportingBasis
  chartWindow: ChartWindow
}

export interface ProfitAndLossSummaryData extends ProfitAndLossSummary {
  isLoading?: boolean
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
  fullyCategorized: true,
  totalExpenses: 0,
  uncategorizedInflows: 0,
  uncategorizedOutflows: 0,
  uncategorizedTransactions: 0,
  categorizedTransactions: 0,
}

const buildDatesFromChartWindow = (chartWindow: ChartWindow) => {
  return {
    startYear: chartWindow.start.getFullYear(),
    startMonth: chartWindow.start.getMonth() + 1,
    endYear: chartWindow.end.getFullYear(),
    endMonth: chartWindow.end.getMonth() + 1,
  }
}

const buildMonthsArray = (startDate: Date, endDate: Date) => {
  if (startDate >= endDate) {
    return []
  }

  const dates = []
  for (let d = new Date(startDate); d <= endDate; d.setMonth(d.getMonth() + 1)) {
    dates.push(new Date(d))
  }

  return dates
}

export const useProfitAndLossLTM = ({ tagFilter, reportingBasis, chartWindow }: UseProfitAndLossLTMProps) => {
  const { startYear, startMonth, endYear, endMonth } = buildDatesFromChartWindow(chartWindow)

  const { data, isLoading, isError } = useProfitAndLossSummaries({
    startYear,
    startMonth,
    endYear,
    endMonth,
    tagKey: tagFilter?.key,
    tagValues: tagFilter?.values?.join(','),
    reportingBasis,
    keepPreviousData: true,
  })

  const [delayedMonths, setDelayedMonths] = useState(data?.months)
  const loadingStartRef = useRef<number | null>(null)

  useEffect(() => {
    if (isLoading) {
      loadingStartRef.current = Date.now()
      return
    }

    const elapsed = loadingStartRef.current ? Date.now() - loadingStartRef.current : MIN_LOADING_DURATION_MS
    const remainingDelay = Math.max(0, MIN_LOADING_DURATION_MS - elapsed)

    const timeout = setTimeout(() => {
      setDelayedMonths(data?.months)
    }, remainingDelay)

    return () => clearTimeout(timeout)
  }, [isLoading, data?.months])

  const augmentedData = useMemo(() => {
    // 1) Build the 12-month period from the chart window
    const period = buildMonthsArray(chartWindow.start, chartWindow.end)

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
    const monthsFromApi = delayedMonths ?? []
    for (const m of monthsFromApi) {
      const key = getYearMonthKey(m.year, m.month)
      if (map.has(key)) {
        map.set(key, { ...m, isLoading: false })
      }
    }

    return Array.from(map.values())
  }, [chartWindow.end, chartWindow.start, delayedMonths])

  return { data: augmentedData, isLoading, isError }
}
