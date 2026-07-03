import { useMemo } from 'react'
import { getYear } from 'date-fns'

import { useMileageSummary } from '@hooks/api/businesses/[business-id]/mileage/summary/useMileageSummary'
import { useGlobalDateRange } from '@providers/DateStoreProvider/GlobalDateStoreProvider'

const EMPTY_MONTHS = Array.from({ length: 12 }, (_, i) => ({
  month: i + 1,
  miles: 0,
  estimatedDeduction: 0,
}))

export function useMileageTrackingYearlySummary() {
  const { data, isLoading, isError } = useMileageSummary()
  const { startDate } = useGlobalDateRange({ dateSelectionMode: 'year' })
  const selectedYear = getYear(startDate)

  const selectedYearData = useMemo(
    () => data?.years.find(y => y.year === selectedYear),
    [data, selectedYear],
  )

  const chartData = useMemo(() => {
    if (!selectedYearData) {
      return { years: [{ year: selectedYear, months: EMPTY_MONTHS }] }
    }
    return {
      years: [{
        year: selectedYearData.year,
        months: selectedYearData.months.map(({ month, miles, estimatedDeduction }) => ({
          month,
          miles,
          estimatedDeduction,
        })),
      }],
    }
  }, [selectedYearData, selectedYear])

  return { data, selectedYear, selectedYearData, chartData, isLoading, isError }
}
