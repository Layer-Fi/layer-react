import { useMemo } from 'react'
import { getMonth } from 'date-fns'

import { DateFormat } from '@utils/i18n/date/patterns'
import { BookkeepingPeriodStatus } from '@hooks/api/businesses/[business-id]/bookkeeping/periods/useBookkeepingPeriods'
import { useBookkeepingYearsStatus } from '@hooks/features/bookkeeping/useBookkeepingYearsStatus'
import { useIntlFormatter } from '@hooks/utils/i18n/useIntlFormatter'
import { useGlobalDate, useGlobalDatePeriodAlignedActions } from '@providers/GlobalDateStore/GlobalDateStoreProvider'
import { Tabs } from '@components/Tabs/Tabs'
import { TaskStatusBadge } from '@components/Tasks/TaskStatusBadge'

export const TasksYearsTabs = () => {
  const { date } = useGlobalDate()
  const { setMonthByPeriod } = useGlobalDatePeriodAlignedActions()
  const { formatDate } = useIntlFormatter()

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
          label: formatDate(new Date(y.year, 0, 1), DateFormat.Year),
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
  }, [formatDate, yearStatuses])

  return (
    <Tabs
      name='bookkeeping-year'
      options={yearsList}
      selected={activeYear.toString()}
      onChange={year => setCurrentYear(year.target.value)}
    />
  )
}
