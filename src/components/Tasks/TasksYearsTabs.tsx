import { useEffect, useState } from 'react'
import { Tabs } from '../Tabs'
import { useGlobalDateRange, useGlobalDateRangeActions } from '../../providers/GlobalDateStore/GlobalDateStoreProvider'

export const TasksYearsTabs = () => {
  const { start, end } = useGlobalDateRange()
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear().toString())
  const { setYear } = useGlobalDateRangeActions()

  useEffect(() => {
    setCurrentYear(end.getFullYear().toString())
  }, [end])

  return (
    <Tabs
      name='bookkeeping-year'
      options={[
        {
          label: '2023',
          value: '2023',
        },
        {
          label: '2024',
          value: '2024',
        },
        {
          label: '2025',
          value: '2025',
        }]}
      selected={currentYear}
      onChange={(year) => {
        setCurrentYear(year.target.value)
        setYear({ start: new Date(Number(year.target.value), 0, 1) })
      }}
    />
  )
}
