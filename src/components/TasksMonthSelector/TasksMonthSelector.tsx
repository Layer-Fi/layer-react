import React, { useMemo } from 'react'
import { endOfMonth, format, getMonth, getYear, set } from 'date-fns'
import { MonthData, TasksMonthSelectorProps } from './types'
import { TaskMonthTile } from './TaskMonthTile'

const DEFAULT_TASK_DATA = {
    total: 0,
    completed: 0,
    tasks: [],
}

const isCurrentMonth = (monthDate: Date, currentDate: Date) =>
    getMonth(currentDate) === getMonth(monthDate) && getYear(currentDate) === getYear(monthDate)

const TasksMonthSelector = ({ tasks, currentDate, onClick }: TasksMonthSelectorProps) => {
    const year = getYear(currentDate)

    const months: MonthData[] = useMemo(() => {
        return Array.from({ length: 12 }, (_, i) => {
            const startDate = set(new Date(), { year, month: i, date: 1, hours: 0, minutes: 0, seconds: 0, milliseconds: 0 })
            const endDate = endOfMonth(startDate)
            const taskData = tasks?.find(x => x.month === i && x.year === year) ?? {
                monthStr: format(startDate, 'MMM'),
                year,
                month: i,
                startDate,
                endDate,
                ...DEFAULT_TASK_DATA,
            }
            return {
                monthStr: format(startDate, 'MMM'),
                startDate,
                endDate,
                ...taskData
            }
        })
    }, [tasks, year])

    return (
        <div className='Layer__tasks-month-selector'>
            {months.map((month, idx) => {
                return (
                    <TaskMonthTile
                        key={idx}
                        onClick={onClick}
                        monthData={month}
                        active={isCurrentMonth(month.startDate, currentDate)}
                    />
                )
            })}
        </div>
    )
}

export { TasksMonthSelector }


