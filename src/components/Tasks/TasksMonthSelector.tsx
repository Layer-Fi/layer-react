import { useMemo } from 'react'
import { format, getMonth, getYear, set } from 'date-fns'
import { MonthData } from './types'
import { TaskMonthTile } from './TaskMonthTile'
import { useTasksContext } from './TasksContext'
import { getCompletedTasks } from '../../utils/bookkeeping/tasks/bookkeepingTasksFilters'

const isCurrentMonth = (period: MonthData, currentDate: Date) =>
  getMonth(currentDate) === period.month - 1 && getYear(currentDate) === period.year

const TasksMonthSelector = () => {
  const { currentMonthDate, currentYearData, setCurrentMonthDate } = useTasksContext()

  const monthsData = useMemo(() => {
    const year = getYear(currentMonthDate)

    return Array.from({ length: 12 }, (_, i) => {
      const date = set(
        new Date(),
        { year, month: i, date: 1, hours: 0, minutes: 0, seconds: 0, milliseconds: 0 },
      )

      const existingTaskData = currentYearData?.find(x => x.month === i + 1 && x.year === year)
      const taskData = existingTaskData
        ? {
          ...existingTaskData,
          disabled: existingTaskData.status === 'BOOKKEEPING_NOT_PURCHASED',
        }
        : {
          year,
          month: i + 1,
          tasks: [],
          status: 'BOOKKEEPING_NOT_PURCHASED' as const,
          disabled: true,
        }

      const total: number = taskData.tasks?.length || 0

      return {
        monthStr: format(date, 'MMM'),
        date,
        completed: getCompletedTasks(taskData.tasks).length,
        total,
        ...taskData,
      } satisfies MonthData
    })
  }, [currentYearData, currentMonthDate])

  return (
    <div className='Layer__tasks-month-selector'>
      {monthsData?.map((monthData, idx) => {
        return (
          <TaskMonthTile
            key={idx}
            onClick={setCurrentMonthDate}
            data={monthData}
            active={isCurrentMonth(monthData, currentMonthDate)}
            disabled={monthData.disabled}
          />
        )
      })}
    </div>
  )
}

export { TasksMonthSelector }
