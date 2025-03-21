import { useMemo } from 'react'
import { endOfMonth, format, getMonth, getYear, isAfter, isBefore, set, startOfMonth } from 'date-fns'
import { MonthData, TasksMonthSelectorProps } from './types'
import { TaskMonthTile } from './TaskMonthTile'
import { useLayerContext } from '../../contexts/LayerContext'
import { getEarliestDateToBrowse } from '../../utils/business'

const DEFAULT_TASK_DATA = {
  total: 0,
  completed: 0,
  tasks: [],
}

const isCurrentMonth = (monthDate: Date, currentDate: Date) =>
  getMonth(currentDate) === getMonth(monthDate) && getYear(currentDate) === getYear(monthDate)

const TasksMonthSelector = ({ tasks, year, currentDate, onClick }: TasksMonthSelectorProps) => {
  const { business } = useLayerContext()

  const minDate = useMemo(() => {
    if (business) {
      const date = getEarliestDateToBrowse(business)
      if (date) {
        return startOfMonth(date)
      }
    }

    return
  }, [business])

  const months: MonthData[] = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => {
      const startDate = set(
        new Date(),
        { year, month: i, date: 1, hours: 0, minutes: 0, seconds: 0, milliseconds: 0 },
      )
      const endDate = endOfMonth(startDate)
      const taskData = tasks?.find(x => x.month === i && x.year === year) ?? {
        monthStr: format(startDate, 'MMM'),
        year,
        month: i,
        startDate,
        endDate,
        ...DEFAULT_TASK_DATA,
      }

      const disabled = taskData.total === 0
        && ((minDate && isBefore(startDate, minDate))
          || isAfter(startDate, startOfMonth(new Date())))
      return {
        monthStr: format(startDate, 'MMM'),
        startDate,
        endDate,
        disabled,
        ...taskData,
      }
    })
  }, [tasks, year, minDate])

  return (
    <div className='Layer__tasks-month-selector'>
      {months.map((month, idx) => {
        return (
          <TaskMonthTile
            key={idx}
            onClick={onClick}
            monthData={month}
            active={isCurrentMonth(month.startDate, currentDate)}
            disabled={month.disabled}
          />
        )
      })}
    </div>
  )
}

export { TasksMonthSelector }
