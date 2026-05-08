import { useMemo } from 'react'
import { getMonth, getYear, set } from 'date-fns'

import { getCompletedTasks } from '@utils/bookkeeping/tasks/bookkeepingTasksFilters'
import { DateFormat } from '@utils/i18n/date/patterns'
import { BookkeepingPeriodStatus, useBookkeepingPeriods } from '@hooks/api/businesses/[business-id]/bookkeeping/periods/useBookkeepingPeriods'
import { useIntlFormatter } from '@hooks/utils/i18n/useIntlFormatter'
import { useGlobalDate, useGlobalDatePeriodAlignedActions } from '@providers/GlobalDateStore/GlobalDateStoreProvider'
import { TaskMonthTile } from '@components/Tasks/TaskMonthTile'
import { type MonthData } from '@components/Tasks/types'

function useActiveYearBookkeepingPeriods() {
  const { date } = useGlobalDate()
  const { data } = useBookkeepingPeriods()

  const activeYear = getYear(date)

  const periodsInActiveYear = useMemo(() => {
    return data?.filter(period => period.year === activeYear)
  }, [data, activeYear])

  return { periodsInActiveYear }
}

type TasksMonthSelectorProps = {
  isMobile: boolean
}

function TasksMonthSelector({ isMobile }: TasksMonthSelectorProps) {
  const { date } = useGlobalDate()
  const { formatDate } = useIntlFormatter()
  const { setMonthByPeriod } = useGlobalDatePeriodAlignedActions()

  const { periodsInActiveYear } = useActiveYearBookkeepingPeriods()

  const activeMonthNumber = getMonth(date) + 1
  const activeYear = getYear(date)

  const monthsData = useMemo(() => {
    return Array.from({ length: 12 }, (_, index) => {
      const date = set(
        new Date(),
        { year: activeYear, month: index, date: 1, hours: 0, minutes: 0, seconds: 0, milliseconds: 0 },
      )

      const existingTaskData = periodsInActiveYear?.find(({ month }) => month === index + 1)
      const taskData = existingTaskData
        ? {
          ...existingTaskData,
          disabled: false,
        }
        : {
          year: activeYear,
          month: index + 1,
          tasks: [],
          status: BookkeepingPeriodStatus.BOOKKEEPING_NOT_ACTIVE,
          disabled: true,
        }

      const total = taskData.tasks?.length ?? 0

      return {
        monthStr: formatDate(date, DateFormat.MonthShort),
        date,
        completed: getCompletedTasks(taskData.tasks).length,
        total,
        ...taskData,
      } satisfies MonthData
    })
  }, [activeYear, formatDate, periodsInActiveYear])

  return (
    <div className='Layer__tasks-month-selector'>
      {monthsData?.map((monthData, idx) => {
        return (
          <TaskMonthTile
            key={idx}
            onClick={() => setMonthByPeriod({
              yearNumber: monthData.year,
              monthNumber: monthData.month,
            })}
            data={monthData}
            active={monthData.month === activeMonthNumber}
            disabled={monthData.disabled}
            isMobile={isMobile}
          />
        )
      })}
    </div>
  )
}

export { TasksMonthSelector }
