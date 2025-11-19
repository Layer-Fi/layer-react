import { useMemo } from 'react'

import { useBookkeepingPeriods } from '@hooks/bookkeeping/periods/useBookkeepingPeriods'
import { useGlobalDate } from '@providers/GlobalDateStore/GlobalDateStoreProvider'

export function useActiveBookkeepingPeriod() {
  const { date } = useGlobalDate()
  const { data, isLoading } = useBookkeepingPeriods()

  const currentMonth = date.getMonth() + 1
  const currentYear = date.getFullYear()

  const activePeriod = useMemo(
    () => data?.find(period => currentYear === period.year && currentMonth === period.month),
    [data, currentMonth, currentYear],
  )

  return { activePeriod, isLoading }
}
