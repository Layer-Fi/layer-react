import { useMemo } from 'react'
import { Tabs } from '../Tabs/Tabs'
import { useTasksContext } from './TasksContext'
import { getDay, getMonth, getYear } from 'date-fns'
import { useBookkeepingYearsStatus } from '../../hooks/bookkeeping/periods/useBookkeepingYearsStatus'
import { TaskStatusBadge } from './TaskStatusBadge'

export const TasksYearsTabs = () => {
  const { currentMonthDate, setCurrentMonthDate } = useTasksContext()
  const { yearStatuses } = useBookkeepingYearsStatus()

  const currentYear = getYear(currentMonthDate)

  const setCurrentYear = (year: string) => {
    const currentMonth = getMonth(currentMonthDate)
    const currentDay = getDay(currentMonthDate)
    setCurrentMonthDate(new Date(Number(year), currentMonth, currentDay))
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
                status={y.unresolvedTasks ? 'IN_PROGRESS_AWAITING_CUSTOMER' : 'CLOSED_COMPLETE'}
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
      selected={currentYear.toString()}
      onChange={year => setCurrentYear(year.target.value)}
    />
  )
}
