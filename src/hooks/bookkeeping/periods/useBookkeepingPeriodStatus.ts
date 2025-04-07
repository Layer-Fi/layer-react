import { useMemo } from 'react'
import { useBookkeepingPeriods } from './useBookkeepingPeriods'

export const useBookkeepingPeriodStatus = ({ currentMonthDate }: { currentMonthDate: Date }) => {
  const { data, isLoading } = useBookkeepingPeriods()

  const currentMonthDateStr = currentMonthDate.toDateString()

  const currentMonthData = useMemo(() => {
    const currentMonth = currentMonthDate.getMonth() + 1
    const currentYear = currentMonthDate.getFullYear()

    return data?.find(
      period => period.year === currentYear && period.month === currentMonth,
    )
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, currentMonthDate, currentMonthDateStr])

  const status = currentMonthData?.status

  return { data: currentMonthData, status, isLoading }
}
