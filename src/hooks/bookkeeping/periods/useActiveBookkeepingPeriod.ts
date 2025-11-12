import { useMemo } from 'react'
import { useBookkeepingPeriods } from '@hooks/bookkeeping/periods/useBookkeepingPeriods'
import { useGlobalDate } from '@providers/GlobalDateStore/GlobalDateStoreProvider'
import { BookkeepingPeriodScale } from '@schemas/bookkeepingPeriods'
import { useContext } from 'react'
import { TasksScaleContext } from '@components/Tasks/TasksScaleContext'

export function useActiveBookkeepingPeriod() {
  const { date } = useGlobalDate()
  const { data, isLoading } = useBookkeepingPeriods()
  const scaleContext = useContext(TasksScaleContext)
  const selectedScale = scaleContext?.selectedScale ?? null

  const currentMonth = date.getMonth() + 1
  const currentYear = date.getFullYear()

  const activePeriod = useMemo(() => {
    if (selectedScale === BookkeepingPeriodScale.ONGOING) {
      return data?.find(period => period.scale === BookkeepingPeriodScale.ONGOING)
    }

    if (selectedScale === BookkeepingPeriodScale.ANNUALLY) {
      return data?.find(period =>
        period.scale === BookkeepingPeriodScale.ANNUALLY && period.year === currentYear,
      )
    }

    return data?.find(period =>
      currentYear === period.year
      && currentMonth === period.month
      && (period.scale === BookkeepingPeriodScale.MONTHLY || period.scale === null || period.scale === undefined),
    )
  }, [data, currentMonth, currentYear, selectedScale])

  return { activePeriod, isLoading }
}
