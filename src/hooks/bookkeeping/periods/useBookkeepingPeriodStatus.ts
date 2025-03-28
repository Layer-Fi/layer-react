import { useMemo } from 'react'
import { useBookkeepingPeriods } from './useBookkeepingPeriods'

export const useBookkeepingPeriodStatus = ({ currentMonthDate }: { currentMonthDate: Date }) => {
  const { data, isLoading } = useBookkeepingPeriods()

  const status = useMemo(() => {
    const currentMonth = currentMonthDate.getMonth() + 1
    const currentYear = currentMonthDate.getFullYear()

    return data?.find(
      period => period.year === currentYear && period.month === currentMonth,
    )?.status
  }, [data, currentMonthDate])

  return { status, isLoading }
}
