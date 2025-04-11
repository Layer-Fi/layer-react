import { useMemo } from 'react'
import { format, getMonth, getYear, set } from 'date-fns'
import { MonthData } from './types'
import { TaskMonthTile } from './TaskMonthTile'
import { getCompletedTasks } from '../../utils/bookkeeping/tasks/bookkeepingTasksFilters'
import { useBookkeepingPeriods } from '../../hooks/bookkeeping/periods/useBookkeepingPeriods'
import { useGlobalDate, useGlobalDatePeriodAlignedActions } from '../../providers/GlobalDateStore/GlobalDateStoreProvider'

function useActiveYearBookkeepingPeriods() {
  const { date } = useGlobalDate()
  const { data } = useBookkeepingPeriods()

  const activeYear = getYear(date)

  const periodsInActiveYear = useMemo(() => {
    return data?.filter(period => period.year === activeYear)
  }, [data, activeYear])

  return { periodsInActiveYear }
}

function TasksMonthSelector() {
  const { date } = useGlobalDate()
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
          status: 'BOOKKEEPING_NOT_ACTIVE' as const,
          disabled: true,
        }

      const total = taskData.tasks?.length ?? 0

      return {
        monthStr: format(date, 'MMM'),
        date,
        completed: getCompletedTasks(taskData.tasks).length,
        total,
        ...taskData,
      } satisfies MonthData
    })
  }, [periodsInActiveYear, activeYear])

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
          />
        )
      })}
    </div>
  )
}

export { TasksMonthSelector }
