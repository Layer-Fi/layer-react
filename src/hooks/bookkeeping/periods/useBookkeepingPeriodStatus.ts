import { useMemo } from 'react'
import { useBookkeepingPeriods } from './useBookkeepingPeriods'

export const useBookkeepingPeriodStatus = ({ currentMonthDate }: { currentMonthDate: Date }) => {
  const { data, isLoading } = useBookkeepingPeriods()

  const currentMonthData = useMemo(() => {
    const currentMonth = currentMonthDate.getMonth() + 1
    const currentYear = currentMonthDate.getFullYear()

    return data?.find(
      period => period.year === currentYear && period.month === currentMonth,
    )
  }, [data, currentMonthDate])

  const status = currentMonthData?.status

  return { data: currentMonthData, status, isLoading }
}
