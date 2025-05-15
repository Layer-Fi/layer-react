import { useMemo } from 'react'
import { Tabs } from '../Tabs/Tabs'
import { useBookkeepingYearsStatus } from '../../hooks/bookkeeping/periods/useBookkeepingYearsStatus'
import { TaskStatusBadge } from './TaskStatusBadge'
import { useGlobalDate, useGlobalDatePeriodAlignedActions } from '../../providers/GlobalDateStore/GlobalDateStoreProvider'
import { getMonth } from 'date-fns'
import { BookkeepingPeriodStatus } from '../../hooks/bookkeeping/periods/useBookkeepingPeriods'

export const TasksYearsTabs = () => {
  const { date } = useGlobalDate()
  const { setMonthByPeriod } = useGlobalDatePeriodAlignedActions()

  const activeYear = date.getFullYear()

  const { yearStatuses } = useBookkeepingYearsStatus()

  const setCurrentYear = (year: string) => {
    const currentMonth = getMonth(date)

    setMonthByPeriod({
      monthNumber: currentMonth + 1,
      yearNumber: Number(year),
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
