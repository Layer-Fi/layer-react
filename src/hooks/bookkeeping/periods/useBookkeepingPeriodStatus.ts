import { useMemo } from 'react'
import { useBookkeepingPeriods } from './useBookkeepingPeriods'

export const useBookkeepingPeriodStatus = ({ currentMonthDate }: { currentMonthDate: Date }) => {
  const { data, isLoading } = useBookkeepingPeriods()

  const currentMonth = currentMonthDate.getMonth() + 1
  const currentYear = currentMonthDate.getFullYear()

  const currentMonthData = useMemo(() =>
    data?.find(
      period => period.year === currentYear && period.month === currentMonth,
    ), [data, currentMonth, currentYear])

  return { data: currentMonthData, status: currentMonthData?.status, isLoading }
}
