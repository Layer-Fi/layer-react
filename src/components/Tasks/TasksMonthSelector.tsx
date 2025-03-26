import { useMemo } from 'react'
import { getMonth, getYear, startOfMonth } from 'date-fns'
import { TasksMonthSelectorProps } from './types'
import { TaskMonthTile } from './TaskMonthTile'
import { useLayerContext } from '../../contexts/LayerContext'
import { getEarliestDateToBrowse } from '../../utils/business'
import { BookkeepingPeriod } from '../../hooks/bookkeeping/periods/useBookkeepingPeriods'

const DEFAULT_TASK_DATA = {
  total: 0,
  completed: 0,
  tasks: [],
}

const isCurrentMonth = (period: BookkeepingPeriod, currentDate: Date) =>
  getMonth(currentDate) === period.month && getYear(currentDate) === period.year

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

  // const months: MonthData[] = useMemo(() => {
  //   return Array.from({ length: 12 }, (_, i) => {
  //     const startDate = set(
  //       new Date(),
  //       { year, month: i, date: 1, hours: 0, minutes: 0, seconds: 0, milliseconds: 0 },
  //     )
  //     const endDate = endOfMonth(startDate)
  //     const disabled = (minDate && isBefore(startDate, minDate))
  //       || isAfter(startDate, startOfMonth(new Date()))
  //     const taskData = tasks?.find(x => x.month === i && x.year === year) ?? {
  //       monthStr: format(startDate, 'MMM'),
  //       year,
  //       month: i,
  //       startDate,
  //       endDate,
  //       ...DEFAULT_TASK_DATA,
  //     }
  //     return {
  //       monthStr: format(startDate, 'MMM'),
  //       startDate,
  //       endDate,
  //       disabled,
  //       ...taskData,
  //     }
  //   })
  // }, [tasks, year, minDate])

  return (
    <div className='Layer__tasks-month-selector'>
      {tasks?.map((month, idx) => {
        return (
          <TaskMonthTile
            key={idx}
            onClick={onClick}
            data={month}
            active={isCurrentMonth(month, currentDate)}
            // disabled={month.status === 'CLOSED_COMPLETE'}
          />
        )
      })}
    </div>
  )
}

export { TasksMonthSelector }
