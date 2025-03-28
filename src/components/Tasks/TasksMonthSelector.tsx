import { useMemo } from 'react'
import { format, getMonth, getYear, isAfter, isBefore, set, startOfMonth } from 'date-fns'
import { MonthData } from './types'
import { TaskMonthTile } from './TaskMonthTile'
import { useLayerContext } from '../../contexts/LayerContext'
import { getEarliestDateToBrowse } from '../../utils/business'
import { useTasksContext } from './TasksContext'

const isCurrentMonth = (period: MonthData, currentDate: Date) =>
  getMonth(currentDate) === period.month - 1 && getYear(currentDate) === period.year

const TasksMonthSelector = () => {
  const { business } = useLayerContext()
  const { currentMonthDate, currentYearData, setCurrentMonthDate } = useTasksContext()

  const minDate = useMemo(() => {
    if (business) {
      const date = getEarliestDateToBrowse(business)
      if (date) {
        return startOfMonth(date)
      }
    }

    return
  }, [business])

  const monthsData = useMemo(() => {
    const year = getYear(currentMonthDate)
    return Array.from({ length: 12 }, (_, i) => {
      const date = set(
        new Date(),
        { year, month: i, date: 1, hours: 0, minutes: 0, seconds: 0, milliseconds: 0 },
      )
      const disabled = (minDate && isBefore(date, minDate))
        || isAfter(date, startOfMonth(new Date()))

      const taskData = currentYearData?.find(x => x.month === i + 1 && x.year === year) ?? {
        year,
        month: i + 1,
        total: 0,
        completed: 0,
        tasks: [],
      }

      return {
        monthStr: format(date, 'MMM'),
        date,
        disabled,
        ...taskData,
      } as MonthData
    })
  }, [currentYearData, currentMonthDate, minDate])

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
