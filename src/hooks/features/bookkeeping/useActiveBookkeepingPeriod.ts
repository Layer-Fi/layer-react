import { useMemo } from 'react'

import { useBookkeepingPeriods } from '@api/businesses/[business-id]/bookkeeping/periods/get'
import { useGlobalDate } from '@providers/DateStoreProvider/GlobalDateStoreProvider'

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
