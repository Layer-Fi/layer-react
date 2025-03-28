import { useMemo } from 'react'
import { Tabs } from '../Tabs'
import { useTasksContext } from './TasksContext'
import { getDay, getMonth, getYear } from 'date-fns'

export const TasksYearsTabs = () => {
  const { currentMonthDate, setCurrentMonthDate, activationDate } = useTasksContext()

  const currentYear = getYear(currentMonthDate)

  const setCurrentYear = (year: string) => {
    const currentMonth = getMonth(currentMonthDate)
    const currentDay = getDay(currentMonthDate)
    setCurrentMonthDate(new Date(Number(year), currentMonth, currentDay))
  }

  const yearsList = useMemo(() => {
    const startYear = getYear(activationDate ?? new Date())
    const currentYear: number = new Date().getFullYear()
    const count: number = currentYear - startYear + 1

    return Array.from({ length: count }, (_, index) => ({
      label: `${startYear + index}`,
      value: `${startYear + index}`,
    }))
  }, [activationDate])

  return (
    <Tabs
      name='bookkeeping-year'
      options={yearsList}
      selected={currentYear.toString()}
      onChange={year => setCurrentYear(year.target.value)}
    />
  )
}
