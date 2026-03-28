import { useMemo } from 'react'
import { getMonth } from 'date-fns'

import { BookkeepingPeriodStatus, useBookkeepingPeriods } from '@hooks/api/businesses/[business-id]/bookkeeping/periods/useBookkeepingPeriods'
import { useBookkeepingYearsStatus } from '@hooks/features/bookkeeping/useBookkeepingYearsStatus'
import { useGlobalDate, useGlobalDatePeriodAlignedActions } from '@providers/GlobalDateStore/GlobalDateStoreProvider'
import { Tabs } from '@components/Tabs/Tabs'
import { TaskStatusBadge } from '@components/Tasks/TaskStatusBadge'

export const TasksYearsTabs = () => {
  const { date } = useGlobalDate()
  const { setMonthByPeriod } = useGlobalDatePeriodAlignedActions()

  const activeYear = date.getFullYear()

  const { yearStatuses } = useBookkeepingYearsStatus()
  const { data: bookkeepingPeriods } = useBookkeepingPeriods()

  const setCurrentYear = (year: string) => {
    const targetYear = Number(year)
    const currentMonth = getMonth(date) + 1

    const periodsInTargetYear = bookkeepingPeriods
      ?.filter(period => period.year === targetYear)
      .map(period => period.month)
      .sort((a, b) => a - b) ?? []

    const isCurrentMonthAvailable = periodsInTargetYear.includes(currentMonth)

    let targetMonth = currentMonth

    if (!isCurrentMonthAvailable && periodsInTargetYear.length > 0) {
      if (targetYear < activeYear) {
        // Moving to an earlier year - select the latest available month
        targetMonth = periodsInTargetYear[periodsInTargetYear.length - 1]
      }
      else {
        // Moving to a later year - select the earliest available month
        targetMonth = periodsInTargetYear[0]
      }
    }

    setMonthByPeriod({
      monthNumber: targetMonth,
      yearNumber: targetYear,
    })
  }

  const yearsList = useMemo(() => {
    return yearStatuses?.sort((a, b) => a.year - b.year)
      .map((y) => {
        return {
          value: `${y.year}`,
          label: `${y.year}`,
          badge: !y.completed && y.unresolvedTasks
            ? (
              <TaskStatusBadge
                status={y.unresolvedTasks ? BookkeepingPeriodStatus.IN_PROGRESS_AWAITING_CUSTOMER : BookkeepingPeriodStatus.CLOSED_COMPLETE}
                tasksCount={y.unresolvedTasks}
              />
            )
            : null,

        }
      })
  }, [yearStatuses])

  return (
    <Tabs
      name='bookkeeping-year'
      options={yearsList}
      selected={activeYear.toString()}
      onChange={year => setCurrentYear(year.target.value)}
    />
  )
}
